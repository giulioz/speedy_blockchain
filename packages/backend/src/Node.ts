import {
  Blockchain,
  Peer,
  Transaction,
  utils,
  Block,
  CarrierRequest,
  FlightsRequest,
  Flight,
  CarrierData,
  RouteData,
  RouteRequest
} from "@speedy_blockchain/common";
import { IncomingPeer } from "@speedy_blockchain/common/src/Peer";

import SimpleAsyncMiner from "./SimpleAsyncMiner";
import WorkerAsyncMiner from "./WorkerAsyncMiner";
import * as db from "./db";
import * as NodeCommunication from "./NodeCommunication";

const miningTimeoutTime = 1000;
const commTimeoutTime = 1000;

// Manages the blockchain, mining and communication with peers
export default class Node {
  public currentBlockchain: Blockchain = new Blockchain();
  public peers: Peer[] = [];

  private miningTimeout: NodeJS.Timeout | null = null;
  private commTimeout: NodeJS.Timeout | null = null;

  // private handleReschedule = (transactions: Transaction[]) => {
  //   transactions.forEach(t =>
  //     this.currentBlockchain.pushTransaction(t, this.miner)
  //   );
  // };
  // miner = new WorkerAsyncMiner(this.handleReschedule);
  miner = new SimpleAsyncMiner();

  public async initCommunication() {
    let retry = 0;

    while (retry < 4) {
      await NodeCommunication.announcement(this.peers);
      await this.refreshPeers();

      const done = await NodeCommunication.initialBlockDownload(
        this.peers,
        this.currentBlockchain,
        this.miner
      );

      if (!done) {
        console.warn("Retriyng...");
        retry += 1;
        await utils.sleep(1000);
      } else {
        return;
      }
    }

    console.warn(
      "No peer to perform IBD after several retries. Assuming master node..."
    );
  }

  public async rehydrateBlocksFromDB() {
    const dbBlocks = await db.fetchAll();
    const blocks = dbBlocks.map(b => b.value);

    // non deve inziare a minare finchè non ha finito di prendersi i blocchi dal DB.
    if (blocks.length > 0) {
      this.currentBlockchain.replaceChain(blocks);
    } else {
      this.currentBlockchain.pushGenesisBlock();
      db.insert(this.currentBlockchain.lastBlock);
    }
  }

  public addPeer(peer: IncomingPeer) {
    const found = this.peers.find(
      p => p.hostname === peer.hostname && p.port === peer.port
    );

    if (!found) {
      const newPeers: Peer = { ...peer, active: true, checkedAt: Date.now() };
      this.peers = [...this.peers, newPeers];
    } else {
      this.peers = this.peers.map(p =>
        p.hostname === peer.hostname && p.port === peer.port
          ? { ...p, active: true, checkedAt: Date.now() }
          : p
      );
    }
  }

  public async refreshPeers() {
    if (!NodeCommunication.isSuperBlock && this.peers.length === 0) {
      this.peers = [NodeCommunication.getDiscoveryPeer()];
    }

    const myself = NodeCommunication.getSelfPeer();
    const remotePeers = await NodeCommunication.fetchRemotePeers(this.peers);
    const excludedMyself = remotePeers.filter(
      p => p.hostname !== myself.hostname || p.port !== myself.port
    );

    this.peers = excludedMyself.map(p => ({
      ...p,
      checkedAt: Date.now(),
      active: true,
    }));
  }

  public async addBlock(block: Block) {
    if (this.currentBlockchain.addBlock(block, this.miner)) {
      db.insert(block);
      return true;
    }

    return false;
  }

  public async pushTransaction(t: Transaction) {
    if (this.currentBlockchain.pushTransaction(t, this.miner)) {
      NodeCommunication.announceTransaction(this.peers, t);
    }
  }

  public async pushTransactionContent(f: Transaction["content"]) {
    const transaction = this.currentBlockchain.pushTransactionContent(
      f,
      this.miner
    );

    if (transaction) {
      NodeCommunication.announceTransaction(this.peers, transaction);
    }
  }

  public startLoop() {
    this.miningUpdate();
    this.commUpdate();
  }

  public stopLoop() {
    if (this.miningTimeout) {
      clearTimeout(this.miningTimeout);
    }
    if (this.commTimeout) {
      clearTimeout(this.commTimeout);
    }
  }

  private async miningUpdate() {
    const minedBlock = await this.currentBlockchain.tryMineNextBlock(
      this.miner,
      NodeCommunication.getSelfPeer().name
    );

    if (minedBlock) {
      await Promise.all([
        db.insert(minedBlock),
        NodeCommunication.announceBlock(this.peers, minedBlock),
      ]);
    }

    this.miningTimeout = setTimeout(
      () => this.miningUpdate(),
      miningTimeoutTime
    );
  }

  private async commUpdate() {
    await this.refreshPeers();
    await NodeCommunication.announcement(this.peers);

    this.commTimeout = setTimeout(() => this.commUpdate(), commTimeoutTime);
  }

  public async queryCarrier(query: CarrierRequest): Promise<CarrierData> {
    const returnObj: CarrierData = {
      OP_CARRIER_AIRLINE_ID: query.OP_CARRIER_AIRLINE_ID,
      AVERAGE_DELAY: 0,
      MAX_DELAY: -99999999,
      MIN_DELAY: 99999999,
      TOTAL_NUMBER_OF_FLIGHTS: 0,
      DELAYED_FLIGHTS: 0,
      FLIGHTS_IN_ADVANCE: 0, // TOTAL_NUMBER_OF_FLIGHTS - DELAYED_FLIGHTS - FLIGHTS THAT HAS ARRIVED RIGHT
    };

    const dateTo = query.DATE_TO;
    const dateFrom = query.DATE_FROM;
    let delaySum = 0;

    this.currentBlockchain.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        {
          const insideTime =
            transaction.content.FL_DATE >= dateFrom &&
            transaction.content.FL_DATE <= dateTo;

          const sameAirline =
            transaction.content.OP_CARRIER_AIRLINE_ID ===
            query.OP_CARRIER_AIRLINE_ID;

          if (insideTime && sameAirline) {
            returnObj.TOTAL_NUMBER_OF_FLIGHTS += 1;

            const delay = Number(transaction.content.ARR_DELAY);
            delaySum += delay;
            if (delay > returnObj.MAX_DELAY) {
              returnObj.MAX_DELAY = delay;
            }
            if (delay < returnObj.MIN_DELAY) {
              returnObj.MIN_DELAY = delay;
            }

            if (delay > 0) {
              returnObj.DELAYED_FLIGHTS += 1;
            } else if (delay < 0) {
              returnObj.FLIGHTS_IN_ADVANCE += 1;
            }
          }
        }
      });
    });

    returnObj.AVERAGE_DELAY = delaySum / returnObj.TOTAL_NUMBER_OF_FLIGHTS;

    return returnObj;
  }

  public async queryFlights(query: FlightsRequest): Promise<Flight[]> {
    const queryResult: Flight[] = [];

    this.currentBlockchain.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        if (
          query.OP_CARRIER_FL_NUM === transaction.content.OP_CARRIER_FL_NUM &&
          query.FL_DATE === transaction.content.FL_DATE
        ) {
          queryResult.push(transaction.content);
        }
      });
    });

    return queryResult;
  }

  public async queryRoute(query: RouteRequest): Promise<RouteData> {
    // QUERY: DATE_TO, DATE_FROM, CITY_A, CITY_B
    // DATE_TO and DATE_FROM could be  not mandatory.
    const queryResult: Flight[] = [];
    const dateTo = query["DATE_TO"];
    const dateFrom = query["DATE_FROM"];
    const cityA = query["CITY_A"];
    const cityB = query["CITY_B"];
    const returnObj: any = {
      OP_CARRIER_AIRLINE_ID: query["OP_CARRIER_AIRLINE_ID"],
      TOTAL_NUMBER_OF_FLIGHTS: 0,
      DELAYED_FLIGHTS: 0,
      FLIGHTS_IN_ADVANCE: 0, // TOTAL_NUMBER_OF_FLIGHTS - DELAYED_FLIGHTS - FLIGHTS THAT HAS ARRIVED RIGHT
      CITY_A: cityA,
      CITY_B: cityB,
      MAX_DELAY: -99999999,
      MIN_DELAY: 99999999,
      FLIGHTS: []
    };
    let delaySum = 0;
    this.currentBlockchain.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        // check carrier name
        const insideTime =
          (!dateFrom || transaction.content["FL_DATE"] >= dateFrom) &&
          (!dateTo || transaction.content["FL_DATE"] <= dateTo);

        const sameAirline =
          transaction.content["OP_CARRIER_AIRLINE_ID"] ===
          query["OP_CARRIER_AIRLINE_ID"];
        const sameRoute = 
          (!cityA || transaction.content["ORIGIN_CITY_NAME"] === cityA || transaction.content["DEST_CITY_NAME"] === cityA) && 
          (!cityB || transaction.content["ORIGIN_CITY_NAME"] === cityB || transaction.content["DEST_CITY_NAME"] === cityB);
        if (insideTime && sameAirline && sameRoute) {
          queryResult.push(transaction.content);
          returnObj['TOTAL_NUMBER_OF_FLIGHTS'] += 1;
          const delay = Number(transaction.content["ARR_DELAY"]);
          delaySum += delay;
          if (delay > returnObj["MAX_DELAY"]) {
            returnObj["MAX_DELAY"] = delay;
          }
          if (delay < returnObj["MIN_DELAY"]) {
            returnObj["MIN_DELAY"] = delay;
          }

          if (delay > 0) {
            returnObj["DELAYED_FLIGHTS"] += 1;
          } else if (delay < 0) {
            returnObj["FLIGHTS_IN_ADVANCE"] += 1;
          }
      }
      });
    });
    returnObj["AVERAGE_DELAY"] =
      delaySum / returnObj["TOTAL_NUMBER_OF_FLIGHTS"];
      returnObj["FLIGHTS"] = queryResult;
    return returnObj;
  }
}

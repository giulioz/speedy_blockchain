import { v4 as uuidv4 } from "uuid";

import {
  Peer,
  Transaction,
  utils,
  Block,
  CarrierRequest,
  FlightsRequest,
  Flight,
  CarrierData,
  RouteData,
  RouteRequest,
  UnhashedBlock,
  isValidBlock,
  createGenesisBlock,
} from "@speedy_blockchain/common";
import { IncomingPeer } from "@speedy_blockchain/common/src/Peer";

import SimpleAsyncMiner from "./SimpleAsyncMiner";
import WorkerAsyncMiner from "./WorkerAsyncMiner";
import * as db from "./db";
import * as NodeCommunication from "./NodeCommunication";

const miningTimeoutTime = 1000;
const commTimeoutTime = 1000;

async function checkChainValidity(blockLength: number) {
  let result = true;
  let previousHash = "0";

  let transactionCount = 0;

  for (let index = 0; index < blockLength; index++) {
    const block = await db.getBlock(index);
    if (!isValidBlock(block) || previousHash !== block.previousHash) {
      // result = false;

      // Early Exit
      return false;
    }

    transactionCount += block.transactions.length;

    previousHash = block.hash;
  }

  return result ? transactionCount : false;
}

// Manages the blockchain, mining and communication with peers
export default class Node {
  unconfirmedTransactions: Transaction[] = [];
  blocksCount: number = 0;
  transactionCount: number = 0;

  public peers: Peer[] = [];

  private miningTimeout: NodeJS.Timeout | null = null;
  private commTimeout: NodeJS.Timeout | null = null;

  miner = new SimpleAsyncMiner();

  public async initCommunication() {
    let retry = 0;

    while (retry < 3) {
      await NodeCommunication.announcement(this.peers);
      await this.refreshPeers();

      const done = await NodeCommunication.initialBlockDownload(this);

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
    const meta = await db.getMeta();
    this.blocksCount = meta.blockLength;

    if (meta.blockLength > 0) {
      // Validate the chain
      const nTransactions = await checkChainValidity(meta.blockLength);

      if (nTransactions === false) {
        throw new Error("Invalid replacement chain!");
      }

      this.transactionCount = nTransactions;
    } else {
      console.log("Empty chain, adding genesis block");
      this.addBlock(createGenesisBlock());
    }
  }

  public async getLastBlock() {
    if (this.blocksCount === 0) {
      return createGenesisBlock();
    }

    return db.getBlock(this.blocksCount - 1);
  }

  async findBlockById(blockId: Block["index"]) {
    return db.getBlock(blockId);
  }

  async getBlocksRange(startId: number, endId: number) {
    return Promise.all(
      new Array(endId - startId + 1)
        .fill(0)
        .map((e, i) => this.findBlockById(i + startId))
    );
  }

  async findTransactionById(
    transactionId: Transaction["id"],
    blockId: Block["index"] | null = null
  ): Promise<Transaction | null> {
    // We already have the block id (overload)
    if (blockId !== null) {
      const block = await this.findBlockById(blockId);

      if (block) {
        const transaction = block.transactions.find(
          t => t.id === transactionId
        );
        return transaction || null;
      }

      return null;
    }

    // We don't have the block id, search on anything
    const transaction = await Promise.race(
      new Array(this.blocksCount).map(async (trash, i) => {
        const block = await this.findBlockById(i);
        const transaction = block.transactions.find(
          t => t.id === transactionId
        );

        if (transaction) {
          return transaction;
        }

        Promise.reject();
      })
    );

    return transaction || null;
  }

  public async addBlock(block: Block) {
    if (block.index < this.blocksCount) {
      console.warn(new Error(`Block before the end of the chain, aborting`));
      return false;
    }

    const isGenesisBlock = block.index === 0;
    const lastBlock = await this.getLastBlock();
    const previousHash = lastBlock.hash;

    if (!isGenesisBlock && previousHash !== block.previousHash) {
      console.warn(new Error(`Invalid previousHash, aborting`));
      return false;
    }

    if (!isValidBlock(block)) {
      console.warn(new Error(`Trying to add an invalid block, aborting`));
      return false;
    }

    await db.insert(block);
    this.blocksCount += 1;
    await db.saveMeta({ blockLength: this.blocksCount });

    // remove from unconfirmedTransactions the transactions of the block
    this.unconfirmedTransactions = this.unconfirmedTransactions.filter(
      tr => !block.transactions.find(t => t.id === tr.id)
    );

    // ...and remove also from the miner
    await this.miner.notifyTransactionsRemoved(block.transactions);

    // update transactionCount
    this.transactionCount += block.transactions.length;

    return true;
  }

  async tryMineNextBlock(minerName: string) {
    if (
      !this.unconfirmedTransactions ||
      this.unconfirmedTransactions.length === 0
    ) {
      return false;
    }

    const lastBlock = await this.getLastBlock();

    const transactionsToValidate: Transaction[] = [
      ...this.unconfirmedTransactions,
    ];

    const unhashedBlock: UnhashedBlock = {
      index: lastBlock.index + 1,
      transactions: transactionsToValidate,
      timestamp: utils.getTimestamp(),
      previousHash: lastBlock.hash,
      nonce: 0,
      minedBy: minerName,
    };

    const block = await this.miner.mine(unhashedBlock);
    await this.addBlock(block);
    return block;
  }

  public async pushTransaction(transaction: Transaction) {
    const insertedInMining = await this.miner.notifyNewTransaction(transaction);
    if (insertedInMining) {
      // PERF: consider not awaiting
      await NodeCommunication.announceTransaction(this.peers, transaction);

      return true;
    }

    const notPresentInUnconfirmed = !this.unconfirmedTransactions.find(
      t => t.id === transaction.id
    );
    if (notPresentInUnconfirmed) {
      this.unconfirmedTransactions.push(transaction);

      // PERF: consider not awaiting
      await NodeCommunication.announceTransaction(this.peers, transaction);

      return true;
    }

    return false;
  }

  public async pushTransactionContent(content: Transaction["content"]) {
    const transaction: Transaction = {
      id: uuidv4(),
      timestamp: utils.getTimestamp(),
      content,
    };

    const inserted = await this.pushTransaction(transaction);

    if (inserted) {
      await NodeCommunication.announceTransaction(this.peers, transaction);
    }
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
    const blockchainIterator = new db.BlockchainIterator(this.blocksCount);
    for (const block of blockchainIterator) {
      (await block).transactions.forEach(transaction => {
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
      });
    }
    returnObj.AVERAGE_DELAY = delaySum / returnObj.TOTAL_NUMBER_OF_FLIGHTS;
    return returnObj;
  }

  public async queryFlights(query: FlightsRequest): Promise<Flight[]> {
    const queryResult: Flight[] = [];
    const blockchainIterator = new db.BlockchainIterator(this.blocksCount);
    for (const block of blockchainIterator) {
      (await block).transactions.forEach(transaction => {
        if (
          query.OP_CARRIER_FL_NUM === transaction.content.OP_CARRIER_FL_NUM &&
          query.FL_DATE === transaction.content.FL_DATE
        ) {
          queryResult.push(transaction.content);
        }
      });
    }
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
      TOTAL_NUMBER_OF_FLIGHTS: 0,
      DELAYED_FLIGHTS: 0,
      FLIGHTS_IN_ADVANCE: 0, // TOTAL_NUMBER_OF_FLIGHTS - DELAYED_FLIGHTS - FLIGHTS THAT HAS ARRIVED RIGHT
      CITY_A: cityA,
      CITY_B: cityB,
      MAX_DELAY: -99999999,
      MIN_DELAY: 99999999,
      FLIGHTS: [],
    };
    let delaySum = 0;
    const blockchainIterator = new db.BlockchainIterator(this.blocksCount);
    for (const block of blockchainIterator) {
      (await block).transactions.forEach(transaction => {
        // check carrier name
        const insideTime =
          (!dateFrom || transaction.content["FL_DATE"] >= dateFrom) &&
          (!dateTo || transaction.content["FL_DATE"] <= dateTo);

        const sameRoute =
          (!cityA ||
            transaction.content["ORIGIN_CITY_NAME"] === cityA ||
            transaction.content["DEST_CITY_NAME"] === cityA) &&
          (!cityB ||
            transaction.content["ORIGIN_CITY_NAME"] === cityB ||
            transaction.content["DEST_CITY_NAME"] === cityB);
        if (insideTime && sameRoute) {
          queryResult.push(transaction.content);
          returnObj["TOTAL_NUMBER_OF_FLIGHTS"] += 1;
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
    }
    returnObj["AVERAGE_DELAY"] =
      delaySum / returnObj["TOTAL_NUMBER_OF_FLIGHTS"];
    returnObj["FLIGHTS"] = queryResult;
    return returnObj;
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

  private async miningUpdate() {
    const minedBlock = await this.tryMineNextBlock(
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
}

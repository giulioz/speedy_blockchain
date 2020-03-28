import {
  Blockchain,
  Peer,
  Transaction,
  utils,
  Block,
  CarrierRequest,
  FlightRequest as FlightsRequest,
  Flight,
  CarrierData,
} from "@speedy_blockchain/common";
import { IncomingPeer } from "@speedy_blockchain/common/src/Peer";

import WorkerAsyncMiner from "./WorkerAsyncMiner";
import * as db from "./db";
import * as NodeCommunication from "./NodeCommunication";

const miningTimeoutTime = 1000;
const commTimeoutTime = 1000;

const miner = new WorkerAsyncMiner();

// Manages the blockchain, mining and communication with peers
export default class Node {
  public currentBlockchain: Blockchain = new Blockchain();
  public peers: Peer[] = [];

  private miningTimeout: NodeJS.Timeout | null = null;
  private commTimeout: NodeJS.Timeout | null = null;

  public async initCommunication() {
    let retry = 0;

    while (retry < 4) {
      await NodeCommunication.announcement(this.peers);
      await this.refreshPeers();

      const done = await NodeCommunication.initialBlockDownload(
        this.peers,
        this.currentBlockchain,
        miner
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
    if (this.currentBlockchain.addBlock(block, miner)) {
      db.insert(block);
      return true;
    }

    return false;
  }

  public async pushTransaction(t: Transaction) {
    if (this.currentBlockchain.pushTransaction(t, miner)) {
      NodeCommunication.announceTransaction(this.peers, t);
    }
  }

  public async pushTransactionContent(f: Transaction["content"]) {
    const transaction = this.currentBlockchain.pushTransactionContent(f, miner);

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
      miner,
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
    return {
      OP_CARRIER_AIRLINE_ID: "",
      AVERAGE_DELAY: 0,
      TOTAL_NUMBER_OF_FLIGHTS: 0,
      DELAYED_FLIGHTS: 0,
      FLIGHTS_IN_ADVANCE: 0,
    };
  }

  public async queryFlights(query: FlightsRequest): Promise<Flight[]> {
    return [];
  }
}

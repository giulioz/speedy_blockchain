import {
  Blockchain,
  Peer,
  PeersState,
  Transaction,
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
    await NodeCommunication.announcement(this.peers);
  }

  public async rehydrateBlocksFromDB() {
    const dbBlocks = await db.fetchAll();
    const blocks = dbBlocks.map(b => b.value);

    // // non deve inziare a minare finchè non ha finito di prendersi i blocchi dal DB.
    // if (blocks.length > 0) {
    //   this.currentBlockchain.replaceChain(blocks);
    // } else if (this.superPeer) {
    //   // solo il superPeer crea il genesis block.
    //   this.currentBlockchain.pushGenesisBlock();
    //   db.insert(this.currentBlockchain.lastBlock);
    // }
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

  public pushTransaction(t: Transaction["content"]) {
    this.currentBlockchain.pushTransaction(t, miner);
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
    const minedBlock = await this.currentBlockchain.tryMineNextBlock(miner);
    if (minedBlock) {
      db.insert(minedBlock);
    }

    // TODO: Announce new block
    // TODO: Save the block to DB

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

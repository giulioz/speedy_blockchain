import { Blockchain, Peer } from "@speedy_blockchain/common";
import WorkerAsyncMiner from "./WorkerAsyncMiner";

const updateTimeout = 1000;

const miner = new WorkerAsyncMiner();

// Manages the blockchain, mining and communication with peers
export default class Node {
  public currentBlockchain: Blockchain;
  public peers: Peer[] = [];

  private updateTimeout: NodeJS.Timeout;

  constructor() {
    this.currentBlockchain = new Blockchain();
    this.currentBlockchain.pushGenesisBlock();
  }

  public startMiningLoop() {
    this.periodicUpdate();
  }

  public stopMiningLoop() {
    clearTimeout(this.updateTimeout);
  }

  // Ran every timeout
  private periodicUpdate() {
    this.currentBlockchain.tryMineNextBlock(miner);

    // TODO: Announce new block
    // TODO: Save the block to DB

    this.updateTimeout = setTimeout(() => this.periodicUpdate(), updateTimeout);
  }
}

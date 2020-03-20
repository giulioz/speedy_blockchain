import { Blockchain, Peer, PeersState } from "@speedy_blockchain/common";
import WorkerAsyncMiner from "./WorkerAsyncMiner";
import * as db from "./db";
const updateTimeout = 1000;

const miner = new WorkerAsyncMiner();

// Manages the blockchain, mining and communication with peers
export default class Node {
  public currentBlockchain: Blockchain;
  public peersState: PeersState;

  private updateTimeout: NodeJS.Timeout;

  constructor() {
    this.currentBlockchain = new Blockchain();
    this.peersState = new PeersState();
    this.peersState.insertPeer(this.getPeerObj())
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

  public startMiningLoop() {
    this.periodicUpdate();
  }

  public stopMiningLoop() {
    clearTimeout(this.updateTimeout);
  }

  private getPeerObj() : Peer{
    return {
      ip: process.env.NODE_HOST,
      port: parseInt(process.env.NODE_PORT),
      name: process.env.MINER_NAME,
      active: true,
      superPeer: process.env.SUPER_PEER_NAME === process.env.MINER_NAME, // maybe we can remove the superPeer var here.
      checkedAt: Date.now()
    }
  }
  
  // Ran every timeout
  private async periodicUpdate() {
    const minedBlock = await this.currentBlockchain.tryMineNextBlock(miner);
    if (minedBlock) {
      db.insert(minedBlock);
    }

    // TODO: Announce new block
    // TODO: Save the block to DB

    this.updateTimeout = setTimeout(() => this.periodicUpdate(), updateTimeout);
  }
}

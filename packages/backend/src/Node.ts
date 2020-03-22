import {
  Blockchain,
  Peer,
  PeersState,
  Transaction,
} from "@speedy_blockchain/common";
import WorkerAsyncMiner from "./WorkerAsyncMiner";
import * as db from "./db";
import * as NodeCommunication from "./NodeCommunication";

const updateTimeout = 1000;

const miner = new WorkerAsyncMiner();

function getPeerObj(): Peer {
  return {
    ip: process.env.NODE_HOST || "",
    port: parseInt(process.env.NODE_PORT || "", 10),
    name: process.env.MINER_NAME || "",
    active: true,
    superPeer:
      process.env.LEADER_HOST === process.env.NODE_HOST &&
      process.env.LEADER_PORT === process.env.NODE_PORT, // maybe we can remove the superPeer var here.
    checkedAt: Date.now(),
  };
}

// Manages the blockchain, mining and communication with peers
export default class Node {
  public currentBlockchain: Blockchain;

  public peersState: PeersState;

  private updateTimeout: NodeJS.Timeout | null = null;

  public superPeer: boolean;

  constructor() {
    const currentPeer: Peer = getPeerObj();
    this.currentBlockchain = new Blockchain();
    this.peersState = new PeersState();
    this.superPeer = currentPeer.superPeer;
    this.peersState.insertPeer(currentPeer);
  }

  public async initCommunication() {
    if (!this.superPeer) {
      await NodeCommunication.registerNodeToSuperPeer();
      // await NodeCommunication.getPeersFromSuperPeer();
      // await NodeCommunication.notifyAll();

      const lastBlock = await NodeCommunication.getLastBlockFromSuperPeer();
      if (lastBlock === "Block not found.") {
        throw new Error("No last block from super peer.");
      }

      this.currentBlockchain.chain = [lastBlock]; // TODO: only for test - fix this
      // await NodeCommunication.getDBFromSuperPeer();
    }
  }

  public async rehydrateBlocksFromDB() {
    const dbBlocks = await db.fetchAll();
    const blocks = dbBlocks.map(b => b.value);

    // non deve inziare a minare finchè non ha finito di prendersi i blocchi dal DB.
    if (blocks.length > 0) {
      this.currentBlockchain.replaceChain(blocks);
    } else if (this.superPeer) {
      // solo il superPeer crea il genesis block.
      this.currentBlockchain.pushGenesisBlock();
      db.insert(this.currentBlockchain.lastBlock);
    }
  }

  public startMiningLoop() {
    this.periodicUpdate();
  }

  public stopMiningLoop() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
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

  public pushTransaction(t: Transaction["content"]) {
    this.currentBlockchain.pushTransaction(t, miner);
  }
}

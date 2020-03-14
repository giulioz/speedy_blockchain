import {
  Blockchain,
  ChainState,
  Block,
  Transaction
} from "@speedy_blockchain/common";
import { getTimestamp } from "@speedy_blockchain/common/dist/utils";
import WorkerAsyncMiner from "./WorkerAsyncMiner";

const updateTimeout = 1000;

const miner = new WorkerAsyncMiner();

export default class Node {
  private currentBlockchain: Blockchain;
  private peers: Set<string>;
  private updateTimeout: NodeJS.Timeout;

  constructor() {
    this.currentBlockchain = new Blockchain();
    this.currentBlockchain.pushGenesisBlock();

    this.peers = new Set([]);
  }

  public startMiningLoop() {
    this.periodicUpdate();
  }

  public stopMiningLoop() {
    clearTimeout(this.updateTimeout);
  }

  // Ran every timeout
  private periodicUpdate() {
    this.currentBlockchain.mineNextBlock(miner);

    // TODO: Announce new block
    // TODO: Save the block to DB

    this.updateTimeout = setTimeout(() => this.periodicUpdate(), updateTimeout);
  }

  // Builds and add a new transaction to the blockchain, inserting the transaction metadata
  public pushTransaction(data: Transaction["content"]) {
    const transaction: Transaction = {
      timestamp: getTimestamp(),
      content: data
    };

    this.currentBlockchain.addNewTransaction(transaction);
  }

  // Push a new block to the chain
  public pushNewBlock(block: Block) {
    // TODO: Consensus

    this.currentBlockchain.addBlock(block);

    // TODO: Save to DB
  }

  public getChain(): ChainState {
    const chain: Block[] = [];
    this.currentBlockchain.chain.forEach(block => chain.push(block));

    return {
      length: chain.length,
      chain,
      peers: [...this.peers]
    };
  }

  private setFromDump(chainDump: Block[]) {
    const generatedBlockchain = new Blockchain();
    generatedBlockchain.pushGenesisBlock();
    chainDump.forEach((blockData, idx) => {
      if (idx === 0) {
        // skip genesis block
      } else {
        const added = generatedBlockchain.addBlock(blockData);
        if (!added) {
          throw new Error("The chain dump is tampered!!");
        }
      }
    });

    this.currentBlockchain = generatedBlockchain;
  }

  // Our naive consnsus algorithm. If a longer valid chain is
  // found, our chain is replaced with it.
  private async consensus() {
    let longestChain = null;
    let currentLen = this.currentBlockchain.chain.length;

    const datas = await Promise.all(
      [...this.peers].map(async node => {
        const response = await fetch(`${node}chain`);
        const json = await response.json();
        const length = json.length;
        const chain = json.chain;

        return { length, chain };
      })
    );

    datas.forEach(({ length, chain }) => {
      if (
        length > currentLen &&
        this.currentBlockchain.checkChainValidity(chain)
      ) {
        currentLen = length;
        longestChain = chain;
      }
    });

    if (longestChain) {
      this.currentBlockchain = longestChain;
      return true;
    }

    return false;
  }

  // A function to announce to the network once a block has been mined.
  // Other blocks can simply verify the proof of work and add it to their
  // respective chains.
  private async announceNewBlock(block: Block) {
    return Promise.all(
      [...this.peers].map(async peer => {
        const response = await fetch(`${peer}addBlock`, {
          method: "POST",
          body: JSON.stringify(block),
          headers: { "Content-Type": "application/json" }
        });

        await response.text();
      })
    );
  }
}

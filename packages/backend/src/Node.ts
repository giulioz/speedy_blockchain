import { Blockchain, ChainState, Block } from "@speedy_blockchain/common";

export default class Node {
  currentBlockchain: Blockchain;
  peers: Set<string>;

  constructor() {
    this.currentBlockchain = new Blockchain();
    this.currentBlockchain.pushGenesisBlock();

    this.peers = new Set([]);
  }

  getChain(): ChainState {
    const chain: Block[] = [];
    this.currentBlockchain.chain.forEach(block => chain.push(block));

    return {
      length: chain.length,
      chain,
      peers: [...this.peers]
    };
  }

  setFromDump(chainDump: Block[]) {
    const generatedBlockchain = new Blockchain();
    generatedBlockchain.pushGenesisBlock();
    chainDump.forEach((blockData, idx) => {
      if (idx === 0) {
        // skip genesis block
      } else {
        const proof = blockData.hash;
        const added = generatedBlockchain.addBlock(blockData, proof);
        if (!added) {
          throw new Error("The chain dump is tampered!!");
        }
      }
    });

    this.currentBlockchain = generatedBlockchain;
  }

  // Our naive consnsus algorithm. If a longer valid chain is
  // found, our chain is replaced with it.
  async consensus() {
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
  async announceNewBlock(block: Block) {
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

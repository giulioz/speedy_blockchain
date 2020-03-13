import Transaction from "./Transaction";
import Block, { computeBlockHash, createBlock } from "./Block";
import { genZeroes, getTimestamp } from "./utils";
import AsyncMiner from "./AsyncMiner";

// difficulty of our PoW algorithm
const difficulty = 2;

export default class Blockchain {
  unconfirmedTransactions: Transaction[] = [];
  chain: Block[] = [];

  // A function to generate genesis block and pushs it to
  // the chain. The block has index 0, previousHash as 0, and
  // a valid hash.
  pushGenesisBlock() {
    const genesisBlock = createBlock({
      index: 0,
      transactions: [],
      timestamp: getTimestamp(),
      previousHash: "0",
      nonce: 0
    });
    this.chain.push(genesisBlock);
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // A function that adds the block to the chain after verification.
  // Verification includes:
  // * Checking if the proof is valid.
  // * The previousHash referred in the block and the hash of latest block
  //   in the chain match.
  addBlock(block: Block, proof: string) {
    const previousHash = this.lastBlock.hash;

    if (previousHash !== block.previousHash) {
      return false;
    }

    if (!Blockchain.isValidProof(block, proof)) {
      return false;
    }

    block.hash = proof;
    this.chain.push(block);
    return true;
  }

  addNewTransaction(transaction: Transaction) {
    this.unconfirmedTransactions.push(transaction);
  }

  // Check if blockHash is valid hash of block and satisfies
  // the difficulty criteria.
  static isValidProof(block: Block, blockHash: string) {
    return (
      blockHash.startsWith(genZeroes(difficulty)) &&
      blockHash === computeBlockHash(block)
    );
  }

  checkChainValidity(chain: Block[]) {
    let result = true;
    let previousHash = "0";

    chain.forEach(block => {
      const blockHash = block.hash;
      // remove the hash field to recompute the hash again
      // using `computeHash` method.
      // delattr(block, "hash"); // WTF
      block.hash = undefined;

      if (
        !Blockchain.isValidProof(block, blockHash) ||
        previousHash !== block.previousHash
      ) {
        result = false;
        return result;
      }

      block.hash = blockHash;
      previousHash = blockHash;
    });

    return result;
  }

  // This function serves as an interface to add the pending
  // transactions to the blockchain by adding them to the block
  // and figuring out Proof Of Work.
  async mineNextBlock(asyncMiner: AsyncMiner) {
    if (!this.unconfirmedTransactions) {
      return false;
    }

    const lastBlock = this.lastBlock;

    const newBlock = createBlock({
      index: lastBlock.index + 1,
      transactions: this.unconfirmedTransactions,
      timestamp: getTimestamp(),
      previousHash: lastBlock.hash,
      nonce: 0
    });

    const proof = await asyncMiner.mine(newBlock);

    this.addBlock(newBlock, proof);

    this.unconfirmedTransactions = [];

    return true;
  }
}

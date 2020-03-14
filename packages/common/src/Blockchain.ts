import Transaction from "./Transaction";
import Block, { computeBlockHash, createBlock } from "./Block";
import { genZeroes, getTimestamp } from "./utils";
import AsyncMiner from "./AsyncMiner";

// difficulty of our PoW algorithm
const difficulty = 2;

// Check if blockHash is valid hash of block and satisfies
// the difficulty criteria.
function isValidBlock(block: Block) {
  return (
    block.hash.startsWith(genZeroes(difficulty)) &&
    block.hash === computeBlockHash(block)
  );
}

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
  addBlock(block: Block) {
    const previousHash = this.lastBlock.hash;

    if (previousHash !== block.previousHash) {
      return false;
    }

    if (!isValidBlock(block)) {
      return false;
    }

    this.chain.push(block);
    return true;
  }

  addNewTransaction(transaction: Transaction) {
    this.unconfirmedTransactions.push(transaction);
  }

  checkChainValidity(chain: Block[]) {
    let result = true;
    let previousHash = "0";

    chain.forEach(block => {
      if (!isValidBlock(block) || previousHash !== block.previousHash) {
        result = false;
      }

      previousHash = block.hash;
    });

    return result;
  }

  // This function serves as an interface to add the pending
  // transactions to the blockchain by adding them to the block
  // and figuring out Proof Of Work.
  async mineNextBlock(asyncMiner: AsyncMiner) {
    if (
      !this.unconfirmedTransactions ||
      this.unconfirmedTransactions.length === 0
    ) {
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

    newBlock.hash = await asyncMiner.mine(newBlock);
    this.addBlock(newBlock);

    this.unconfirmedTransactions = [];

    return true;
  }
}

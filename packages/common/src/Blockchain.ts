import { v4 as uuidv4 } from "uuid";

import Transaction from "./Transaction";
import Block, { computeBlockHash, createBlock, UnhashedBlock } from "./Block";
import { genZeroes, getTimestamp } from "./utils";
import AsyncMiner from "./AsyncMiner";

// difficulty of our PoW algorithm
const difficulty = 2;

// Check if blockHash is valid hash of block and satisfies
// the difficulty criteria.
function isValidBlock(block: Block) {
  const unhashedBlock: UnhashedBlock = {
    index: block.index,
    transactions: block.transactions,
    timestamp: block.timestamp,
    previousHash: block.previousHash,
    nonce: block.nonce
  };
  return (
    block.hash.startsWith(genZeroes(difficulty)) &&
    block.hash === computeBlockHash(unhashedBlock)
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

  findBlockById(blockId: Block["index"]) {
    // TODO: Maybe it can be optimized with an ordering?
    return this.chain.find(b => b.index === blockId);
  }

  getBlocksRange(startId: number, endId: number) {
    return this.chain.filter(
      block => block.index >= startId && block.index <= endId
    );
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
  async tryMineNextBlock(asyncMiner: AsyncMiner) {
    if (
      !this.unconfirmedTransactions ||
      this.unconfirmedTransactions.length === 0
    ) {
      return false;
    }

    const lastBlock = this.lastBlock;

    const unhashedBlock: UnhashedBlock = {
      index: lastBlock.index + 1,
      transactions: this.unconfirmedTransactions,
      timestamp: getTimestamp(),
      previousHash: lastBlock.hash,
      nonce: 0
    };
    const block = await asyncMiner.mine(unhashedBlock);

    this.addBlock(block);

    this.unconfirmedTransactions = [];

    return block;
  }

  pushTransaction(content: Transaction["content"]) {
    const transaction: Transaction = {
      id: uuidv4(),
      timestamp: getTimestamp(),
      content
    };

    this.unconfirmedTransactions.push(transaction);
  }

  findTransactionById(
    transactionId: Transaction["id"],
    blockId: Block["index"] | null = null
  ): Transaction | null {
    const block =
      blockId !== null
        ? this.findBlockById(blockId)
        : this.chain.find(b =>
            b.transactions.find(t => t.id === transactionId)
          );

    if (block) {
      const transaction = block.transactions.find(t => t.id === transactionId);
      return transaction || null;
    } else {
      return null;
    }
  }
}

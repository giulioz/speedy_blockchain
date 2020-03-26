import { v4 as uuidv4 } from "uuid";

import Transaction from "./Transaction";
import Block, { computeBlockHash, createBlock, UnhashedBlock } from "./Block";
import { genZeroes, getTimestamp } from "./utils";
import AsyncMiner from "./AsyncMiner";

// difficulty of our PoW algorithm
export const DIFFICULTY = 5;

// max transactions per block
export const MAX_TRANSACTIONS = 4000;

export const createGenesisBlock = () =>
  createBlock({
    index: 0,
    transactions: [],
    // by default the genesis block come from the end of time... (to match with other peers)
    timestamp: 0,
    previousHash: "0",
    nonce: 0,
  });

// Check if blockHash is valid hash of block and satisfies
// the difficulty criteria.
export function isValidBlock(block: Block, difficulty = DIFFICULTY) {
  const unhashedBlock: UnhashedBlock = {
    index: block.index,
    transactions: block.transactions,
    timestamp: block.timestamp,
    previousHash: block.previousHash,
    nonce: block.nonce,
  };

  return (
    block.hash.startsWith(genZeroes(difficulty)) &&
    block.hash === computeBlockHash(unhashedBlock)
  );
}

export function checkChainValidity(chain: Block[]) {
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

export default class Blockchain {
  unconfirmedTransactions: Transaction[] = [];
  chain: Block[] = [];

  // A function to generate genesis block and pushs it to
  // the chain. The block has index 0, previousHash as 0, and
  // a valid hash.
  pushGenesisBlock() {
    this.chain.push(createGenesisBlock());
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  get maxLength() {
    return this.chain.length;
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

  replaceChain(blocks: Block[]) {
    this.chain = blocks;
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

    const { lastBlock } = this;

    const transactionsToValidate: Transaction[] = [];
    while (this.unconfirmedTransactions.length > 0) {
      transactionsToValidate.push(
        this.unconfirmedTransactions.pop() as Transaction
      );
    }

    const unhashedBlock: UnhashedBlock = {
      index: lastBlock.index + 1,
      transactions: transactionsToValidate,
      timestamp: getTimestamp(),
      previousHash: lastBlock.hash,
      nonce: 0,
    };

    const block = await asyncMiner.mine(unhashedBlock);
    this.addBlock(block);
    return block;
  }

  pushTransaction(content: Transaction["content"], asyncMiner: AsyncMiner) {
    const transaction: Transaction = {
      id: uuidv4(),
      timestamp: getTimestamp(),
      content,
    };

    if (!asyncMiner.notifyNewTransaction(transaction)) {
      this.unconfirmedTransactions.push(transaction);
    }
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
    }

    return null;
  }
}

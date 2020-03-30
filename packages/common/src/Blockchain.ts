import { v4 as uuidv4 } from "uuid";

import Transaction from "./Transaction";
import Block, { computeBlockHash, createBlock, UnhashedBlock } from "./Block";
import { genZeroes, getTimestamp } from "./utils";
import AsyncMiner from "./AsyncMiner";

// difficulty of our PoW algorithm
export const DIFFICULTY = 2;

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
    minedBy: "god",
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
    minedBy: block.minedBy,
  };

  const isGenesisBlock = block.index === 0;

  const valid =
    isGenesisBlock ||
    (block.hash.startsWith(genZeroes(difficulty)) &&
      block.hash === computeBlockHash(unhashedBlock) &&
      block.transactions.length > 0 &&
      block.transactions.length < MAX_TRANSACTIONS);

  if (!valid) {
    console.warn(
      "INVALIDY REPORT:",
      block.hash.startsWith(genZeroes(difficulty)),
      block.hash,
      computeBlockHash(unhashedBlock),
      block.transactions.length
    );
  }

  return valid;
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

  transactionCount: number = 0;

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
  async addBlock(block: Block, asyncMiner: AsyncMiner) {
    const previousHash = this.lastBlock.hash;

    if (previousHash !== block.previousHash) {
      return false;
    }

    if (!isValidBlock(block)) {
      console.warn(new Error(`Trying go add an invalid block, aborting`));
      return false;
    }

    this.chain.push(block);

    // remove from unconfirmedTransactions the transactions of the block
    this.unconfirmedTransactions = this.unconfirmedTransactions.filter(
      tr => !block.transactions.find(t => t.id === tr.id)
    );

    // ...and remove also from the miner
    await asyncMiner.notifyTransactionsRemoved(block.transactions);

    // update transactionCount
    this.transactionCount += block.transactions.length;

    return true;
  }

  replaceChain(blocks: Block[]) {
    this.chain = blocks;

    if (!checkChainValidity(this.chain)) {
      throw new Error("Invalid replacement chain!");
    }

    this.transactionCount = this.chain.reduce(
      (prev, block) => prev + block.transactions.length,
      0
    );
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
  async tryMineNextBlock(asyncMiner: AsyncMiner, minerName: string) {
    if (
      !this.unconfirmedTransactions ||
      this.unconfirmedTransactions.length === 0
    ) {
      return false;
    }

    const { lastBlock } = this;

    const transactionsToValidate: Transaction[] = [
      ...this.unconfirmedTransactions,
    ];

    const unhashedBlock: UnhashedBlock = {
      index: lastBlock.index + 1,
      transactions: transactionsToValidate,
      timestamp: getTimestamp(),
      previousHash: lastBlock.hash,
      nonce: 0,
      minedBy: minerName,
    };

    const block = await asyncMiner.mine(unhashedBlock);
    await this.addBlock(block, asyncMiner);
    return block;
  }

  async pushTransaction(transaction: Transaction, asyncMiner: AsyncMiner) {
    const insertedInMining = await asyncMiner.notifyNewTransaction(transaction);
    if (insertedInMining) {
      return true;
    }

    if (!this.unconfirmedTransactions.find(t => t.id === transaction.id)) {
      this.unconfirmedTransactions.push(transaction);
      return true;
    }

    return false;
  }

  async pushTransactionContent(
    content: Transaction["content"],
    asyncMiner: AsyncMiner
  ) {
    const transaction: Transaction = {
      id: uuidv4(),
      timestamp: getTimestamp(),
      content,
    };

    return this.pushTransaction(transaction, asyncMiner) && transaction;
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

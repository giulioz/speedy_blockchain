import Transaction, { sortAsExpected } from "./Transaction";
import { sha256, genZeroes } from "./utils";
import { DIFFICULTY, MAX_TRANSACTIONS } from "./config";

export type UnhashedBlock = Omit<Block, "hash">;

export default interface Block {
  hash: string;
  index: number;
  transactions: Transaction[];
  timestamp: number;
  previousHash: string;
  nonce: number;
  minedBy: string;
}

export function computeBlockHash(b: UnhashedBlock) {
  const sorted = {
    index: b.index,
    transactions: b.transactions.map(t => sortAsExpected(t)),
    timestamp: b.timestamp,
    previousHash: b.previousHash,
    nonce: b.nonce,
    minedBy: b.minedBy,
  };

  const blockString = JSON.stringify(sorted);
  return sha256(blockString);
}

export function createBlock(blockToCreate: UnhashedBlock): Block {
  const hash = computeBlockHash(blockToCreate);

  const block: Block = { ...blockToCreate, hash };
  return block;
}

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

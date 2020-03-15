import Transaction, { sortAsExpected } from "./Transaction";
import { sha256 } from "./utils";

export type UnhashedBlock = Omit<Block, "hash">;

export default interface Block {
  hash: string;
  index: number;
  transactions: Transaction[];
  timestamp: number;
  previousHash: string;
  nonce: number;
}

export function computeBlockHash(b: UnhashedBlock) {
  const sorted = {
    index: b.index,
    transactions: b.transactions.map(t => sortAsExpected(t)),
    timestamp: b.timestamp,
    previousHash: b.previousHash,
    nonce: b.nonce
  };

  const blockString = JSON.stringify(sorted);
  return sha256(blockString);
}

export function createBlock(blockToCreate: UnhashedBlock): Block {
  const hash = computeBlockHash(blockToCreate);

  const block: Block = { ...blockToCreate, hash };
  return block;
}

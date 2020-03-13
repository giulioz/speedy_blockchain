import Transaction from "./Transaction";
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
  const unhashed = { ...b, hash: undefined };
  const blockString = JSON.stringify(unhashed);
  return sha256(blockString);
}

export function createBlock(blockToCreate: UnhashedBlock): Block {
  const hash = computeBlockHash(blockToCreate);

  const block: Block = { ...blockToCreate, hash };
  return block;
}

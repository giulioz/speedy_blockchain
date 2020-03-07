import Transaction from "./Transaction";
import { sha256 } from "./utils";

export default interface Block {
  hash: string;
  index: number;
  transactions: Transaction[];
  timestamp: number;
  previousHash: string;
  nonce: number;
}

export function computeBlockHash(b: Block) {
  const blockString = JSON.stringify(b);
  return sha256(blockString);
}

import Block, { UnhashedBlock } from "./Block";
import Transaction from "./Transaction";

export default interface AsyncMiner {
  mine(rawBlock: UnhashedBlock): Promise<Block>;
  notifyNewTransaction(t: Transaction): boolean;
  notifyTransactionsRemoved(t: Transaction[]): void;
  abort(): Promise<void>;
}

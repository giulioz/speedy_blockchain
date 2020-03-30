import Block, { UnhashedBlock } from "./Block";
import Transaction from "./Transaction";

export default interface AsyncMiner {
  mine(rawBlock: UnhashedBlock): Promise<Block>;
  notifyNewTransaction(t: Transaction): Promise<boolean>;
  notifyTransactionsRemoved(t: Transaction[]): Promise<boolean>;
  abort(): Promise<void>;
}

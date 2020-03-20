import Block, { UnhashedBlock } from "./Block";
import Transaction from "./Transaction";

export default interface AsyncMiner {
  mine(rawBlock: UnhashedBlock): Promise<Block>;
  notifyNewTransaction(t: Transaction): void;
  stop(): Promise<void>;
}

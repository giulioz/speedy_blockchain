import Block, { UnhashedBlock } from "./Block";

export default interface AsyncMiner {
  mine(rawBlock: UnhashedBlock): Promise<Block>;
  stop(): Promise<void>;
}

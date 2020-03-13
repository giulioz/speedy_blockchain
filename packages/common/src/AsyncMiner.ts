import Block from "./Block";

export default interface AsyncMiner {
  mine(rawBlock: Block): Promise<string>;
  stop(): Promise<void>;
}

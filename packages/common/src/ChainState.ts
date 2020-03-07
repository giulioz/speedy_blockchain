import Block from "./Block";

export default interface ChainState {
  length: number;
  chain: Block[];
  peers: string[];
}

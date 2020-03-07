import { Blockchain, ChainState, Block } from "@speedy_blockchain/common";

export default class AppState {
  currentBlockchain: Blockchain;
  peers: Set<string>;

  constructor() {
    this.currentBlockchain = new Blockchain();
    this.currentBlockchain.createGenesisBlock();

    this.peers = new Set([]);
  }
}

import Peer from "./Peer";

export default interface ChainInfo {
  peer: Peer;
  length: number;
  transactionCount: number;
  lastHash: string;
}

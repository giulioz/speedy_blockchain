import { PeersState } from "@speedy_blockchain/common";
import apiCall from "./api";

export default async function fetchPeers() {
  return await apiCall<PeersState>("/peers");
}

import { Flight } from "@speedy_blockchain/common";
import apiCall from "./apiCall";

export async function addFlight(f: Flight) {
  return apiCall("POST /transaction", { params: {}, body: f });
}

export async function fetchPeers() {
  return apiCall("GET /peers", { params: {}, body: null });
}

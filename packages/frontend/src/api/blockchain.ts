import { Transaction, ChainState } from "@speedy_blockchain/common";

import config from "../config";
import apiCall from "./api";

export async function submitTransaction(tr: Transaction) {
  const body = JSON.stringify(tr);
  const req = await fetch(config.apiURL + "/new_transaction", {
    method: "POST",
    body
  });
  // TODO: Aggiungiamo il metodo text in api.ts?
  return req.text();
}

export async function fetchChain() {
  const req = await apiCall<ChainState>("/chain");
  return req;
}

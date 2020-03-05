import { ChainState } from "backend/src";
import { Transaction } from "backend/src/Blockchain";

import config from "../config";

export async function submitTransaction(tr: Transaction) {
  const body = JSON.stringify(tr);
  const req = await fetch(config.apiURL + "/new_transaction", {
    method: "POST",
    body
  });
  return req.text();
}

export async function getChain() {
  const req = await fetch(config.apiURL + "/chain");
  const chain: ChainState = await req.json();
  return chain;
}

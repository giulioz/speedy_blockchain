import { parentPort } from "worker_threads";
import { genZeroes } from "@speedy_blockchain/common/dist/utils";
import { UnhashedBlock } from "@speedy_blockchain/common";
import { computeBlockHash } from "@speedy_blockchain/common/dist/Block";

// TODO: Should be imported
const DIFFICULTY = 2;

let miningBlock: UnhashedBlock | null = null;

parentPort.on("message", ({ type, data }) => {
  if (type === "mineBlock") {
    miningBlock = data;
    const minedBlock = mine();
    // TODO
    parentPort.postMessage(minedBlock);
  } else if (type === "newTransaction") {
    // Add transaction to current mining
  }
});

function mine() {
  miningBlock.nonce = Math.round(Math.random() * 10000);

  let computedHash = computeBlockHash(miningBlock);
  while (!computedHash.startsWith(genZeroes(DIFFICULTY))) {
    miningBlock.nonce += 1;
    computedHash = computeBlockHash(miningBlock);
  }

  return miningBlock.nonce;
}

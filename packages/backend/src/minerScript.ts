import { parentPort } from "worker_threads";
import { genZeroes } from "@speedy_blockchain/common/dist/utils";
import { UnhashedBlock } from "@speedy_blockchain/common";
import { computeBlockHash } from "@speedy_blockchain/common/dist/Block";

// TODO: Should be imported
const DIFFICULTY = 2;
const DEBUG = false;

const log = msg => DEBUG && console.log("MINER > " + msg);

parentPort.on("message", async rawBlock => {
  log("STARTED MINING");
  const minedBlock = await mine(rawBlock);
  log("FINISHED MINING");
  parentPort.postMessage(minedBlock);
});

function mine(rawBlock: UnhashedBlock) {
  return new Promise((resolve, reject) => {
    rawBlock.nonce = Math.round(Math.random() * 10000);

    let computedHash = computeBlockHash(rawBlock);
    while (!computedHash.startsWith(genZeroes(DIFFICULTY))) {
      rawBlock.nonce += 1;
      computedHash = computeBlockHash(rawBlock);
    }
    resolve(rawBlock.nonce);
  });
}

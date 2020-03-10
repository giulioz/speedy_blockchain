import { parentPort } from "worker_threads";
import { Block } from "@speedy_blockchain/common/dist";
import { computeBlockHash } from "@speedy_blockchain/common/dist/Block";
import { genZeroes } from "@speedy_blockchain/common/dist/utils";

// TODO: Should be imported
const DEBUG = false;

const log = msg => DEBUG && console.log("MINER > " + msg);

parentPort.on("message", async rawBlock => {
  log("STARTED MINING");
  const minedBlock = await mine(rawBlock);
  log("FINISHED MINING");
  parentPort.postMessage(minedBlock);
});

function mine(rawBlock: Block) {
  return new Promise((resolve, reject) => {
    rawBlock.nonce = 0;

    let computedHash = computeBlockHash(rawBlock);
    while (!computedHash.startsWith(genZeroes(DIFFICULTY))) {
      rawBlock.nonce += 1;
      computedHash = computeBlockHash(rawBlock);
    }

    resolve(computedHash);
  });
}

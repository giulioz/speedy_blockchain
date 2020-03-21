import { parentPort } from "worker_threads";

import { genZeroes } from "@speedy_blockchain/common/dist/utils";
import { UnhashedBlock, Transaction } from "@speedy_blockchain/common";
import { computeBlockHash } from "@speedy_blockchain/common/dist/Block";

import { OutgoingMessage } from "./WorkerAsyncMiner";

let DIF_START = "";
const CHUNK_SIZE = 50;

let miningBlock: UnhashedBlock | null = null;

parentPort.on("message", (message: OutgoingMessage) => {
  if (message.type === "setDifficulty") {
    DIF_START = genZeroes(message.data);
  } else if (message.type === "mineBlock") {
    startMining(message.data);
  } else if (message.type === "newTransaction") {
    pushNewTransaction(message.data);
  } else if (message.type === "abort") {
    abort();
  }
});

function startMining(block: UnhashedBlock) {
  miningBlock = block;
  miningBlock.nonce = Math.round(Math.random() * 10000);

  miningLoop();
}

function miningLoop() {
  if (!miningBlock) {
    // Aborted
    return;
  }

  const resultNonce = mineChunk();

  if (resultNonce) {
    // Has result, send it back
    parentPort.postMessage(miningBlock);

    miningBlock = null;
  } else {
    // Continue iterating, using the event loop to receive the abort and new transactions message
    setImmediate(miningLoop);
  }
}

// Process a small chunk of nonces
function mineChunk(): number | null {
  let computedHash = computeBlockHash(miningBlock);

  for (let i = 0; i < CHUNK_SIZE; i++) {
    if (computedHash.startsWith(DIF_START)) {
      return miningBlock.nonce;
    } else {
      miningBlock.nonce += 1;
      computedHash = computeBlockHash(miningBlock);
    }
  }

  return null;
}

function pushNewTransaction(t: Transaction) {
  miningBlock.transactions.push(t);
}

function abort() {
  miningBlock = null;
}

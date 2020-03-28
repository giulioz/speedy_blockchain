import { parentPort } from "worker_threads";

import { genZeroes } from "@speedy_blockchain/common/dist/utils";
import { UnhashedBlock, Transaction } from "@speedy_blockchain/common";
import { computeBlockHash } from "@speedy_blockchain/common/dist/Block";

import { OutgoingMessage } from "./WorkerAsyncMiner";

let DIF_START = "";
const CHUNK_SIZE = 50;

let miningBlock: UnhashedBlock | null = null;

// Process a small chunk of nonces
function mineChunk(): number | null {
  if (!miningBlock) {
    throw new Error("No block in queue");
  }

  let computedHash = computeBlockHash(miningBlock);

  for (let i = 0; i < CHUNK_SIZE; i += 1) {
    if (computedHash.startsWith(DIF_START)) {
      return miningBlock.nonce;
    }

    miningBlock.nonce += 1;
    computedHash = computeBlockHash(miningBlock);
  }

  return null;
}

function miningLoop() {
  if (!miningBlock) {
    // Aborted
    return;
  }

  const resultNonce = mineChunk();

  if (resultNonce) {
    // Has result, send it back
    if (parentPort) {
      parentPort.postMessage(miningBlock);
    }

    miningBlock = null;
  } else {
    // Continue iterating, using the event loop to receive the abort and new transactions message
    setImmediate(miningLoop);
  }
}

function pushNewTransaction(t: Transaction) {
  if (!miningBlock) {
    throw new Error("No block in queue");
  }

  miningBlock.transactions.push(t);
}

function removeTransactions(ts: Transaction[]) {
  if (miningBlock) {
    miningBlock.transactions = miningBlock.transactions.filter(
      t => !ts.find(t2 => t.id === t2.id)
    );
  }
}

function abort() {
  miningBlock = null;
}

function startMining(block: UnhashedBlock) {
  miningBlock = block;
  miningBlock.nonce = Math.round(Math.random() * 10000);

  miningLoop();
}

if (!parentPort) {
  throw new Error("No parent port available");
}

parentPort.on("message", (message: OutgoingMessage) => {
  if (message.type === "setDifficulty") {
    DIF_START = genZeroes(message.data);
  } else if (message.type === "mineBlock") {
    startMining(message.data);
  } else if (message.type === "newTransaction") {
    pushNewTransaction(message.data);
  } else if (message.type === "removeTransactions") {
    removeTransactions(message.data);
  } else if (message.type === "abort") {
    abort();
  }
});

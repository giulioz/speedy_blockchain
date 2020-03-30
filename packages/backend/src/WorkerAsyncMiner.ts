import { Worker } from "worker_threads";
import path from "path";
import fs from "fs";

import {
  Block,
  AsyncMiner,
  UnhashedBlock,
  Transaction,
} from "@speedy_blockchain/common";
import {
  DIFFICULTY,
  MAX_TRANSACTIONS,
} from "@speedy_blockchain/common/dist/Blockchain";
import { createBlock } from "@speedy_blockchain/common/dist/Block";

interface Job {
  block: UnhashedBlock | null;
  fail(err: any): any;
  done(data: Block): void;
}

const EMPTY_JOB = {
  block: null,
  done: () => {},
  fail: (err: any) => {
    throw err;
  },
};

function minerScriptPath(): string {
  const defaultPath = path.resolve(__dirname, "./minerScript.js");
  const testsPath = path.resolve(
    __dirname,
    "../dist/backend/src/minerScript.js"
  );

  if (fs.existsSync(defaultPath)) {
    return defaultPath;
  }

  return testsPath;
}

export type OutgoingMessage =
  | { type: "setDifficulty"; data: number }
  | { type: "mineBlock"; data: UnhashedBlock }
  | { type: "newTransaction"; data: Transaction }
  | { type: "removeTransactions"; data: Transaction[] }
  | { type: "abort" };

export default class WorkerAsyncMiner implements AsyncMiner {
  worker: Worker;
  currentJob: Job = EMPTY_JOB;

  constructor(
    public onReschedule: (transactions: Transaction[]) => void,
    difficulty: number = DIFFICULTY
  ) {
    this.worker = this.createNewWorker();
    this.setDifficulty(difficulty);
  }

  private createNewWorker(): Worker {
    const newWorker = new Worker(minerScriptPath());

    newWorker.on("error", error => {
      this.currentJob.fail(error);
    });

    newWorker.on("message", (data: Block) => {
      const createdBlock: Block = createBlock(data);

      if (!this.currentJob.block) {
        this.currentJob.fail(new Error("No block from async miner!"));
      } else {
        if (
          createdBlock.transactions.length !==
          this.currentJob.block.transactions.length
        ) {
          console.warn(
            new Error(
              `Removed after mining (${createdBlock.transactions.length} vs ${this.currentJob.block.transactions.length}), rescheduling...`
            )
          );

          this.onReschedule(this.currentJob.block.transactions);
        }

        this.currentJob.done(createdBlock);
      }

      this.currentJob = EMPTY_JOB;
    });

    return newWorker;
  }

  public get busy() {
    return Boolean(this.currentJob.block);
  }

  public mine(rawBlock: UnhashedBlock): Promise<Block> {
    return new Promise((resolve, reject) => {
      if (this.busy) {
        reject(new Error("WorkerAsyncMiner currently busy"));
      }

      const newJob = { block: rawBlock, done: resolve, fail: reject };
      this.currentJob = newJob;

      const msg: OutgoingMessage = { type: "mineBlock", data: rawBlock };
      this.worker.postMessage(msg);
    });
  }

  public async notifyNewTransaction(t: Transaction) {
    if (
      this.currentJob.block &&
      this.currentJob.block.transactions.length < MAX_TRANSACTIONS - 1 &&
      !this.currentJob.block.transactions.find(tr => tr.id === t.id)
    ) {
      const msg: OutgoingMessage = { type: "newTransaction", data: t };
      this.worker.postMessage(msg);

      this.currentJob.block.transactions.push(t);

      return true;
    }

    return false;
  }

  public async notifyTransactionsRemoved(transactions: Transaction[]) {
    if (this.currentJob.block) {
      const msg: OutgoingMessage = {
        type: "removeTransactions",
        data: transactions,
      };
      this.worker.postMessage(msg);

      this.currentJob.block.transactions = this.currentJob.block.transactions.filter(
        t => !transactions.find(t2 => t.id === t2.id)
      );

      return true;
    }

    return false;
  }

  public async abort() {
    const msg: OutgoingMessage = { type: "abort" };
    this.worker.postMessage(msg);

    this.currentJob.fail(new Error("Aborted"));
  }

  public async setDifficulty(d: number) {
    const msg: OutgoingMessage = { type: "setDifficulty", data: d };
    this.worker.postMessage(msg);
  }

  public async dispose() {
    await this.worker.terminate();
  }
}

import { Worker } from "worker_threads";
import { Block, AsyncMiner, UnhashedBlock } from "@speedy_blockchain/common";
import path from "path";
import { createBlock } from "@speedy_blockchain/common/dist/Block";
import * as db from './db';
interface Job {
  block: UnhashedBlock;
  fail(error: Error): void;
  done(data: Block): void;
}

const EMPTY_JOB = { block: null, done: null, fail: null };

export default class WorkerAsyncMiner implements AsyncMiner {
  worker: Worker = this.createNewWorker();
  currentJob: Job = EMPTY_JOB;
  queuedJobs: Job[] = [];

  private createNewWorker(): Worker {
    const newWorker = new Worker(this.minerScriptPath());
    newWorker.on("error", error => {
      this.currentJob.fail(error);
    });
    newWorker.on("message", data => {
      const unhashedNewBlock: UnhashedBlock = {
        ...this.currentJob.block,
        nonce: data
      };
      const createdBlock: Block = createBlock(unhashedNewBlock);
      db.insert(createdBlock);
      this.currentJob.done(createdBlock);
      this.nextjob();
    });
    return newWorker;
  }

  public mine(rawBlock: UnhashedBlock): Promise<Block> {
    return new Promise((resolve, reject) => {
      const newJob = { block: rawBlock, done: resolve, fail: reject };
      if (this.currentJob.block) {
        this.queuedJobs.push(newJob);
      } else {
        this.currentJob = newJob;
      }
      this.worker.postMessage(rawBlock);
    });
  }

  // Easiest way...
  public async stop() {
    this.currentJob.fail(new Error("Miner stopped"));
    const newWorker = this.createNewWorker();
    await this.worker.terminate();
    this.worker = newWorker;
  }

  private nextjob() {
    const nextJob = this.queuedJobs.shift();
    this.currentJob = nextJob ? nextJob : EMPTY_JOB;
  }

  private minerScriptPath(): string {
    return path.resolve(__dirname, "./minerScript.js");
  }
}

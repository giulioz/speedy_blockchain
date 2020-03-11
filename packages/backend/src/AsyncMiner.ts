import { Worker } from "worker_threads";
import { Block } from "@speedy_blockchain/common/dist";
import path from "path";

interface Job {
  block: Block;
  fail(error: Error);
  done(data: Block);
}

const EMPTY_JOB = { block: null, done: null, fail: null };

export default class AsyncMiner {
  worker: Worker = this.createNewWorker();
  currentJob: Job = EMPTY_JOB;
  queuedJobs: Job[] = [];

  createNewWorker(): Worker {
    const newWorker = new Worker(this.minerScriptPath());
    newWorker.on("error", error => {
      this.currentJob.fail(error);
    });
    newWorker.on("message", data => {
      this.currentJob.done(data);
      this.nextjob();
    });
    return newWorker;
  }

  mine(rawBlock: Block): Promise<Block> {
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
  async stop() {
    this.currentJob.fail(new Error("Miner stopped"));
    const newWorker = this.createNewWorker();
    await this.worker.terminate();
    this.worker = newWorker;
  }

  nextjob() {
    const nextJob = this.queuedJobs.shift();
    this.currentJob = nextJob ? nextJob : EMPTY_JOB;
  }

  minerScriptPath(): string {
    return path.resolve(__dirname, "./minerScript.js");
  }
}

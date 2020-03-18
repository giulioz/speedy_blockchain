import { Worker } from "worker_threads";
import { Block, AsyncMiner } from "@speedy_blockchain/common";
import path from "path";
import { UnhashedBlock } from "@speedy_blockchain/common/src/Block";

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
      this.currentJob.done(data);
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

import { Worker } from "worker_threads";
import { Block } from "@speedy_blockchain/common/dist";
import path from "path";

interface JobInteractions {
  fail(error: Error);
  done(data: Block);
}

export default class AsyncMiner {
  minerScriptPath: string = path.resolve(__dirname, "./minerScript.js");
  worker: Worker = this.createNewWorker();
  currentJob: JobInteractions = { done: null, fail: null };

  createNewWorker(): Worker {
    const newWorker = new Worker(this.minerScriptPath);
    newWorker.on("error", error => {
      this.currentJob.fail(new Error("Miner error"));
    });
    newWorker.on("message", data => {
      this.currentJob.done(data);
    });
    return newWorker;
  }

  mine(rawBlock: Block): Promise<Block> {
    return new Promise((resolve, reject) => {
      this.currentJob.done = resolve;
      this.currentJob.fail = reject;
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
}

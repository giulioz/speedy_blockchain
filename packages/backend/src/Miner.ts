import { Worker } from "worker_threads";
import { Block } from "@speedy_blockchain/common/dist";

export default class Miner {
  worker: Worker = new Worker("./dist/minerScript.js");
  active: boolean = false;
  job: Block;

  constructor({ onDone, onError }) {
    this.worker.on("error", onError);
    this.worker.on("message", onDone);
  }

  startMining(rawBlock: Block) {
    this.worker.postMessage(rawBlock);
  }

  // Easies way...
  async stop() {
    const newWorker = new Worker("./dist/minerScript.js");
    await this.worker.terminate();
    this.worker = newWorker;
  }
}

import {
  Block,
  AsyncMiner,
  UnhashedBlock,
  Transaction,
  computeBlockHash,
  utils,
  createBlock,
} from "@speedy_blockchain/common";
import {
  DIFFICULTY,
  MAX_TRANSACTIONS,
} from "@speedy_blockchain/common/dist/Blockchain";

const CHUNK_SIZE = 100;

export default class SimpleAsyncMiner implements AsyncMiner {
  currentBlock: UnhashedBlock | null = null;
  onFinished: ((block: Block) => void) | null = null;
  DIF_START = "";

  private miningLoop = () => {
    if (!this.currentBlock) {
      // Aborted
      return;
    }

    const resultNonce = this.mineChunk();

    if (resultNonce) {
      const createdBlock: Block = createBlock(this.currentBlock);

      // Has result, send it back
      this.onFinished && this.onFinished(createdBlock);

      this.currentBlock = null;
    } else {
      // Continue iterating, using the event loop to receive the abort and new transactions message
      setImmediate(this.miningLoop);
    }
  };

  constructor(public difficulty: number = DIFFICULTY) {
    this.DIF_START = utils.genZeroes(difficulty);
  }

  public mine(rawBlock: UnhashedBlock): Promise<Block> {
    this.currentBlock = rawBlock;
    this.currentBlock.nonce = Math.round(Math.random() * 10000);

    return new Promise<Block>((resolve, reject) => {
      this.onFinished = resolve;
      this.miningLoop();
    });
  }

  // Process a small chunk of nonces
  private mineChunk(): number | null {
    if (!this.currentBlock) {
      throw new Error("No block in queue (mine)");
    }

    let computedHash = computeBlockHash(this.currentBlock);

    for (let i = 0; i < CHUNK_SIZE; i += 1) {
      if (computedHash.startsWith(this.DIF_START)) {
        return this.currentBlock.nonce;
      }

      this.currentBlock.nonce += 1;
      computedHash = computeBlockHash(this.currentBlock);
    }

    return null;
  }

  public notifyNewTransaction(t: Transaction) {
    if (
      this.currentBlock &&
      this.currentBlock.transactions.length < MAX_TRANSACTIONS - 1 &&
      !this.currentBlock.transactions.find(tr => tr.id === t.id)
    ) {
      this.currentBlock.transactions.push(t);

      return true;
    }

    return false;
  }

  public notifyTransactionsRemoved(transactions: Transaction[]) {
    if (this.currentBlock) {
      this.currentBlock.transactions = this.currentBlock.transactions.filter(
        t => !transactions.find(t2 => t.id === t2.id)
      );

      return true;
    }

    return false;
  }

  public async abort() {
    this.currentBlock = null;
  }
}

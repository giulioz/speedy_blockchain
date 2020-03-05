import { sha256, genZeroes } from "./utilities";

export interface Transaction {
  time: number;
  author: string;
  content: string;
}

export class Block {
  hash: string;

  constructor(
    public index: number,
    public transactions: Transaction[],
    public timestamp: number,
    public previousHash: string,
    public nonce = 0
  ) {}

  computeHash() {
    const blockString = JSON.stringify(this);
    return sha256(blockString);
  }
}

// difficulty of our PoW algorithm
const difficulty = 2;

export default class Blockchain {
  unconfirmedTransactions: Transaction[] = [];
  chain: Block[] = [];

  // A function to generate genesis block and pushs it to
  // the chain. The block has index 0, previousHash as 0, and
  // a valid hash.
  createGenesisBlock() {
    const genesisBlock = new Block(0, [], 0, "0");
    genesisBlock.hash = genesisBlock.computeHash();
    this.chain.push(genesisBlock);
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // A function that adds the block to the chain after verification.
  // Verification includes:
  // * Checking if the proof is valid.
  // * The previousHash referred in the block and the hash of latest block
  //   in the chain match.
  addBlock(block: Block, proof: string) {
    const previousHash = this.lastBlock.hash;

    if (previousHash != block.previousHash) {
      return false;
    }

    if (!Blockchain.isValidProof(block, proof)) {
      return false;
    }

    block.hash = proof;
    this.chain.push(block);
    return true;
  }

  // Function that tries different values of nonce to get a hash
  // that satisfies our difficulty criteria.
  static proofOfWork(block: Block) {
    block.nonce = 0;

    let computedHash = block.computeHash();
    while (!computedHash.startsWith(genZeroes(difficulty))) {
      block.nonce += 1;
      computedHash = block.computeHash();
    }

    return computedHash;
  }

  addNewTransaction(transaction: Transaction) {
    this.unconfirmedTransactions.push(transaction);
  }

  // Check if blockHash is valid hash of block and satisfies
  // the difficulty criteria.
  static isValidProof(block: Block, blockHash: string) {
    return (
      blockHash.startsWith(genZeroes(difficulty)) &&
      blockHash == block.computeHash()
    );
  }

  checkChainValidity(chain: Block[]) {
    let result = true;
    let previousHash = "0";

    chain.forEach(block => {
      const blockHash = block.hash;
      // remove the hash field to recompute the hash again
      // using `computeHash` method.
      // delattr(block, "hash"); // WTF
      block.hash = undefined;

      if (
        !Blockchain.isValidProof(block, blockHash) ||
        previousHash != block.previousHash
      ) {
        result = false;
        return result;
      }

      block.hash = blockHash;
      previousHash = blockHash;
    });

    return result;
  }

  // This function serves as an interface to add the pending
  // transactions to the blockchain by adding them to the block
  // and figuring out Proof Of Work.
  mine() {
    if (!this.unconfirmedTransactions) {
      return false;
    }

    const lastBlock = this.lastBlock;

    const newBlock = new Block(
      lastBlock.index + 1,
      this.unconfirmedTransactions,
      new Date().getTime(),
      lastBlock.hash
    );

    const proof = Blockchain.proofOfWork(newBlock);
    this.addBlock(newBlock, proof);

    this.unconfirmedTransactions = [];

    return true;
  }
}

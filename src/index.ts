import crypto from "crypto";
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

function sha256(str: string) {
  return crypto
    .createHash("sha256")
    .update(str, "utf8")
    .digest("hex");
}

function genZeroes(count: number) {
  return new Array(count).fill("0").join("");
}

interface Transaction {
  time: number;
  author: string;
  content: string;
}

class Block {
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

class Blockchain {
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
    }
    computedHash = block.computeHash();

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

const app = express();
app.use(bodyParser.json());

// the node's copy of blockchain
let blockchain = new Blockchain();
blockchain.createGenesisBlock();

// the address to other participating members of the network
const peers = new Set([]);

// endpoint to submit a new transaction. This will be used by
// our application to add new data (posts) to the blockchain
app.post("/new_transaction", (req, res) => {
  const txData = req.body;
  const requiredFields = ["author", "content"];

  requiredFields.forEach(field => {
    if (!txData[field]) {
      res.status(404).send("Invalid transaction data");
      return;
    }
  });

  txData.timestamp = new Date().getTime();

  blockchain.addNewTransaction(txData);

  res.status(201).send("Success");
});

// endpoint to return the node's copy of the chain.
// Our application will be using this endpoint to query
// all the posts to display.
function getChain() {
  const chainData: Block[] = [];
  blockchain.chain.forEach(block => chainData.push(block));

  return {
    length: chainData.length,
    chain: chainData,
    peers: peers
  };
}
app.get("/chain", (req, res) => {
  res.send(getChain());
});

// endpoint to request the node to mine the unconfirmed
// transactions (if any). We'll be using it to initiate
// a command to mine from our application itself.
app.get("/mine", async (req, res) => {
  const result = blockchain.mine();
  if (!result) {
    res.send("No transactions to mine");
  } else {
    // Making sure we have the longest chain before announcing to the network
    const chainLength = blockchain.chain.length;
    await consensus();
    if (chainLength === blockchain.chain.length) {
      // announce the recently mined block to the network
      announceNewBlock(blockchain.lastBlock);
    }

    res.send(`Block #${blockchain.lastBlock.index} is mined.`);
  }
});

// endpoint to add new peers to the network.
app.post("/register_node", (req, res) => {
  const nodeAddress = req.body().nodeAddress;
  if (!nodeAddress) {
    res.status(400).send("Invalid data");
    return;
  }

  // Add the node to the peer list
  peers.add(nodeAddress);

  // Return the consensus blockchain to the newly registered node
  // so that he can sync
  res.send(getChain());
});

app.post("/register_with", async (req, res) => {
  // Internally calls the `register_node` endpoint to
  // register current node with the node specified in the
  // request, and sync the blockchain as well as peer data.
  const nodeAddress = req.body.nodeAddress;
  if (!nodeAddress) {
    res.status(400).send("Invalid data");
    return;
  }

  // const data = { nodeAddress: req.host_url };
  const data = { nodeAddress: req.hostname };
  const headers = { "Content-Type": "application/json" };

  // Make a request to register with remote node and obtain information
  const response = await fetch(nodeAddress + "/register_node", {
    method: "POST",
    body: JSON.stringify(data),
    headers
  });

  if (response.status === 200) {
    const json = await response.json();
    // update chain and the peers
    const chainDump = json.chain;
    blockchain = createChainFromDump(chainDump);
    json.peers.forEach(p => peers.add(p));
    res.status(200).send("Registration successful");
  }
  // if something goes wrong, pass it on to the API response
  else {
    res.status(response.status).send(await response.text());
  }
});

function createChainFromDump(chainDump) {
  const generatedBlockchain = new Blockchain();
  generatedBlockchain.createGenesisBlock();
  chainDump.forEach((blockData, idx) => {
    if (idx === 0) {
      // skip genesis block
    } else {
      const block = new Block(
        blockData["index"],
        blockData["transactions"],
        blockData["timestamp"],
        blockData["previousHash"],
        blockData["nonce"]
      );
      const proof = blockData["hash"];
      const added = generatedBlockchain.addBlock(block, proof);
      if (!added) {
        throw new Error("The chain dump is tampered!!");
      }
    }
  });
  return generatedBlockchain;
}

// endpoint to add a block mined by someone else to
// the node's chain. The block is first verified by the node
// and then added to the chain.
app.post("/addBlock", (req, res) => {
  const blockData = req.body;
  const block = new Block(
    blockData.index,
    blockData.transactions,
    blockData.timestamp,
    blockData.previousHash,
    blockData.nonce
  );

  const proof = blockData["hash"];
  const added = blockchain.addBlock(block, proof);

  if (!added) {
    res.status(400).send("The block was discarded by the node");
  } else {
    res.status(201).send("Block added to the chain");
  }
});

// endpoint to query unconfirmed transactions
app.get("/pending_tx", (req, res) => {
  res.send(blockchain.unconfirmedTransactions);
});

// Our naive consnsus algorithm. If a longer valid chain is
// found, our chain is replaced with it.
async function consensus() {
  let longestChain = null;
  let currentLen = blockchain.chain.length;

  const datas = await Promise.all(
    [...peers].map(async node => {
      const response = await fetch(`${node}chain`);
      const json = await response.json();
      const length = json.length;
      const chain = json.chain;

      return { length, chain };
    })
  );

  datas.forEach(({ length, chain }) => {
    if (length > currentLen && blockchain.checkChainValidity(chain)) {
      currentLen = length;
      longestChain = chain;
    }
  });

  if (longestChain) {
    blockchain = longestChain;
    return true;
  }

  return false;
}

// A function to announce to the network once a block has been mined.
// Other blocks can simply verify the proof of work and add it to their
// respective chains.
async function announceNewBlock(block: Block) {
  return Promise.all(
    [...peers].map(async peer => {
      const url = `${peer}addBlock`;
      const headers = { "Content-Type": "application/json" };
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(block),
        headers
      });

      await response.text();
    })
  );
}

app.listen(8080, "0.0.0.0", () => console.log("App ready"));

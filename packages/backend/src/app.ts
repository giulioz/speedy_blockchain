import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";

import { Blockchain, ChainState, Block } from "@speedy_blockchain/common";
import AppState from "./AppState";

const app = express();
app.use(bodyParser.json());
app.use(cors());
export default app;

const appState = new AppState();

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

  appState.currentBlockchain.addNewTransaction(txData);

  res.status(201).send("Success");
});

// endpoint to return the node's copy of the chain.
// Our application will be using this endpoint to query
// all the posts to display.
function getChain(): ChainState {
  const chain: Block[] = [];
  appState.currentBlockchain.chain.forEach(block => chain.push(block));

  return {
    length: chain.length,
    chain,
    peers: [...appState.peers]
  };
}
app.get("/chain", (req, res) => {
  res.send(getChain());
});

// endpoint to request the node to mine the unconfirmed
// transactions (if any). We'll be using it to initiate
// a command to mine from our application itself.
app.get("/mine", async (req, res) => {
  const result = appState.currentBlockchain.mine();
  if (!result) {
    res.send("No transactions to mine");
  } else {
    // Making sure we have the longest chain before announcing to the network
    const chainLength = appState.currentBlockchain.chain.length;
    await consensus();
    if (chainLength === appState.currentBlockchain.chain.length) {
      // announce the recently mined block to the network
      announceNewBlock(appState.currentBlockchain.lastBlock);
    }

    res.send(`Block #${appState.currentBlockchain.lastBlock.index} is mined.`);
  }
});

// endpoint to add new peers to the network.
app.post("/register_node", (req, res) => {
  const nodeAddress = req.body.node_address;
  if (!nodeAddress) {
    res.status(400).send("Invalid data");
    return;
  }

  // Add the node to the peer list
  appState.peers.add(nodeAddress);

  // Return the consensus blockchain to the newly registered node
  // so that he can sync
  res.send(getChain());
});

app.post("/register_with", async (req, res) => {
  // Internally calls the `register_node` endpoint to
  // register current node with the node specified in the
  // request, and sync the blockchain as well as peer data.
  const nodeAddress = req.body.node_address;
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
    appState.currentBlockchain = createChainFromDump(chainDump);
    json.peers.forEach(p => appState.currentBlockchain.add(p));
    res.status(200).send("Registration successful");
  }
  // if something goes wrong, pass it on to the API response
  else {
    res.status(response.status).send(await response.text());
  }
});

function createChainFromDump(chainDump: Block[]) {
  const generatedBlockchain = new Blockchain();
  generatedBlockchain.createGenesisBlock();
  chainDump.forEach((blockData, idx) => {
    if (idx === 0) {
      // skip genesis block
    } else {
      const proof = blockData.hash;
      const added = generatedBlockchain.addBlock(blockData, proof);
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
app.post("/add_block", (req, res) => {
  const blockData = req.body as Block;

  const proof = blockData.hash;
  const added = appState.currentBlockchain.addBlock(blockData, proof);

  if (!added) {
    res.status(400).send("The block was discarded by the node");
  } else {
    res.status(201).send("Block added to the chain");
  }
});

// endpoint to query unconfirmed transactions
app.get("/pending_tx", (req, res) => {
  res.send(appState.currentBlockchain.unconfirmedTransactions);
});

// Our naive consnsus algorithm. If a longer valid chain is
// found, our chain is replaced with it.
async function consensus() {
  let longestChain = null;
  let currentLen = appState.currentBlockchain.chain.length;

  const datas = await Promise.all(
    [...appState.peers].map(async node => {
      const response = await fetch(`${node}chain`);
      const json = await response.json();
      const length = json.length;
      const chain = json.chain;

      return { length, chain };
    })
  );

  datas.forEach(({ length, chain }) => {
    if (
      length > currentLen &&
      appState.currentBlockchain.checkChainValidity(chain)
    ) {
      currentLen = length;
      longestChain = chain;
    }
  });

  if (longestChain) {
    appState.currentBlockchain = longestChain;
    return true;
  }

  return false;
}

// A function to announce to the network once a block has been mined.
// Other blocks can simply verify the proof of work and add it to their
// respective chains.
async function announceNewBlock(block: Block) {
  return Promise.all(
    [...appState.peers].map(async peer => {
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

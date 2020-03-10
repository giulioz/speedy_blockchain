import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";

import { Block, utils } from "@speedy_blockchain/common";
import Node from "./Node";
import Miner from "./Miner";

export function createHttpApi(node: Node, miner: Miner) {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  // endpoint to submit a new transaction. This will be used by
  // our application to add new data (posts) to the blockchain
  app.post("/transaction", (req, res) => {
    const txData = req.body;
    const requiredFields = ["author", "content"];

    requiredFields.forEach(field => {
      if (!txData[field]) {
        res.status(404).send("Invalid transaction data");
        return;
      }
    });

    txData.timestamp = utils.getTimestamp();

    node.currentBlockchain.addNewTransaction(txData);

    res.status(201).send("Success");
  });

  // endpoint to return the node's copy of the chain.
  // Our application will be using this endpoint to query
  // all the posts to display.

  // TROPPA ROBA
  app.get("/chain", (req, res) => {
    res.send(node.getChain());
  });

  // endpoint to request the node to mine the unconfirmed
  // transactions (if any). We'll be using it to initiate
  // a command to mine from our application itself.

  // TOGLIERE -> AUTOMATICO
  app.get("/mine", async (req, res) => {
    const result = node.currentBlockchain.mine();
    if (!result) {
      res.send("No transactions to mine");
    } else {
      // Making sure we have the longest chain before announcing to the network
      const chainLength = node.currentBlockchain.chain.length;
      await node.consensus();
      if (chainLength === node.currentBlockchain.chain.length) {
        // announce the recently mined block to the network
        node.announceNewBlock(node.currentBlockchain.lastBlock);
      }

      res.send(`Block #${node.currentBlockchain.lastBlock.index} is mined.`);
    }
  });

  // endpoint to add new peers to the network.

  // TOGLIERE -> AUTOMATICO
  app.post("/register_node", (req, res) => {
    const nodeAddress = req.body.node_address;
    if (!nodeAddress) {
      res.status(400).send("Invalid data");
      return;
    }

    // Add the node to the peer list
    node.peers.add(nodeAddress);

    // Return the consensus blockchain to the newly registered node
    // so that he can sync
    res.send(node.getChain());
  });

  // TOGLIERE -> AUTOMATICO
  app.post("/register_with", async (req, res) => {
    // Internally calls the `register_node` endpoint to
    // register current node with the node specified in the
    // request, and sync the blockchain as well as peer data.
    const nodeAddress = req.body.node_address;
    if (!nodeAddress) {
      res.status(400).send("Invalid data");
      return;
    }

    const data = { nodeAddress: req.originalUrl };

    // Make a request to register with remote node and obtain information
    const response = await fetch(nodeAddress + "/register_node", {
      method: "POST",
      body: JSON.stringify(data),
      headers:{ "Content-Type": "application/json" }
    });

    if (response.status === 200) {
      const json = await response.json();
      // update chain and the peers
      const chainDump = json.chain;
      node.setFromDump(chainDump);
      json.peers.forEach(p => node.peers.add(p));
      res.status(200).send("Registration successful");
    }
    // if something goes wrong, pass it on to the API response
    else {
      res.status(response.status).send(await response.text());
    }
  });

  // endpoint to add a block mined by someone else to
  // the node's chain. The block is first verified by the node
  // and then added to the chain.
  app.post("/block", (req, res) => {
    const blockData = req.body as Block;

    const proof = blockData.hash;
    const added = node.currentBlockchain.addBlock(blockData, proof);

    if (!added) {
      res.status(400).send("The block was discarded by the node");
    } else {
      res.status(201).send("Block added to the chain");
    }
  });

  // endpoint to query unconfirmed transactions
  app.get("/pending_tx", (req, res) => {
    res.send(node.currentBlockchain.unconfirmedTransactions);
  });

  return app;
}

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Block, utils } from "@speedy_blockchain/common";
import Node from "./Node";

export function createHttpApi(node: Node) {
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

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
    // const requiredFields = ["author", "content"];

    // requiredFields.forEach(field => {
    //   if (!txData[field]) {
    //     res.status(404).send("Invalid transaction data");
    //     return;
    //   }
    // });

    txData.timestamp = utils.getTimestamp();

    node.pushTransaction(txData);

    res.status(201).send("Success");
  });

  // endpoint to return the node's copy of the chain.
  // Our application will be using this endpoint to query
  // all the posts to display.

  // TROPPA ROBA
  app.get("/chain", (req, res) => {
    res.send(node.getChain());
  });

  return app;
}

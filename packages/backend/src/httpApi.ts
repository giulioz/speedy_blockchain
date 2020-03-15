import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import Node from "./Node";
import { safeEndpoint as ep } from "./safeEndpoints";

export function createHttpApi(node: Node) {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  // get a block by id
  ep(app, "GET /block/:blockId", (req, res) => {
    const found = node.currentBlockchain.findBlockById(
      parseInt(req.params.blockId, 10)
    );

    if (found) {
      res.send(found);
    } else {
      res.status(404).send("Block not found.");
    }
  });

  // get a transaction by id and block id
  ep(app, "GET /block/:blockId/:transactionId", (req, res) => {
    const found = node.currentBlockchain.findTransactionById(
      req.params.transactionId,
      parseInt(req.params.blockId, 10)
    );

    if (found) {
      res.send(found);
    } else {
      res.status(404).send("Transaction not found.");
    }
  });

  // get a transaction by id
  ep(app, "GET /transaction/:id", (req, res) => {
    const found = node.currentBlockchain.findTransactionById(req.params.id);

    if (found) {
      res.send(found);
    } else {
      res.status(404).send("Transaction not found.");
    }
  });

  // submit a new transaction with content
  ep(app, "POST /transaction", (req, res) => {
    node.currentBlockchain.pushTransaction(req.body);

    res.status(201).send("Success");
  });

  // get current peers status of the node
  ep(app, "GET /peers", (req, res) => {
    res.send({ peers: node.peers });
  });

  return app;
}

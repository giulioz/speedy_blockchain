import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as db from './db';
import Node from "./Node";
import { safeEndpoint as ep } from "./safeEndpoints";
import * as NodeCommunication from "./NodeCommunication";
export function createHttpApi(node: Node) {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  // get block by id range
  ep(app, "GET /blocks/from/:from/to/:to", (req, res) => {
    const from = parseInt(req.params.from, 10);
    const to = parseInt(req.params.to, 10);
    const blocks = node.currentBlockchain.getBlocksRange(from, to);

    res.send(blocks);
  });

  // get last block
  ep(app, "GET /block/last", (req, res) => {
    const last = node.currentBlockchain.lastBlock;
    
    if (last) {
      res.send(last);
    } else {
      res.status(404).send("Block not found.");
    }
  });

  // get a block by id
  ep(app, "GET /block/:blockId", (req, res) => {
    const id = parseInt(req.params.blockId, 10);
    const found = node.currentBlockchain.findBlockById(id);

    if (found) {
      res.send(found);
    } else {
      res.status(404).send("Block not found.");
    }
  });

  // get a transaction by id and block id
  ep(app, "GET /block/:blockId/:transactionId", (req, res) => {
    const id = parseInt(req.params.blockId, 10);
    const found = node.currentBlockchain.findTransactionById(
      req.params.transactionId,
      id
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


  // just for test purpose
  ep(app, "GET /test", async (req, res) => {
    res.status(201).send(node.currentBlockchain);
  });

  // register a new node
  ep(app, "PUT /peers/:name", (req, res) => {
    console.log("REGISTER NEW NODE WITH IP -> " + req.body.ip + " " + req.body.port);
    node.peersState.insertIncomingPeer(req.body);
    NodeCommunication.sendPeersListToOtherNodes(node.peersState);
    // send 
    res.status(201).send("Success");
  });

  ep(app, "PUT /peers", (req, res) => {
    console.log("REPLACE peers object");
    node.peersState.peers = [...req.body.peers];
    // send
    res.status(201).send("Success");
  })

  // get current peers status of the node
  ep(app, "GET /peers", (req, res) => {
    res.send(node.peersState);
  });

  return app;
}

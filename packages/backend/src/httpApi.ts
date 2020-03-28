import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Node from "./Node";
import ep from "./safeEndpoints";
import * as NodeCommunication from "./NodeCommunication";

export default function createHttpApi(node: Node) {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  // get chain info
  ep(app, "GET /chainInfo", (req, res) => {
    res.send({
      status: "ok",
      data: {
        peer: NodeCommunication.getSelfPeer(),
        length: node.currentBlockchain.maxLength,
        lastHash: node.currentBlockchain.lastBlock.hash,
      },
    });
  });

  // get block by id range
  ep(app, "GET /blocks/from/:from/to/:to", (req, res) => {
    const from = parseInt(req.params.from, 10);
    const to = parseInt(req.params.to, 10);
    const blocks = node.currentBlockchain.getBlocksRange(from, to);

    res.send({
      status: "ok",
      data: blocks,
    });
  });

  // post a new block
  ep(app, "POST /block", (req, res) => {
    const success = node.addBlock(req.body);

    if (success) {
      res.send({
        status: "ok",
        data: null,
      });
    } else {
      res.status(500).send({ status: "error", error: "Invalid block" });
    }
  });

  // get last block
  ep(app, "GET /block/last", (req, res) => {
    const last = node.currentBlockchain.lastBlock;

    if (last) {
      res.send({
        status: "ok",
        data: last,
      });
    } else {
      res.status(404).send({ status: "error", error: "Block not found." });
    }
  });

  // get a block by id
  ep(app, "GET /block/:blockId", (req, res) => {
    const id = parseInt(req.params.blockId, 10);
    const found = node.currentBlockchain.findBlockById(id);

    if (found) {
      res.send({
        status: "ok",
        data: found,
      });
    } else {
      res.status(404).send({ status: "error", error: "Block not found." });
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
      res.send({
        status: "ok",
        data: found,
      });
    } else {
      res
        .status(404)
        .send({ status: "error", error: "Transaction not found." });
    }
  });

  // get a transaction by id
  ep(app, "GET /transaction/:id", (req, res) => {
    const found = node.currentBlockchain.findTransactionById(req.params.id);

    if (found) {
      res.send({
        status: "ok",
        data: found,
      });
    } else {
      res
        .status(404)
        .send({ status: "error", error: "Transaction not found." });
    }
  });

  // submit a new transaction (from other nodes)
  ep(app, "POST /transaction", (req, res) => {
    node.pushTransaction(req.body);

    res.status(201).send({ status: "ok", data: null });
  });

  ep(app, "POST /query/carrier", async (req, res) => {
    const result = await node.queryCarrier(req.body);

    res.status(201).send({ status: "ok", data: result });
  });

  ep(app, "POST /query/flight", async (req, res) => {
    const result = await node.queryFlights(req.body);

    res.status(201).send({ status: "ok", data: result });
  });

  // submit a new transaction with content
  ep(app, "POST /flight", (req, res) => {
    node.pushTransactionContent(req.body);

    res.status(201).send({ status: "ok", data: null });
  });

  // register a new node
  ep(app, "POST /announce", (req, res) => {
    node.addPeer(req.body);
    res.status(201).send({ status: "ok", data: null });
  });

  // get current peers status of the node
  ep(app, "GET /peers", (req, res) => {
    res.send({
      status: "ok",
      data: [...node.peers, NodeCommunication.getSelfPeer()],
    });
  });

  return app;
}

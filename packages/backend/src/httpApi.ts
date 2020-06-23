import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import Node from "./Node";
import ep from "./safeEndpoints";
import * as NodeCommunication from "./NodeCommunication";

export default function createHttpApi(node: Node) {
  const app = express();
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(cors());
  app.use(express.static(path.join(__dirname, "../../../../frontend/build/")));

  // get chain info
  ep(app, "GET /chainInfo", async (req, res) => {
    const lastBlock = await node.getLastBlock();

    if (lastBlock) {
      res.send({
        status: "ok",
        data: {
          peer: NodeCommunication.getSelfPeer(),
          length: node.blocksCount,
          transactionCount: node.transactionCount,
          lastHash: lastBlock.hash,
        },
      });
    } else {
      res.status(404).send({ status: "error", error: "No lastBlock" });
    }
  });

  // get block by id range
  ep(app, "GET /blocks/from/:from/to/:to", async (req, res) => {
    const from = parseInt(req.params.from, 10);
    const to = parseInt(req.params.to, 10);
    if (isNaN(from) || isNaN(to)) {
      res.status(404).send({ status: "error", error: "Block not found." });
      return;
    }

    const blocks = await node.getBlocksRange(from, to);

    res.send({
      status: "ok",
      data: blocks,
    });
  });

  // post a new block
  ep(app, "POST /block", async (req, res) => {
    console.log(`RECEIVED BLOCK ${req.body.index}`);

    const success = await node.addBlock(req.body);

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
  ep(app, "GET /block/last", async (req, res) => {
    const lastBlock = await node.getLastBlock();

    if (lastBlock) {
      res.send({
        status: "ok",
        data: lastBlock,
      });
    } else {
      res.status(404).send({ status: "error", error: "Block not found." });
    }
  });

  // get a block by id
  ep(app, "GET /block/:blockId", async (req, res) => {
    const id = parseInt(req.params.blockId, 10);
    if (isNaN(id)) {
      res.status(404).send({ status: "error", error: "Block not found." });
      return;
    }

    const found = await node.tryFindBlockById(id);

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
  ep(app, "GET /block/:blockId/:transactionId", async (req, res) => {
    const id = parseInt(req.params.blockId, 10);
    if (isNaN(id)) {
      res.status(404).send({ status: "error", error: "Block not found." });
      return;
    }

    const found = await node.findTransactionById(req.params.transactionId, id);

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
  ep(app, "GET /transaction/:id", async (req, res) => {
    const found = await node.findTransactionById(req.params.id);

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
  ep(app, "POST /transaction", async (req, res) => {
    await node.pushTransaction(req.body);

    res.status(201).send({ status: "ok", data: null });
  });

  ep(app, "POST /query/carriers", async (req, res) => {
    const result = await node.queryCarrier(req.body);

    res.status(200).send({ status: "ok", data: result });
  });

  ep(app, "POST /query/route", async (req, res) => {
    const result = await node.queryRoute(req.body);

    res.status(200).send({ status: "ok", data: result });
  });

  ep(app, "POST /query/flights", async (req, res) => {
    const result = await node.queryFlights(req.body);

    res.status(200).send({ status: "ok", data: result });
  });

  // submit a new transaction with content
  ep(app, "POST /flight", async (req, res) => {
    await node.pushTransactionContent(req.body);

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

import dotenv from "dotenv";

import Node from "./Node";
import { createHttpApi } from "./httpApi";
import Miner from "./Miner";

dotenv.config();

const node = new Node();

const miner = new Miner({
  onError: err => {
    throw err;
  },
  onDone: data => console.log("DONE", data)
});

const httpApi = createHttpApi(node, miner);
const port = process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 8080;
httpApi.listen(port, process.env.NODE_HOST || "0.0.0.0", () =>
  console.log("Node listening on " + port)
);

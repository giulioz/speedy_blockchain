import dotenv from "dotenv";

import Node from "./Node";
import { createHttpApi } from "./httpApi";
import AsyncMiner from "./AsyncMiner";
import LevelDB from "./level/LevelDB";

dotenv.config();

const node = new Node();
// initialize levelDB
LevelDB.getInstance();

LevelDB.getInstance();

const miner = new AsyncMiner();

const httpApi = createHttpApi(node, miner);
const port = process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 8080;
httpApi.listen(port, process.env.NODE_HOST || "0.0.0.0", () =>
  console.log("Node listening on " + port)
);

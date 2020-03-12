import dotenv from "dotenv";

import Node from "./Node";
import { createHttpApi } from "./httpApi";
import LevelDB from "./level/LevelDB";
dotenv.config();

const node = new Node();
// initialize levelDB
LevelDB.getInstance();

const httpApi = createHttpApi(node);
const port = process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 8080;
httpApi.listen(port, process.env.NODE_HOST || "0.0.0.0", () =>
  console.log("Node listening on " + port)
);

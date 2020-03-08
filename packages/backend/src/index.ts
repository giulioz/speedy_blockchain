import dotenv from "dotenv";

import Node from "./Node";
import { createHttpApi } from "./httpApi";

dotenv.config();

const node = new Node();

const httpApi = createHttpApi(node);
const port = process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 8080;
httpApi.listen(port, process.env.NODE_HOST || "0.0.0.0", () =>
  console.log("Node listening on " + port)
);

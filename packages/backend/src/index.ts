require("dotenv").config();

/* eslint-disable-next-line import/first */
import Node from "./Node";
/* eslint-disable-next-line import/first */
import createHttpApi from "./httpApi";
/* eslint-disable-next-line import/first */
import { initDB } from "./db";

const minerName = process.env.MINER_NAME || "Miner";

async function main() {
  await initDB(minerName);

  const node = new Node();

  node.startMiningLoop();

  const httpApi = createHttpApi(node);
  const port = process.env.NODE_PORT
    ? parseInt(process.env.NODE_PORT, 10)
    : 8080;
  httpApi.listen(port, process.env.NODE_HOST || "0.0.0.0", () =>
    console.log(`Node listening on ${port}`)
  );
}

main();

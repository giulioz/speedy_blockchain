require("dotenv").config();

/* eslint-disable-next-line import/first */
import Node from "./Node";
/* eslint-disable-next-line import/first */
import createHttpApi from "./httpApi";
/* eslint-disable-next-line import/first */
import { initDB } from "./db";

const minerName = process.env.MINER_NAME || "Miner";
const port = process.env.NODE_PORT ? parseInt(process.env.NODE_PORT, 10) : 8080;

async function main() {
  await initDB(minerName);

  const node = new Node();
  await node.checkBlocksFromDB();

  await node.initCommunication();

  const httpApi = createHttpApi(node);
  await new Promise(resolve => {
    httpApi.listen(port, "0.0.0.0", resolve);
  });
  console.log(`Node listening on ${port}`);

  node.startLoop();
}

main();

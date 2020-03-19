require("dotenv").config();

import Node from "./Node";
import { createHttpApi } from "./httpApi";
import { initDB, insert } from "./db";
import { Block } from "@speedy_blockchain/common/src";

const minerName = process.env.MINER_NAME || "Miner";

async function main() {
  await initDB(minerName);

  const node = new Node();
  let blocks: Block[] = [];
  (await node.getBlocksFromDB()).forEach(block => blocks.push(block.value)); // can't await inside a constructor -> how we can handle this?
  // non deve inziare a minare finchè non ha finito di prendersi i blocchi dal DB.
  if (blocks.length) {
    node.currentBlockchain.replaceChain(blocks);
  } else {
    node.currentBlockchain.pushGenesisBlock();
    insert(node.currentBlockchain.lastBlock);
  }  
  
  node.startMiningLoop();

  const httpApi = createHttpApi(node);
  const port = process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 8080;
  httpApi.listen(port, process.env.NODE_HOST || "0.0.0.0", () =>
    console.log("Node listening on " + port)
  );
}

main();

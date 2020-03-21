/* tslint:disable-next-line:no-var-requires */
require("dotenv").config();

import Node from "./Node";
import { createHttpApi } from "./httpApi";
import { initDB } from "./db";
import * as NodeCommunication from "./NodeCommunication";

const minerName = process.env.MINER_NAME || "Miner";

async function main() {
  await initDB(minerName);

  const node = new Node();
  await node.rehydrateBlocksFromDB();
  node.startMiningLoop();

  const httpApi = createHttpApi(node);

  const port = process.env.NODE_PORT
    ? parseInt(process.env.NODE_PORT, 10)
    : 8080;
  
  httpApi.listen(port, process.env.NODE_HOST || "0.0.0.0", async () => {
    if (!node.superPeer) {
      if ((await NodeCommunication.registerNodeToSuperPeer()).success) {
        const lastBlock = await NodeCommunication.getLastBlockFromSuperPeer();
        node.currentBlockchain.chain = [lastBlock]; // TODO: only for test - fix this
      }
      //await NodeCommunication.getDBFromSuperPeer();
    }
    console.log("Node listening on " + port);
  }
  );
}

main();

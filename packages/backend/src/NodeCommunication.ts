import fetch from "node-fetch";

import {
  Endpoints,
  ChainInfo,
  utils,
  Block,
  Transaction,
  AsyncMiner,
} from "@speedy_blockchain/common";
import Peer from "@speedy_blockchain/common/src/Peer";
import Blockchain from "@speedy_blockchain/common/src/Blockchain";
import {
  ParamsType,
  ReqType,
  ResType,
} from "@speedy_blockchain/common/src/utils";

const MAX_RETRY = 3; // max number to retry for a http call
const SLEEP_TIME = 1000; // time between retries

export const getSelfPeer = (): Peer => ({
  hostname: process.env.NODE_HOST || "",
  port: parseInt(process.env.NODE_PORT || "", 10),
  name: process.env.MINER_NAME || "",
  active: true,
  checkedAt: Date.now(),
});

export const getDiscoveryPeer = (): Peer => ({
  hostname: process.env.DISCOVERY_HOST || "",
  port: parseInt(process.env.DISCOVERY_PORT || "", 10),
  name: "",
  active: false,
  checkedAt: Date.now(),
});

export const isSuperBlock =
  process.env.NODE_HOST === process.env.DISCOVERY_HOST &&
  process.env.NODE_PORT === process.env.DISCOVERY_PORT;
if (isSuperBlock) {
  console.warn("I'm a superblock!");
}

export function serializePeer(peer: Peer) {
  return `http://${peer.hostname}:${peer.port}`;
}

async function httpCall<K extends keyof Endpoints>(
  peer: Peer,
  endpoint: K,
  params?: ParamsType<K> | null,
  body?: ReqType<K>
): Promise<ResType<K>> {
  const method = endpoint.split(" ")[0];
  const path = utils.withParameters(endpoint, params || {});

  const url = `${serializePeer(peer)}${path}`;
  const headers = { "Content-Type": "application/json" };
  const data = body && JSON.stringify(body);
  const options = {
    method,
    headers,
    body: method !== "GET" ? data : undefined,
  };

  let retry = 0;

  do {
    try {
      const response = await fetch(url, options);
      return response.json();
    } catch (err) {
      console.error(`[Comm error] ${err}`);
      await utils.sleep(SLEEP_TIME);
      retry += 1;
    }
  } while (retry < MAX_RETRY);

  throw new Error("Communication failure, max retry count reached.");
}

export async function initialBlockDownload(
  peers: Peer[],
  blockchain: Blockchain,
  miner: AsyncMiner
) {
  console.log("Starting initial block download...");

  // Get the chains from the peers
  const chains = (
    await Promise.all(peers.map(peer => httpCall(peer, "GET /chainInfo")))
  )
    .filter(r => r.status !== ("error" as const))
    .map(r => (r as { status: "ok"; data: ChainInfo }).data);

  if (chains.length === 0) {
    console.warn("No peer to perform IBD! Skipping...");
    return false;
  }

  // Find the longest chain, and select a random peer with the longest chain and the same hash
  const sortedChains = chains.sort((a, b) => b.length - a.length);
  const longestChainLength = sortedChains[0].length;
  const longestChainPeers = sortedChains.filter(
    chain => chain.length === longestChainLength
  );
  const mostFrequentHash = longestChainPeers
    .map((c, i, arr) => ({
      ...c,
      frequency: arr.filter(c2 => c2.lastHash === c.lastHash).length,
    }))
    .sort((a, b) => b.frequency - a.frequency)[0].lastHash;
  const sameHashPeers = longestChainPeers.filter(
    c => c.lastHash === mostFrequentHash
  );
  const syncPeer =
    sameHashPeers[Math.floor(Math.random() * sameHashPeers.length)].peer;

  let index = blockchain.lastBlock.index + 1;
  while (index < longestChainLength) {
    const block = await httpCall(syncPeer, "GET /block/:blockId", {
      blockId: index.toString(),
    });

    if (block.status === "error") {
      throw new Error("Invalid response in IBD");
    }

    if (!blockchain.addBlock(block.data, miner)) {
      throw new Error("Invalid block in longest chain in IBD");
    }

    index += 1;
  }

  if (blockchain.lastBlock.hash !== mostFrequentHash) {
    console.error(blockchain.lastBlock.hash, "VS", mostFrequentHash);
    throw new Error("Invalid longest chain in IBD");

    // TODO: Come gestiamo questa situazione? Buttiamo via tutto?
  }

  console.log("IBD Completed.");
  return true;
}

export async function announcement(peers: Peer[]) {
  await Promise.all(
    peers.map(p => httpCall(p, "POST /announce", null, getSelfPeer()))
  );
}

export async function fetchRemotePeers(initialPeers: Peer[]) {
  const unresponsivePeers: Peer[] = [];

  const reqPromises = initialPeers.map(p => ({
    p,
    promise: httpCall(p, "GET /peers"),
  }));

  const results = await Promise.all(
    reqPromises.map(({ p, promise }) =>
      promise.catch(e => {
        unresponsivePeers.push(p);
        console.warn(e);
        return "UNREACHABLE" as const;
      })
    )
  );
  const validResults = results
    .filter(result => result !== "UNREACHABLE" && result.status !== "error")
    .map(
      r =>
        (r as {
          status: "ok";
          data: Peer[];
        }).data
    );

  const allPeers = validResults.reduce((acc, c) => [...acc, ...c], []);
  const peersSerializedUnique = [...new Set(allPeers.map(serializePeer))];

  const unique = peersSerializedUnique.map(
    serializedPeer =>
      allPeers.find(p => serializePeer(p) === serializedPeer) as Peer
  );

  const reachable = unique.filter(
    p =>
      !unresponsivePeers.find(
        up => p.hostname === up.hostname && p.port === up.port
      )
  );

  return reachable;
}

export async function announceBlock(peers: Peer[], block: Block) {
  await Promise.all(
    peers.map(peer => httpCall(peer, "POST /block", null, block))
  );
}

export async function announceTransaction(
  peers: Peer[],
  transaction: Transaction
) {
  await Promise.all(
    peers.map(peer => httpCall(peer, "POST /transaction", null, transaction))
  );
}

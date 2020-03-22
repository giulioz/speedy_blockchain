import fetch from "node-fetch";

import { PeersState, Endpoints } from "@speedy_blockchain/common";
import { IncomingPeer } from "@speedy_blockchain/common/src/Peer";

const MAX_RETRY = 3; // max number to retry for a http call

export type ParamsType<K extends keyof Endpoints> = Endpoints[K]["params"];
export type ResType<K extends keyof Endpoints> = Endpoints[K]["res"];
export type ReqType<K extends keyof Endpoints> = Endpoints[K]["req"];

// TODO: This needs some testing...
function withParameters<K extends keyof Endpoints>(
  endpoint: K,
  params: ParamsType<K>
) {
  const url = endpoint
    .split(" ")
    .slice(1)
    .join(" ");

  return url
    .split("/")
    .map(part => {
      if (part.startsWith(":")) {
        return params[part.substring(1) as keyof ParamsType<K>];
      } else {
        return part;
      }
    })
    .join("/");
}

async function httpCall<K extends keyof Endpoints>(
  ip: string,
  port: number,
  endpoint: K,
  params?: ParamsType<K>,
  body?: ReqType<K>
): Promise<ResType<K>> {
  const method = endpoint.split(" ")[0];
  const path = withParameters(endpoint, params || {});

  const url = `http://${ip}:${port}/${path}`;
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
      retry += 1;
    }
  } while (retry < MAX_RETRY);

  throw new Error("Communication failure, max retry count reached.");
}

export async function sendPeersListToOtherNodes(peerList: PeersState) {
  peerList.peers.sort((peer1, peer2) => peer1.checkedAt - peer2.checkedAt);

  return Promise.all(
    peerList.peers.map(async peer => {
      if (
        peer.ip !== process.env.NODE_HOST ||
        peer.port !== parseInt(process.env.NODE_PORT || "", 10)
      ) {
        try {
          await httpCall(peer.ip, peer.port, "PUT /peers", peerList);

          /* eslint-disable-next-line no-param-reassign */
          peer.checkedAt = Date.now();
        } catch (err) {
          // TODO: remove peer from peerList if unavailable.
          console.log("REMOVE PEER - TODO");
        }
      }
    })
  );
}

export async function getLastBlockFromSuperPeer() {
  try {
    return await httpCall(
      process.env.LEADER_HOST || "",
      parseInt(process.env.LEADER_PORT || "", 10),
      "GET /block/last"
    );
  } catch (err) {
    throw new Error(`Unable to get last block from Super Peer! ${err}`);
  }
}

export async function registerNodeToSuperPeer() {
  if (
    process.env.MINER_NAME &&
    process.env.NODE_HOST &&
    process.env.NODE_PORT &&
    process.env.LEADER_HOST &&
    process.env.LEADER_PORT
  ) {
    const peer: IncomingPeer = {
      ip: process.env.NODE_HOST,
      port: parseInt(process.env.NODE_PORT, 10),
      name: process.env.MINER_NAME,
    };

    try {
      await httpCall(
        process.env.LEADER_HOST,
        parseInt(process.env.LEADER_PORT, 10),
        "PUT /peers/:id",
        { id: process.env.MINER_NAME },
        peer
      );

      return true;
    } catch (err) {
      throw new Error(`Unable to register to Super Peer! ${err}`);
    }
  }
}

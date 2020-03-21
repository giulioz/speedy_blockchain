import { PeersState } from "@speedy_blockchain/common/src";
import { IncomingPeer } from "@speedy_blockchain/common/src/Peer";
import fetch from "node-fetch";

const maxRetry = 3; // max number to retry for a http call

export async function sendPeersListToOtherNodes(peerList: PeersState) {
  peerList.peers.sort((peer1, peer2) => peer1.checkedAt - peer2.checkedAt);
  peerList.peers.forEach(async peer => {
    if (
      peer.ip !== process.env.NODE_HOST ||
      peer.port !== parseInt(process.env.NODE_PORT, 10)
    ) {
      if (
        !(await httpCall(peer.ip, peer.port, "PUT", "peers", peerList)).success
      ) {
        // TODO: remove peer from peerList if unavailable.
        console.log("REMOVE PEER - TODO");
      } else {
        peer.checkedAt = Date.now();
      }
    }
  });
}

async function httpCall(
  ip: string,
  port: number,
  method: string,
  entryPoint: string,
  body: any
) {
  let retry = 0;
  let success = false;
  let response = null;
  const url = "http://" + ip + ":" + port + "/" + entryPoint; // TODO: find a better way to do this
  const headers = { "Content-Type": "application/json" };
  const data = JSON.stringify(body);
  let options = null;
  if (method !== "GET") {
    options = {
      method,
      headers,
      body: data,
    };
  } else {
    options = {
      method,
      headers,
    };
  }
  // very brutto - FIX THIS!
  if (method !== "GET") {
    await fetch(url, options)
      .then(res => {
        success = true;
        response = res;
        console.log(response);
        // TODO: handle response, check status code
        return response;
      })
      .catch(err => {
        // TODO: Log error.
        console.error("[ERROR] " + err);
        retry++;
      })
      .catch(err => console.log(err));
  } else {
    // TODO:change this logic
    do {
      await fetch(url, options)
        .then(res => {
          success = true;
          // TODO: handle response, check status code
          return res.json();
        })
        .then(json => {
          response = json;
        })
        .catch(err => {
          // TODO: Log error.
          console.error("[ERROR] " + err);
          retry++;
        });
    } while (!success && retry < maxRetry);
  }
  return { success, data: response };
}

/*export async function getDBFromSuperPeer() {
    const data = await httpCall(process.env.LEADER_HOST, parseInt(process.env.LEADER_PORT), 'GET', 'db/', peer);
}*/

export async function getLastBlockFromSuperPeer() {
  const lastBlock = await httpCall(
    process.env.LEADER_HOST,
    parseInt(process.env.LEADER_PORT, 10),
    "GET",
    "block/last",
    null
  );
  console.log(lastBlock);
  if (lastBlock.success) {
    return lastBlock.data;
  }
}

export async function registerNodeToSuperPeer() {
  const peer: IncomingPeer = {
    ip: process.env.NODE_HOST,
    port: parseInt(process.env.NODE_PORT, 10),
    name: process.env.MINER_NAME,
  };
  return await httpCall(
    process.env.LEADER_HOST,
    parseInt(process.env.LEADER_PORT, 10),
    "PUT",
    "peers/" + process.env.MINER_NAME,
    peer
  );
}

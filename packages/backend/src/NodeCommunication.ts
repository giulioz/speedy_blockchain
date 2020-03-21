import { PeersState, Peer } from "@speedy_blockchain/common/src";
import { IncomingPeer } from "@speedy_blockchain/common/src/Peer";
const fetch = require("node-fetch");
const maxRetry = 3; // max number to retry a http call
export async function sendPeersListToOtherNodes(peerList: PeersState) {
    // for every node in
    peerList.peers.sort((peer1, peer2) => peer1.checkedAt - peer2.checkedAt);
    peerList.peers.forEach(async peer => {
        if (peer.ip != process.env.NODE_HOST || peer.port != parseInt(process.env.NODE_PORT)) {
            if (!(await httpCall(peer.ip, peer.port, 'PUT', 'peers', peerList))) {
                //TODO: remove peer from peerList if unavailable.
                console.log("REMOVE PEER - TODO");
            } else {
                peer.checkedAt = Date.now();
            }

        }
    });
}

async function httpCall(ip: string, port: number, method: string, entryPoint: string, body: any) {
    let retry = 0;
    let success = false;
    const url = 'http://' + ip + ':' + port + '/' + entryPoint; //TODO: find a better way to do this
    var headers = {"Content-Type": "application/json"};
    var data = JSON.stringify(body);
    do {
        await fetch(url, { method: method, headers: headers, body: data})
            .then((res) => {
                // TODO: handle response, check status code 
                success = true;
            })
            .catch((err) => {
                // TODO: Log error.
                console.error("[ERROR] " + err);
                retry++;
            });
    } while (!success && retry < maxRetry);
    return success;
}

export async function registerNodeToSuperPeer() {
    var peer: IncomingPeer = {
        ip: process.env.NODE_HOST,
        port: parseInt(process.env.NODE_PORT),
        name: process.env.MINER_NAME
    }
    return await httpCall(process.env.LEADER_HOST, parseInt(process.env.LEADER_PORT), 'PUT', 'peers/' + process.env.MINER_NAME, peer);
}
import Peer, { IncomingPeer } from "./Peer";

export default class PeersState {
  peers: Peer[] = [];

  insertIncomingPeer(incomingPeer: IncomingPeer) {
    const indexPeer = this.peers.findIndex(
      peer => peer.hostname === incomingPeer.hostname && peer.port === incomingPeer.port
    );
    if (indexPeer === -1) {
      this.peers.push({
        hostname: incomingPeer.hostname,
        port: incomingPeer.port,
        name: incomingPeer.name,
        active: true,
        checkedAt: Date.now(),
      });
    } else {
      this.peers[indexPeer].name = incomingPeer.name;
      this.peers[indexPeer].active = true;
      this.peers[indexPeer].checkedAt = Date.now();
    }
  }

  insertPeer(peer: Peer) {
    const indexPeer = this.peers.findIndex(
      _peer => _peer.hostname === peer.hostname && _peer.port === peer.port
    );
    if (indexPeer === -1) {
      this.peers.push(peer);
    } else {
      this.peers[indexPeer].name = peer.name;
      this.peers[indexPeer].active = true;
      this.peers[indexPeer].checkedAt = Date.now();
    }
  }
}

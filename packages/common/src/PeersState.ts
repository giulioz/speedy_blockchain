import Peer, { IncomingPeer } from "./Peer";

export default class PeersState {
  peers: Peer[] = [];

  insertIncomingPeer(incomingPeer: IncomingPeer) {
    const indexPeer = this.peers.findIndex(
      peer => peer.ip === incomingPeer.ip && peer.port === incomingPeer.port
    );
    if (indexPeer === -1) {
      this.peers.push({
        ip: incomingPeer.ip,
        port: incomingPeer.port,
        name: incomingPeer.name,
        active: true,
        superPeer: false,
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
      _peer => _peer.ip === peer.ip && _peer.port === peer.port
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

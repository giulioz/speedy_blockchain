export type IncomingPeer = Omit<Peer, "checkedAt"|"active"|"superPeer">;

export default interface Peer {
  ip: string;
  port: number;
  name: string;
  active: boolean; // worst case la mettiamo sempre a true
  checkedAt: number;
  superPeer: boolean;
}

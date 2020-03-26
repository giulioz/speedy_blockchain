import Transaction from "./Transaction";
import PeersState from "./PeersState";
import Peer, { IncomingPeer } from "./Peer";
import Block from "./Block";
import Blockchain from "./Blockchain";
import ChainInfo from "./ChainInfo";

export type ResponseStatus<T extends string = string> = { status: T };

export default interface Endpoints {
  "GET /chainInfo": {
    params: {};
    res: ChainInfo;
    req: null;
  };
  "GET /blocks/from/:from/to/:to": {
    params: { from: string; to: string };
    res: Block[];
    req: null;
  };
  "GET /block/last": {
    params: {};
    res: Block | ResponseStatus<"Block not found.">;
    req: null;
  };
  "GET /block/:blockId": {
    params: { blockId: string };
    res: Block | ResponseStatus<"Block not found.">;
    req: null;
  };
  "GET /block/:blockId/:transactionId": {
    params: { blockId: string; transactionId: string };
    res: Transaction | ResponseStatus;
    req: null;
  };
  "GET /transaction/:id": {
    params: { id: string };
    res: Transaction | ResponseStatus;
    req: null;
  };
  "POST /transaction": {
    params: {};
    res: ResponseStatus;
    req: Transaction["content"];
  };
  "GET /peers": {
    params: {};
    res: Peer[];
    req: null;
  };
  "POST /announce": {
    params: {};
    res: ResponseStatus;
    req: IncomingPeer;
  };

  "PUT /peers/:id": {
    params: { id: string };
    res: ResponseStatus;
    req: IncomingPeer;
  };

  "PUT /peers": {
    params: {};
    res: ResponseStatus;
    req: PeersState;
  };

  "GET /test": {
    params: {};
    res: Blockchain | Block | ResponseStatus;
    req: null;
  };
}

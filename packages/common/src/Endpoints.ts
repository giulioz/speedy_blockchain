import Transaction from "./Transaction";
import PeersState from "./PeersState";
import Block from "./Block";

export default interface Endpoints {
  "GET /block/:blockId": {
    params: { blockId: string };
    res: Block | string;
    req: never;
  };
  "GET /block/:blockId/:transactionId": {
    params: { blockId: string; transactionId: string };
    res: Transaction | string;
    req: never;
  };
  "GET /transaction/:id": {
    params: { id: string };
    res: Transaction | string;
    req: never;
  };
  "POST /transaction": {
    params: {};
    res: string;
    req: Transaction["content"];
  };
  "GET /peers": {
    params: {};
    res: PeersState;
    req: never;
  };
}

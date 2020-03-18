import Transaction from "./Transaction";
import PeersState from "./PeersState";
import Block from "./Block";

export default interface Endpoints {
  "GET /blocks/from/:from/to/:to": {
    params: { from: string; to: string };
    res: Block[];
    req: null;
  };
  "GET /block/:blockId": {
    params: { blockId: string };
    res: Block | string;
    req: null;
  };
  "GET /block/:blockId/:transactionId": {
    params: { blockId: string; transactionId: string };
    res: Transaction | string;
    req: null;
  };
  "GET /transaction/:id": {
    params: { id: string };
    res: Transaction | string;
    req: null;
  };
  "POST /transaction": {
    params: {};
    res: string;
    req: Transaction["content"];
  };
  "GET /peers": {
    params: {};
    res: PeersState;
    req: null;
  };
}

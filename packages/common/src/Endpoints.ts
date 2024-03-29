import Transaction from "./Transaction";
import Peer, { IncomingPeer } from "./Peer";
import Block from "./Block";
import ChainInfo from "./ChainInfo";
import {
  CarrierRequest,
  CarrierData,
  FlightsRequest,
  RouteData,
  RouteRequest,
} from "./Queries";
import Flight from "./Flight";

export type ResponseStatus<T = null, E extends string = string> =
  | { status: "error"; error: E }
  | { status: "ok"; data: T };

export default interface Endpoints {
  "GET /chainInfo": {
    params: {};
    res: ResponseStatus<ChainInfo>;
    req: null;
  };
  "GET /blocks/from/:from/to/:to": {
    params: { from: string; to: string };
    res: ResponseStatus<Block[]>;
    req: null;
  };
  "POST /block": {
    params: {};
    res: ResponseStatus;
    req: Block;
  };
  "GET /block/last": {
    params: {};
    res: ResponseStatus<Block, "Block not found.">;
    req: null;
  };
  "GET /block/:blockId": {
    params: { blockId: string };
    res: ResponseStatus<Block, "Block not found.">;
    req: null;
  };
  "GET /block/:blockId/:transactionId": {
    params: { blockId: string; transactionId: string };
    res: ResponseStatus<Transaction>;
    req: null;
  };
  "GET /transaction/:id": {
    params: { id: string };
    res: ResponseStatus<Transaction>;
    req: null;
  };
  "POST /transaction": {
    params: {};
    res: ResponseStatus;
    req: Transaction;
  };
  "POST /flight": {
    params: {};
    res: ResponseStatus;
    req: Transaction["content"];
  };
  "POST /query/carriers": {
    params: {};
    res: ResponseStatus<CarrierData>;
    req: CarrierRequest;
  };
  "POST /query/flights": {
    params: {};
    res: ResponseStatus<Flight[]>;
    req: FlightsRequest;
  };
  "POST /query/route": {
    params: {};
    res: ResponseStatus<RouteData>;
    req: RouteRequest;
  };
  "GET /peers": {
    params: {};
    res: ResponseStatus<Peer[]>;
    req: null;
  };
  "POST /announce": {
    params: {};
    res: ResponseStatus;
    req: IncomingPeer;
  };
}

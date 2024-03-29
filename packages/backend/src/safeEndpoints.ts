import express from "express";
/* eslint-disable-next-line import/no-unresolved */
import { RequestHandler } from "express-serve-static-core";
import { Endpoints } from "@speedy_blockchain/common";
import {
  ParamsType,
  ResType,
  ReqType,
} from "@speedy_blockchain/common/src/utils";

export default function safeEndpoint<K extends keyof Endpoints>(
  app: ReturnType<typeof express>,
  endpoint: K,
  handler: RequestHandler<ParamsType<K>, ResType<K>, ReqType<K>>
) {
  if (endpoint.startsWith("GET ")) {
    app.get<ParamsType<K>, ResType<K>, ReqType<K>>(
      endpoint.substr("GET ".length),
      handler
    );
  } else if (endpoint.startsWith("POST ")) {
    app.post<ParamsType<K>, ResType<K>, ReqType<K>>(
      endpoint.substr("POST ".length),
      handler
    );
  } else if (endpoint.startsWith("PUT ")) {
    app.put<ParamsType<K>, ResType<K>, ReqType<K>>(
      endpoint.substr("PUT ".length),
      handler
    );
  } else {
    throw new Error("Not implemented");
  }
}

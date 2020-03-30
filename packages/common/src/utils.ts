import crypto from "crypto";
import { createBlock, computeBlockHash } from "./Block";
import { sortAsExpected } from "./Transaction";
import Endpoints from "./Endpoints";

export type ParamsType<K extends keyof Endpoints> = Endpoints[K]["params"];
export type ResType<K extends keyof Endpoints> = Endpoints[K]["res"];
export type ReqType<K extends keyof Endpoints> = Endpoints[K]["req"];

// TODO: This needs some testing...
export function withParameters<K extends keyof Endpoints>(
  endpoint: K,
  params: ParamsType<K>
) {
  const url = endpoint
    .split(" ")
    .slice(1)
    .join(" ");

  return url
    .split("/")
    .map(part => {
      if (part.startsWith(":")) {
        return params[part.substring(1) as keyof ParamsType<K>];
      } else {
        return part;
      }
    })
    .join("/");
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export function sha256(str: string) {
  return crypto
    .createHash("sha256")
    .update(str, "utf8")
    .digest("hex");
}

export function genZeroes(count: number) {
  return new Array(count).fill("0").join("");
}

export function getTimestamp() {
  return new Date().getTime();
}

export { createBlock, computeBlockHash, sortAsExpected };

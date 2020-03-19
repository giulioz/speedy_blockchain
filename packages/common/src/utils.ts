import crypto from "crypto";
import { createBlock, computeBlockHash } from "./Block";
import { sortAsExpected } from "./Transaction";

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

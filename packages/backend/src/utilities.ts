import crypto from "crypto";

export function sha256(str: string) {
  return crypto
    .createHash("sha256")
    .update(str, "utf8")
    .digest("hex");
}

export function genZeroes(count: number) {
  return new Array(count).fill("0").join("");
}

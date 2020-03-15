import { Endpoints } from "@speedy_blockchain/common/dist";
import config from "../config";

type ParamsType<K extends keyof Endpoints> = Endpoints[K]["params"];
type ResType<K extends keyof Endpoints> = Endpoints[K]["res"];
type ReqType<K extends keyof Endpoints> = Endpoints[K]["req"];

// TODO: This needs some testing...
function withParameters<K extends keyof Endpoints>(
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
        return params[part.substring(1)];
      } else {
        return part;
      }
    })
    .join("/");
}

export default async function apiCall<K extends keyof Endpoints>(
  endpoint: K,
  options: { params: ParamsType<K>; body: ReqType<K> }
): Promise<ResType<K>> {
  const method = endpoint.split(" ")[0];
  const url = withParameters(endpoint, options.params);

  const res = await fetch(config.apiURL + url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body:
      method !== "HEAD" && method !== "GET"
        ? JSON.stringify(options.body)
        : undefined
  });

  const data: ResType<K> = await res.json();
  return data;
}

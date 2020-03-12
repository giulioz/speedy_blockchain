import config from "../config";

export interface APIOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Object;
}

export default async function apiCall<T>(
  endpoint: string,
  options: APIOptions = {}
): Promise<T> {
  const res = await fetch(config.apiURL + endpoint, {
    method: options.method,
    body: JSON.stringify(options.body)
  });
  const data: T = await res.json();
  return data;
}

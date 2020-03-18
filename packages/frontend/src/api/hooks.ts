import { useEffect, useState } from "react";

import { Endpoints } from "@speedy_blockchain/common";
import apiCall, { ResType, ParamsType } from "./apiCall";

export function useRemoteData<K extends keyof Endpoints>(
  endpoint: K,
  params: ParamsType<K>
) {
  const [data, setData] = useState<ResType<K> | null>(null);
  useEffect(() => {
    async function loadData() {
      const data = await apiCall(endpoint, { params, body: null });
      setData(data);
    }

    loadData();
  }, [endpoint, params]);

  return data;
}

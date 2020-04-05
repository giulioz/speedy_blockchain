import { useEffect, useState } from "react";

import { Endpoints, Block } from "@speedy_blockchain/common";
import { ResType, ParamsType } from "@speedy_blockchain/common/src/utils";
import apiCall from "./apiCall";

export function useRemoteData<K extends keyof Endpoints>(
  endpoint: K,
  params?: ParamsType<K>
) {
  const [data, setData] = useState<ResType<K> | null>(null);

  useEffect(() => {
    async function loadData() {
      const received = await apiCall(endpoint, {
        params: params || {},
        body: null,
      });
      setData(received);
    }

    loadData();
  }, [endpoint, params]);

  return data;
}

export function useLastNBlocks(maxBlocks: number) {
  const [data, setData] = useState<Block[] | null>(null);

  useEffect(() => {
    async function loadData() {
      const lastBlock = await apiCall("GET /block/last", {
        params: {},
        body: null,
      });

      if (lastBlock.status !== "error") {
        const lastIndex = lastBlock.data.index;
        const from = Math.max(0, lastIndex - maxBlocks);

        const blocks = await apiCall("GET /blocks/from/:from/to/:to", {
          params: { from: from.toString(), to: lastIndex.toString() },
          body: null,
        });

        if (blocks.status !== "error") {
          setData(blocks.data.reverse());
        }
      }
    }

    loadData();
  }, [maxBlocks]);

  return data;
}

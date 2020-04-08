import { useEffect, useState, useCallback } from "react";

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

export function useBlockLoader(chainLength: number) {
  const [data, setData] = useState<Block[] | null>(null);

  const loadMoreBlocks = useCallback(
    async ({
      startIndex,
      endIndex,
    }: {
      startIndex: number;
      endIndex: number;
    }) => {
      const to = Math.max(endIndex, chainLength);
      const from = startIndex || 0;
      const newBlocks = await apiCall("GET /blocks/from/:from/to/:to", {
        params: { from: from.toString(), to: to.toString() },
        body: null,
      });
      console.log("Blocks:", newBlocks);
      if (newBlocks.status !== "error") {
        setData(newBlocks.data.reverse());
      }
    },
    [setData, chainLength]
  );

  return { blocks: data, loadMoreBlocks };
}

export function useUpdatedChainLength() {
  const [chainLength, setChainLength] = useState<number>(0);
  const [isUpdating, setUpdating] = useState<number>(0);
  const update = useCallback(() => setUpdating(u => u + 1), [setUpdating]);

  const findChainLength = useCallback(async () => {
    const response = await apiCall("GET /chainInfo", {
      params: {},
      body: null,
    });

    if (response.status !== "error" && response.data.length > chainLength) {
      setChainLength(response.data.length);
    }
  }, [setChainLength, chainLength]);

  useEffect(() => {
    findChainLength();
    const timer = setTimeout(() => update(), 5000);
    return () => clearTimeout(timer);
  }, [findChainLength, isUpdating]);

  return { chainLength };
}

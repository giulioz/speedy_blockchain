import React, { useRef, useEffect, useState, useCallback } from "react";

export function useTimeout(timeout: number) {
  const [value, setValue] = useState<boolean>(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    function jump() {
      setValue(true);
    }

    timeoutRef.current = setTimeout(jump, timeout);
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, [timeout]);

  return value;
}

export function useNamedInputState<T>(initialState: T) {
  const [namedInputState, setState] = useState<T>(initialState);

  const setNamedInputState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setState({
      ...namedInputState,
      [target.name]: target.value,
    } as { [K in keyof T]: T[K] });
  };

  return { namedInputState, setNamedInputState };
}

export function useAsyncFormSearch<T, K>({
  initialState,
  apiCallback,
}: {
  initialState: T;
  apiCallback: (state: T) => Promise<K>;
}): {
  data: K | null;
  params: T;
  searching: boolean;
  onSearch: () => void;
  onNamedInputStateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
} {
  const { namedInputState, setNamedInputState } = useNamedInputState(
    initialState
  );
  const [searching, setSearching] = useState<boolean>(false);
  const [data, setData] = useState<K | null>(null);

  const handleSearch = () => setSearching(true);

  const searchData = useCallback(async () => {
    const data: K = await apiCallback(namedInputState);

    setSearching(false);
    setData(data);
  }, [apiCallback, setSearching, setData, namedInputState]);

  useEffect(() => {
    if (searching) {
      searchData();
    }
  }, [searching, searchData]);

  return {
    data,
    params: namedInputState,
    searching,
    onSearch: handleSearch,
    onNamedInputStateChange: setNamedInputState,
  };
}

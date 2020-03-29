import React, { useRef, useEffect, useState } from "react";

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
  isMock = false,
}: {
  initialState: T;
  apiCallback: (state?: T) => K;
  isMock?: boolean;
}): {
  data: K | null;
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

  const searchData = React.useCallback(async () => {
    const mocked = new Promise<K>(resolve =>
      setTimeout(() => {
        resolve(apiCallback());
      }, 1000)
    );
    const data: K = isMock ? await mocked : await apiCallback(namedInputState);

    setSearching(false);
    setData(data);
  }, [apiCallback, setSearching, setData, isMock, namedInputState]);

  useEffect(() => {
    if (searching) {
      searchData();
    }
  }, [searching, searchData]);

  return {
    data,
    searching,
    onSearch: handleSearch,
    onNamedInputStateChange: setNamedInputState,
  };
}

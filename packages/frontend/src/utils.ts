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

export function useInfiniteLoader(_listRef: any, props: any): any {
  const {
    loadMoreItems,
    isItemLoaded,
    itemCount,
    minimumBatchSize = 10,
    threshold = 15,
  } = props;

  const _isItemLoaded = useUpdatedRef(isItemLoaded);
  const _loadMoreItems = useUpdatedRef(loadMoreItems);
  const _itemCount = useUpdatedRef(itemCount);

  const _lastRenderedStartIndex = React.useRef(-1);
  const _lastRenderedStopIndex = React.useRef(-1);
  const _memoizedUnloadedRanges = React.useRef([]);

  function useUpdatedRef(value: any) {
    const ref = React.useRef(value);

    React.useLayoutEffect(() => {
      ref.current = value;
    }, [value]);

    return ref;
  }
  function isRangeVisible({
    lastRenderedStartIndex,
    lastRenderedStopIndex,
    startIndex,
    stopIndex,
  }: any) {
    return !(
      startIndex > lastRenderedStopIndex || stopIndex < lastRenderedStartIndex
    );
  }
  function isInteger(value: any) {
    return (
      typeof value === "number" &&
      isFinite(value) &&
      Math.floor(value) === value
    );
  }

  function scanForUnloadedRanges({
    isItemLoaded,
    itemCount,
    minimumBatchSize,
    startIndex,
    stopIndex,
  }: any) {
    const unloadedRanges = [];

    let rangeStartIndex = null;
    let rangeStopIndex = null;

    for (let index = startIndex; index <= stopIndex; index++) {
      let loaded = isItemLoaded(index);

      if (!loaded) {
        rangeStopIndex = index;
        if (rangeStartIndex === null) {
          rangeStartIndex = index;
        }
      } else if (rangeStopIndex !== null) {
        unloadedRanges.push([rangeStartIndex, rangeStopIndex]);

        rangeStartIndex = rangeStopIndex = null;
      }
    }

    // If :rangeStopIndex is not null it means we haven't ran out of unloaded rows.
    // Scan forward to try filling our :minimumBatchSize.
    if (rangeStopIndex !== null) {
      const potentialStopIndex = Math.min(
        Math.max(rangeStopIndex, rangeStartIndex + minimumBatchSize - 1),
        itemCount - 1
      );

      for (
        let index = rangeStopIndex + 1;
        index <= potentialStopIndex;
        index++
      ) {
        if (!isItemLoaded(index)) {
          rangeStopIndex = index;
        } else {
          break;
        }
      }

      unloadedRanges.push([rangeStartIndex, rangeStopIndex]);
    }

    // Check to see if our first range ended prematurely.
    // In this case we should scan backwards to try filling our :minimumBatchSize.
    if (unloadedRanges.length) {
      let firstRange = unloadedRanges[0];

      while (
        firstRange[1] - firstRange[0] + 1 < minimumBatchSize &&
        firstRange[0] > 0
      ) {
        let index = firstRange[0] - 1;

        if (!isItemLoaded(index)) {
          firstRange[0] = index;
        } else {
          break;
        }
      }
    }

    return unloadedRanges;
  }

  // eslint-disable-next-line
  return React.useMemo(() => {
    function resetLoadMoreItemsCache(autoReload = false) {
      _memoizedUnloadedRanges.current = [];

      if (autoReload) {
        _ensureRowsLoaded(
          _lastRenderedStartIndex.current,
          _lastRenderedStopIndex.current
        );
      }
    }

    function onItemsRendered({ visibleStartIndex, visibleStopIndex }: any) {
      if (process.env.NODE_ENV !== "production") {
        if (!isInteger(visibleStartIndex) || !isInteger(visibleStopIndex)) {
          console.warn(
            "Invalid onItemsRendered signature; please refer to InfiniteLoader documentation."
          );
        }
      }

      _lastRenderedStartIndex.current = visibleStartIndex;
      _lastRenderedStopIndex.current = visibleStopIndex;

      _ensureRowsLoaded(visibleStartIndex, visibleStopIndex);
    }

    function _ensureRowsLoaded(startIndex: any, stopIndex: any) {
      const unloadedRanges = scanForUnloadedRanges({
        isItemLoaded: _isItemLoaded.current,
        itemCount: _itemCount.current,
        minimumBatchSize,
        startIndex: Math.max(0, startIndex - threshold),
        stopIndex: Math.min(_itemCount.current - 1, stopIndex + threshold),
      });

      // Avoid calling load-rows unless range has changed.
      // This shouldn't be strictly necsesary, but is maybe nice to do.
      if (
        _memoizedUnloadedRanges.current.length !== unloadedRanges.length ||
        _memoizedUnloadedRanges.current.some(
          ([startIndex, stopIndex], index) =>
            unloadedRanges[index][0] !== startIndex ||
            unloadedRanges[index][1] !== stopIndex
        )
      ) {
        _memoizedUnloadedRanges.current = unloadedRanges as any;
        _loadUnloadedRanges(unloadedRanges);
      }
    }

    function _loadUnloadedRanges(unloadedRanges: any) {
      unloadedRanges.forEach(([startIndex, stopIndex]: any[]) => {
        let promise = _loadMoreItems.current(startIndex, stopIndex);
        if (promise != null) {
          promise.then(() => {
            // Refresh the visible rows if any of them have just been loaded.
            // Otherwise they will remain in their unloaded visual state.
            if (
              isRangeVisible({
                lastRenderedStartIndex: _lastRenderedStartIndex.current,
                lastRenderedStopIndex: _lastRenderedStopIndex.current,
                startIndex,
                stopIndex,
              })
            ) {
              // Handle an unmount while promises are still in flight.
              if (_listRef.current == null) {
                return;
              }

              // Resize cached row sizes for VariableSizeList,
              // otherwise just re-render the list.
              if (typeof _listRef.current.resetAfterIndex === "function") {
                _listRef.current.resetAfterIndex(startIndex, true);
              } else {
                // HACK reset temporarily cached item styles to force PureComponent to re-render.
                // This is pretty gross, but I'm okay with it for now.
                // Don't judge me.
                if (typeof _listRef.current._getItemStyleCache === "function") {
                  _listRef.current._getItemStyleCache(-1);
                }
                _listRef.current.forceUpdate();
              }
            }
          });
        }
      });
    }

    return {
      resetLoadMoreItemsCache,
      onItemsRendered,
      ref: _listRef,
    };
  }, []); // eslint-disable-line
}

import { useRef, useEffect, useState } from "react";

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

import { useEffect, useRef } from 'react';

/**
 * 1초 주기로 함수를 실행하는 커스텀 훅
 */
export function usePolling(callback: () => void, interval: number = 1000) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval]);
}


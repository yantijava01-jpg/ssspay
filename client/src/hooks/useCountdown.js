import { useState, useEffect, useRef } from "react";

/**
 * useCountdown — counts down from `seconds` to 0
 * @param {number} seconds - total seconds to count down
 * @param {Function} onComplete - called when reaches 0
 * @returns {{ remaining, percent, isRunning, start, reset }}
 */
const useCountdown = (seconds, onComplete) => {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const totalRef    = useRef(seconds);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = (overrideSeconds) => {
    clear();
    const total = overrideSeconds ?? seconds;
    totalRef.current = total;
    setRemaining(total);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const reset = () => {
    clear();
    setIsRunning(false);
    setRemaining(seconds);
  };

  useEffect(() => () => clear(), []);

  const percent = Math.round((remaining / totalRef.current) * 100);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return { remaining, percent, formatted: formatTime(remaining), isRunning, start, reset };
};

export default useCountdown;

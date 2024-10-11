import { useState, useEffect } from "react";

const useTimer = (start: boolean, duration: number, onEnd: () => void) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!start) return;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev >= duration) {
          clearInterval(timer);
          onEnd();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [start]);

  const formattedTime = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return { formattedTime, seconds };
};

export default useTimer;

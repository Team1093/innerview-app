import { useState, useEffect } from "react";

const useTimer = (isRecording: boolean, duration: number, onEnd: () => void) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    else {
      const timer = setInterval(() => {
        setSeconds((seconds) => {
          if (seconds >= duration) {
            onEnd(); // 종료 콜백 호출
            return 0;
          }
          return seconds + 1;
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [isRecording, seconds]);

  const formattedTime = `${Math.floor((duration - seconds) / 60)
    .toString()
    .padStart(2, "0")}:${((duration - seconds) % 60).toString().padStart(2, "0")}`;

  return { formattedTime, seconds };
};

export default useTimer;

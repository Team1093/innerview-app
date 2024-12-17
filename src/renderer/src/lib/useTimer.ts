// useTimer.ts
import { useState, useEffect, useRef } from "react";

const useTimer = (isRecording: boolean, duration: number, onEnd: () => void) => {
  const [seconds, setSeconds] = useState(0);
  const onEndRef = useRef(onEnd);

  // onEnd 콜백을 ref에 저장하여 최신 상태 유지
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!isRecording) {
      setSeconds(0); // 녹화가 시작되지 않았을 때 타이머 초기화
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds >= duration) {
          onEndRef.current(); // 종료 콜백 호출
          clearInterval(timer); // 타이머 정리
          return 0;
        }
        return prevSeconds + 1;
      });
    }, 1000);

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, [isRecording, duration]);

  const remaining = duration - seconds;
  const formattedTime = `${Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;

  return { formattedTime, seconds };
};

export default useTimer;

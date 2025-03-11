import { useState, useEffect, useRef } from 'react'

const useTimer = (isRecording: boolean, duration: number, onEnd: () => void) => {
  const [seconds, setSeconds] = useState(0) // 경과 시간
  const onEndRef = useRef(onEnd) // 최신 onEnd 콜백 저장
  const lastTimestamp = useRef<number | null>(null) // 마지막 프레임의 타임스탬프
  const accumulatedTime = useRef(0) // 멈췄을 때까지 누적된 경과 시간

  useEffect(() => {
    onEndRef.current = onEnd // onEnd 업데이트
  }, [onEnd])

  useEffect(() => {
    if (!isRecording) {
      // 타이머 멈추면 마지막까지 누적된 시간 저장
      lastTimestamp.current = null
      return
    }

    const updateTimer = (timestamp: number) => {
      if (lastTimestamp.current !== null) {
        // 경과 시간 계산
        const delta = timestamp - lastTimestamp.current
        accumulatedTime.current += delta

        // 초 단위 업데이트
        const newSeconds = Math.floor(accumulatedTime.current / 1000)
        if (newSeconds >= duration) {
          setSeconds(duration)
          onEndRef.current()
          return // 타이머 종료
        }

        setSeconds(newSeconds)
      }
      lastTimestamp.current = timestamp

      // 다음 프레임 요청
      requestAnimationFrame(updateTimer)
    }

    // 첫 프레임 요청
    requestAnimationFrame(updateTimer)

    return () => {
      // 타이머 정리
      lastTimestamp.current = null
    }
  }, [isRecording, duration])

  const remaining = Math.max(duration - seconds, 0)
  const formattedTime = `${Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`

  return { formattedTime, seconds }
}

export default useTimer

'use client'
import styles from '../styles/A6EndingScreen.module.css'
import useTimer from '../lib/useTimer'
import { Topic } from '../service/topic/interface'
import { Settings } from '../service/settings/interface'
import { useEffect, useRef } from 'react'
import QRcode from 'qrcode'
import { useService } from '@renderer/service/useService'

interface A6EndingScreenProps {
  nextScreen: (screenNumber: number) => void
  qrcodeLink: string
  topic: Topic
  settings: Settings
}

const A6EndingScreen: React.FC<A6EndingScreenProps> = ({
  nextScreen,
  qrcodeLink,
  topic,
  settings
}) => {
  const { facilityService } = useService()
  const QRcanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (QRcanvasRef.current) {
      QRcode.toCanvas(QRcanvasRef.current, qrcodeLink, {
        width: window.innerWidth * 0.3, // QR 코드 크기 (픽셀 단위)
        errorCorrectionLevel: 'M' // 오류 복구 수준 (L, M, Q, H)
      })
    }
  }, [qrcodeLink]) // URL이 변경될 때만 실행);

  const { formattedTime, seconds } = useTimer(true, 60, async () => {
    await facilityService.updateBoothStatus(settings.booth_id, 'idle')
    nextScreen(1)
  })
  const date = `${new Date().getFullYear()}- ${new Date().getMonth() + 1}- ${new Date().getDate()}`
  return (
    <>
      <div className={styles.screen}>
        <div className={styles.timer}>{formattedTime}</div>
        <div className={styles.section}>
          <h4>{topic.topic[settings.lang]}</h4>
        </div>
        <div className={styles.section}>
          {qrcodeLink !== '' ? (
            <div className={styles.qrbox}>
              <canvas ref={QRcanvasRef} className={styles.QR} />
            </div>
          ) : (
            <div className={styles.QR} />
          )}
          <p>{date}</p>
        </div>
        <div className={styles.section}>
          <p>
            Edited by <b>INNERVIEW</b>
          </p>
          <p className={styles.lastTime}>{60 - seconds} 초 후에 처음 화면으로 돌아갑니다.</p>
        </div>
      </div>
    </>
  )
}

export default A6EndingScreen

'use client'
import styles from '../styles/A1IdentificationScreen.module.css'
import { Settings } from '../service/settings/interface'
import QRcode from 'qrcode'
import { useEffect, useRef } from 'react'
import { useService } from '../service/useService'
import { DBUserData, DBReservation } from '../service/user/interface'

interface A1IdentificationScreenProps {
  nextScreen: (screenNumber: number) => void
  settings: Settings
  setInnerviewUser: (innerviewUser: DBUserData) => void
  setReservationInfo: (reservationInfo: DBReservation) => void
  setForceQuit: (forceQuit: boolean) => void
}

const A1IdentificationScreen: React.FC<A1IdentificationScreenProps> = ({
  nextScreen,
  settings,
  setInnerviewUser,
  setReservationInfo,
  setForceQuit
}) => {
  const URL = `https://innerview-client.vercel.app/identification/${settings.location}`
  const QRcanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (QRcanvasRef.current) {
      QRcode.toCanvas(QRcanvasRef.current, URL, {
        width: window.innerWidth * 0.3, // QR 코드 크기 (픽셀 단위)
        errorCorrectionLevel: 'M' // 오류 복구 수준 (L, M, Q, H)
      })
    }
  }, [URL]) // URL이 변경될 때만 실행);

  const { userService } = useService()

  useEffect(() => {
    const interval = setInterval(() => {
      userService.checkVerification(settings.location).then((res) => {
        if (res.state) {
          console.log(res)
          setInnerviewUser(res.user)
          setReservationInfo(res.reservation)
          // setForceQuit(res.forceQuit)
          // 모든 유저가 정시에 마치 수 있도록 forceQuit을 true로 설정
          setForceQuit(true)
          nextScreen(2)
        }
      })
    }, 1000)
    console.log('interval start')
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <p className={styles.logo}>INNERVIEW</p>
      <div className={styles.qrbox}>
        <canvas ref={QRcanvasRef} className={styles.QR} />
      </div>
      <div>
        <p className={styles.ment}>QR코드를 스캔하여 예약 확인을 진행해주세요.</p>
        <p className={styles.ment}>Please scan the QR code to verify your reservation.</p>
      </div>
    </div>
  )
}

export default A1IdentificationScreen

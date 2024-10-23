'use client'

import React, { useEffect, useState } from 'react'
import styles from '../styles/ColorSelectScreen.module.css'
import WebcamStream from '../components/WebcamStream'
import colorLogo from '../assets/images/BoothImgColor.svg'
import blackwhiteLogo from '../assets/images/BoothImgBNW.svg'
// import COLORbg from '../assets/images/noiseBg.svg'
// import BNWbg from '../assets/images/ColorSelectScreenBG.svg'
import { KEYS_SCREEN_BACK, KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT } from '../assets/constants'

interface ColorSelectScreenProps {
  nextScreen: (screenNumber: number) => void
  setVideoMode: (mode: string) => void
}

const WEBCAM_SIZE_VW = 45 // 640px in vw (640 / 1920 * 100)

const ColorSelectScreen: React.FC<ColorSelectScreenProps> = ({ nextScreen, setVideoMode }) => {
  const [selectedGrayScale, setSelectedGrayScale] = useState<boolean>(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_NEXT.includes(e.key) || KEYS_SCREEN_BACK.includes(e.key)) {
        setSelectedGrayScale((prev) => !prev)
      }
      if (KEYS_SCREEN_CONFIRM.includes(e.key)) {
        setVideoMode(selectedGrayScale ? 'black-and-white' : 'color')
        nextScreen(4)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [nextScreen, selectedGrayScale, setVideoMode])

  return (
    <div className={styles.screen}>
      <div className={`${styles.section} ${styles.alt} ${!selectedGrayScale && styles.selected}`}>
        <img src={colorLogo} alt="color" style={{ width: '27vw', height: '40vh' }} />
        <WebcamStream
          width={String(WEBCAM_SIZE_VW)+'vw'}
          height={String(WEBCAM_SIZE_VW * (9 / 16))+'vw'}
          ratio="16/9"
          isGrayScale={false}
        />
      </div>
      <div className={`${styles.section} ${selectedGrayScale && styles.selected}`}>
        <img src={blackwhiteLogo} alt="gray" style={{ width: '27vw', height: '40vh' }} />
        <WebcamStream
          width={String(WEBCAM_SIZE_VW)+'vw'}
          height={String(WEBCAM_SIZE_VW * (9 / 16))+'vw'}
          ratio="16/9"
          isGrayScale={true}
        />
      </div>
    </div>
  )
}

export default ColorSelectScreen

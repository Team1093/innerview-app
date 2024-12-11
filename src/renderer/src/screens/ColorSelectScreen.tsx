'use client'

import React, { useEffect } from 'react'
import styles from '../styles/ColorSelectScreen.module.css'
import WebcamStream from '../components/WebcamStream'
// import colorLogo from '../assets/images/BoothImgColor.svg'
// import blackwhiteLogo from '../assets/images/BoothImgBNW.svg'
// import COLORbg from '../assets/images/noiseBg.svg'
// import BNWbg from '../assets/images/ColorSelectScreenBG.svg'
import { KEYS_SCREEN_BACK, KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT } from '../assets/constants'

interface ColorSelectScreenProps {
  nextScreen: (screenNumber: number) => void
  setVideoMode: (mode: number) => void
  videoMode: number
  filters: string[]
}

const ColorSelectScreen: React.FC<ColorSelectScreenProps> = ({ nextScreen, setVideoMode, videoMode, filters }) => {


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_NEXT.includes(e.key) || KEYS_SCREEN_BACK.includes(e.key)) {
        if (e.key === 'ArrowRight') {
          setVideoMode((videoMode + 1) % filters.length)
        } else if (e.key === 'ArrowLeft') {
          setVideoMode((videoMode + filters.length - 1) % filters.length)
        }
      }
      if (KEYS_SCREEN_CONFIRM.includes(e.key)) {
        nextScreen(4)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [ videoMode])

  return (
    <div className={styles.screen}>
    
        <WebcamStream
          width="100%"
          height="100%"
          ratio="16/9"
          filter={filters[videoMode] ? filters[videoMode] : 'none'}
        />
      <div className = {styles.selection}>
        <div className={`${styles.filterBox} ${videoMode===0 ? styles.selected : styles.not_selected}`}>Original</div>
        <div className={`${styles.filterBox} ${videoMode===1 ? styles.selected : styles.not_selected}`}>Black&White</div>
        <div className={`${styles.filterBox} ${videoMode===2 ? styles.selected : styles.not_selected}`}>Vintage</div>
        <div className={`${styles.filterBox} ${videoMode===3 ? styles.selected : styles.not_selected}`}>Vintage2</div>
      </div>
    </div>
  )
}

export default ColorSelectScreen

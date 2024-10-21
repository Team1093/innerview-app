import React, { useEffect } from 'react'
import styles from '../styles/StartScreen.module.css'
import bgImage1 from '../assets/images/StartScreenImg.svg'
import { KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT, KEYS_SCREEN_BACK } from '../assets/constants'

interface StartScreenProps {
  lang: 'ko' | 'en'
  nextScreen: (screenNumber: number) => void
}

const StartScreen: React.FC<StartScreenProps> = ({ nextScreen }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_CONFIRM.includes(e.key) || KEYS_SCREEN_NEXT.includes(e.key) || KEYS_SCREEN_BACK.includes(e.key)) {
        nextScreen(2)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className={styles.screen}>
      <img className={styles.bg} src={bgImage1} alt="background"/>
    </div>
  )
}

export default StartScreen

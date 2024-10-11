import React, { useEffect } from 'react'
import styles from '../styles/StartScreen.module.css'
import bgImage1 from '../assets/images/background1.svg'
import { KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT, quotes } from '../assets/constants'
import NextIcon from '../assets/icons/NextIcon'

interface StartScreenProps {
  lang: 'ko' | 'en'
  nextScreen: (screenNumber: number) => void
}

const StartScreen: React.FC<StartScreenProps> = ({ lang, nextScreen }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_CONFIRM.includes(e.key) || KEYS_SCREEN_NEXT.includes(e.key)) {
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
      <NextIcon size={50} />
      <img className={styles.bg} src={bgImage1} alt="background" />
      <p className={styles.bottomText}>{quotes[14][lang]}</p>
    </div>
  )
}

export default StartScreen

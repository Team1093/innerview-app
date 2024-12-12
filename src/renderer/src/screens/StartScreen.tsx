import React, { useEffect, useState } from 'react'
import styles from '../styles/StartScreen.module.css'
import bgImage1 from '../assets/images/test_1.jpg'
import bgImage2 from '../assets/images/test_2.jpg'
import bgImage3 from '../assets/images/test_q1.jpg'
import bgImage4 from '../assets/images/test_q2.jpg'
import bgImage5 from '../assets/images/test_q3.jpg'
import bgImage6 from '../assets/images/test_q4.jpg'
import { KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT, KEYS_SCREEN_BACK } from '../assets/constants'

interface StartScreenProps {
  nextScreen: (screenNumber: number) => void
}

const StartScreen: React.FC<StartScreenProps> = ({ nextScreen }) => {
  const [page, setPage] = useState(1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_CONFIRM.includes(e.key) || KEYS_SCREEN_NEXT.includes(e.key) || KEYS_SCREEN_BACK.includes(e.key)) {
        setPage((prev) => {
          return prev + 1;
        })
        if (page > 5) { nextScreen(2) }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [page])

  return (
    <div className={styles.screen}>
      {page === 1 ? <img className={styles.bg} src={bgImage1} alt="background"/> : 
        page === 2 ? <img className={styles.bg} src={bgImage2} alt="background"/> : 
        page === 3 ? <img className={styles.bg} src={bgImage3} alt="background"/> :
        page === 4 ? <img className={styles.bg} src={bgImage4} alt="background"/> :
        page === 5 ? <img className={styles.bg} src={bgImage5} alt="background"/> :
        <img className={styles.bg} src={bgImage6} alt="background"/>
        }
    </div>
  )
}

export default StartScreen

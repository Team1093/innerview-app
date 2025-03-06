'use client'
import styles from '../styles/A5LastInfoScreen.module.css'
import { Settings } from '../service/settings/interface'
import underdog_ending from '../assets/videos/ending_guide.mp4'
import domansa_ending from '../assets/videos/ending_guide_domansa.mp4'
import seongsu_ending from '../assets/videos/seongsu_video.mp4'
import { useEffect } from 'react'

interface A5LastInfoScreenProps {
  nextScreen: (screenNumber: number) => void
  settings: Settings
}

const A5LastInfoScreen: React.FC<A5LastInfoScreenProps> = ({ nextScreen, settings }) => {
  const { location } = settings

  useEffect(() => {
    const handleQDown = (e: KeyboardEvent) => {
      if (e.key === 'q') {
        nextScreen(6)
      }
    }

    document.addEventListener('keydown', handleQDown)

    return () => {
      document.removeEventListener('keydown', handleQDown)
    }
  }, [])

  // const videoSrc = location === 'innerview' ? underdog_ending : seongsu_ending
  const videoSrc = domansa_ending
  return (
    <div className={styles.bg}>
      <video autoPlay className={styles.video} onEnded={() => nextScreen(6)}>
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  )
}

export default A5LastInfoScreen

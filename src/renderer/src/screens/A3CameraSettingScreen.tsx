'use client'
import styles from '../styles/A3CameraSettingScreen.module.css'
import useTimer from '../lib/useTimer'
import { KEYS_SCREEN_BACK, KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT,langText } from '../assets/constants'
import { useEffect } from 'react'
import WebcamStream from '../components/WebcamStream'
import gridBg from '../assets/images/gridBg.jpg'
import { Settings } from '../service/settings/interface'

interface A3CameraSettingScreenProps {
  nextScreen: (screenNumber: number) => void
  setVideoMode: (mode: number) => void
  videoMode: number
  filters: string[]
  settings : Settings
}

// 플로우 : 카메라 필터 4 가지 중에 고를 수 있도록 하기 -> 세팅 완료 후 다음 페이지로 넘어가기
// 개발 플로우 : 필터 OBS 에서 가져올 수 있도록 API 연동 필요

const A3CameraSettingScreen: React.FC<A3CameraSettingScreenProps> = ({ 
  nextScreen,
  setVideoMode,
  videoMode,
  filters,
  settings,
}) => {

  const { formattedTime } = useTimer(true, 60, () => nextScreen(4))

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_NEXT.includes(e.key)) 
          setVideoMode((videoMode + 1) % filters.length)
      else if ( KEYS_SCREEN_BACK.includes(e.key)) 
          setVideoMode((videoMode + filters.length - 1) % filters.length)
      else if (KEYS_SCREEN_CONFIRM.includes(e.key)) {
        nextScreen(4)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [videoMode])


  const headTitle : langText = { 
    ko: '원하시는 필터를 선택해주세요',
    en: 'Please select the filter you want'
  }

  return (

    <div className={styles.screen}>
    <img className={styles.bg} src={gridBg} alt="background"/>
    <div className={styles.title}>{headTitle[settings.lang]}</div>
      <div className={styles.videoBox}>
        <WebcamStream
          width="100%"
          height="auto"
          ratio="16/9"
          filters={filters}
          videoMode={videoMode}
          video={settings.video}
        />
      </div>
      <div className = {styles.selection}>
        <div className={`${styles.filterBox} ${videoMode===0 ? styles.selected : styles.not_selected}`}>Original</div>
        <div className={`${styles.filterBox} ${videoMode===1 ? styles.selected : styles.not_selected}`}>Black&White</div>
        <div className={`${styles.filterBox} ${videoMode===2 ? styles.selected : styles.not_selected}`}>Vintage</div>
        <div className={`${styles.filterBox} ${videoMode===3 ? styles.selected : styles.not_selected}`}>Vintage2</div>
      </div>
      <div className={styles.timer}>{formattedTime}</div>
    </div>
  );
}

export default A3CameraSettingScreen;
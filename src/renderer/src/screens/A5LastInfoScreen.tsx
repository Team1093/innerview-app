'use client'
import styles from '../styles/A5LastInfoScreen.module.css'
import {Settings} from '../service/settings/interface'
import underdog_ending from '../assets/videos/ending_guide.mp4'
import seongsu_ending from '../assets/videos/seongsu_video.mp4'

interface A5LastInfoScreenProps {
  nextScreen: (screenNumber: number) => void
  settings: Settings
}

const A5LastInfoScreen: React.FC<A5LastInfoScreenProps> = ({ nextScreen, settings }) => {
  const { location } = settings
  const videoSrc = location === 'innerview' ? underdog_ending : seongsu_ending;
  return (
    <div className={styles.bg}>
      <video autoPlay className={styles.video} onEnded={() => nextScreen(6)}>
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}

export default A5LastInfoScreen;
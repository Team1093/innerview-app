'use client'
import styles from '../styles/A3CameraSettingScreen.module.css'
import useTimer from '../lib/useTimer'

interface A3CameraSettingScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A3CameraSettingScreen: React.FC<A3CameraSettingScreenProps> = ({ nextScreen }) => {

  const { formattedTime } = useTimer(true, 60, () => nextScreen(4))

  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <h1>Camera Setting Screen</h1>
      <button onClick={() => nextScreen(4)}>Next</button>
      <div className={styles.timer}>{formattedTime}</div>
    </div>
  );
}

export default A3CameraSettingScreen;
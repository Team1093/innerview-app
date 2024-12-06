'use client'
import styles from '../styles/A3CameraSettingScreen.module.css'

interface A3CameraSettingScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A3CameraSettingScreen: React.FC<A3CameraSettingScreenProps> = ({ nextScreen }) => {
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <button onClick={() => nextScreen(1)}>Next</button>
    </div>
  );
}

export default A3CameraSettingScreen;
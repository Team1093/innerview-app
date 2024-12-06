'use client'
import styles from '../styles/A4RecordingScreen.module.css'


interface A4RecordingScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A4RecordingScreen: React.FC<A4RecordingScreenProps> = ({ nextScreen }) => {
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <button onClick={() => nextScreen(1)}>Next Screen</button>
    </div>
  );
}

export default A4RecordingScreen;
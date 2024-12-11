'use client'
import styles from '../styles/A6EndingScreen.module.css'
import useTimer from '../lib/useTimer'

interface A6EndingScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A6EndingScreen: React.FC<A6EndingScreenProps> = ({ nextScreen }) => {
  const { formattedTime } = useTimer(true, 60, () => nextScreen(1))
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <h1>Ending Screen</h1>
      <button onClick={() => nextScreen(1)}>Next Screen</button>
      <div className={styles.timer}>{formattedTime}</div>
    </div>
  );
}

export default A6EndingScreen;
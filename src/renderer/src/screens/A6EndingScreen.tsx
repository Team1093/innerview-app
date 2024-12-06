'use client'
import styles from '../styles/A6EndingScreen.module.css'

interface A6EndingScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A6EndingScreen: React.FC<A6EndingScreenProps> = ({ nextScreen }) => {
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <button onClick={() => nextScreen(2)}>Next Screen</button>
    </div>
  );
}

export default A6EndingScreen;
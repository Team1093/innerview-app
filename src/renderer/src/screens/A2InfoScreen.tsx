'use client'
import styles from '../styles/A2InfoScreen.module.css'


interface A2InfoScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A2InfoScreen: React.FC<A2InfoScreenProps> = ({ nextScreen }) => {
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <button onClick={() => nextScreen(1)}>Next</button>
    </div>
  );
}

export default A2InfoScreen;
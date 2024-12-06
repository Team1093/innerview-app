'use client'
import styles from '../styles/A5LastInfoScreen.module.css'


interface A5LastInfoScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A5LastInfoScreen: React.FC<A5LastInfoScreenProps> = ({ nextScreen }) => {
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <button onClick={() => nextScreen(6)}>Next</button>
    </div>
  );
}

export default A5LastInfoScreen;
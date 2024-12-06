'use client'
import styles from '../styles/A0ManagementScreen.module.css'

interface A0ManagementScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A0ManagementScreen: React.FC<A0ManagementScreenProps> = ({ nextScreen }) => {
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <button onClick={() => nextScreen(1)}>Next</button>
    </div>
  );
}

export default A0ManagementScreen;


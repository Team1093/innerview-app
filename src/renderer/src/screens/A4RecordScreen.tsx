'use client'
import styles from '../styles/A4RecordScreen.module.css'


interface A4RecordScreenProps {
  nextScreen: (screenNumber: number) => void
}

const A4RecordScreen: React.FC<A4RecordScreenProps> = ({ nextScreen }) => {
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <h1>Record Screen</h1>
      <button onClick={() => nextScreen(5)}>Next Screen</button>
    </div>
  );
}

export default A4RecordScreen;
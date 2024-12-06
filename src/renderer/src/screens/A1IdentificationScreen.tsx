'use client'
import styles from '../styles/A1IdentificationScreen.module.css'


interface A1IdentificationScreenProps {
    nextScreen: (screenNumber: number) => void
  }
  
  const A1IdentificationScreen: React.FC<A1IdentificationScreenProps> = ({ nextScreen }) => {
    return (
      <div className={styles.bg}>
        {/* Add your component JSX here */}
        <button onClick={() => nextScreen(1)}>Next</button>
      </div>
    );
  }

  export default A1IdentificationScreen;
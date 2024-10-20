import styles from '../styles/LangSelectScreen.module.css'
import {
  KEYS_SCREEN_BACK,
  KEYS_SCREEN_CONFIRM,
  KEYS_SCREEN_NEXT,
  quotes
} from '../assets/constants'
import { useEffect, useState } from 'react'
import DeviceSelectModal from '../components/DeviceSelectModal';

interface LangSelectScreenProps {
  lang: 'ko' | 'en'
  peopleMode: number
  setLang: (lang: 'ko' | 'en') => void
  setPeopleMode: (peopleMode: number) => void
  close: () => void
}

const LangSelectScreen: React.FC<LangSelectScreenProps> = ({
  lang,
  peopleMode,
  setLang,
  setPeopleMode,
  close
}) => {
  const [currentRow, setCurrentRow] = useState<number>(0)
  const [currentColumn, setCurrentColumn] = useState<number>(0)

  // DeviceSelectModal
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(false);
  const openDeviceModal = () => setIsDeviceModalOpen(true);
  const closeDeviceModal = () => setIsDeviceModalOpen(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // press back or next to change column, confirm to change row
      // press confirm in the last row to close the modal
      if (KEYS_SCREEN_BACK.includes(e.key)) {
        setCurrentColumn((prev) => (prev === 0 ? 1 : 0))
      }
      if (KEYS_SCREEN_NEXT.includes(e.key)) {
        setCurrentColumn((prev) => (prev === 0 ? 1 : 0))
      }
      if (KEYS_SCREEN_CONFIRM.includes(e.key)) {
        if (currentRow === 0) {
          setLang(currentColumn === 0 ? 'ko' : 'en')
        }
        if (currentRow === 1) {
          setPeopleMode(currentColumn + 1)
        }
        if (currentRow === 2) {
          close()
        }
        setCurrentRow((prev) => (prev === 2 ? 0 : prev + 1))
        setCurrentColumn(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentRow, currentColumn]) //useEffect ends here

  return (
    <div className={styles.main}>
      <div className={styles.section}>
        <h3>{quotes[0][lang]}</h3>
        <button
          className={`
            ${currentRow === 0 && currentColumn === 0 ? styles.hovered : ''}
            ${lang === 'ko' ? styles.selected : ''}
            `}
          tabIndex={-1}
        >
          한국어
        </button>
        <button
          className={`${currentRow === 0 && currentColumn === 1 ? styles.hovered : ''}
              ${lang === 'en' ? styles.selected : ''}`}
              tabIndex={-1}
        >
          English
        </button>
      </div>
      <div className={styles.section}>
        <h3>{quotes[1][lang]}</h3>
        <button
          className={`
            ${peopleMode === 1 ? styles.selected : ''}
            ${currentRow === 1 && currentColumn === 0 ? styles.hovered : ''}
            `}
          tabIndex={-1}
        >
          {quotes[2][lang]}
        </button>
        <button
          className={`
            ${peopleMode === 2 ? styles.selected : ''}
            ${currentRow === 1 && currentColumn === 1 ? styles.hovered : ''}
            `}
            tabIndex={-1}
        >
          {quotes[3][lang]}
        </button>
      </div>
      <div className={styles.section}>
        <button className={currentRow === 2 ? styles.hovered : ''} tabIndex={-1}>
          {quotes[4][lang]}</button>
      </div>
        
      <button id={styles.deviceBtn} onClick={openDeviceModal} tabIndex={-1}>
        {quotes[15][lang]}
      </button>

      {isDeviceModalOpen && <DeviceSelectModal onClose={closeDeviceModal} />}
        

    </div>
  )
}

export default LangSelectScreen

import React, { useEffect, useState } from 'react'
import styles from '../styles/FinalScreen.module.css'
import { VideoData } from '../service/file/interface'


interface FinalScreenProps {
  qrcodeLink: string
  fileName: string
  videoFile: File | null
  videoMetadata: VideoData | null
}

const FinalScreen: React.FC<FinalScreenProps> = ({ qrcodeLink }) => {
  const [date, setDate] = useState<string>('')
  const [key, setKey] = useState<boolean>(true)

  useEffect(() => {
    const today = new Date().toLocaleDateString()
    setDate(today)
    window.addEventListener('keydown', (event) => {
      setKey(!key)
      if (event.key === 'Tab') {
        window.location.reload()
      }
    });

    return () => {
      window.removeEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        window.location.reload()
      }
      });
    };
  }, [key])

  return (
    <>
    <div className={styles.screen}>
      <div className={styles.section}>
        <h4>
          2024 Recap
        </h4>
      </div>
      <div className={styles.section}>
      <div className={styles.qrcodeBox} >
        {qrcodeLink !== '' ? (
          <img src={qrcodeLink} alt="qrcode" className={styles.qrcode} width={'30vw'} height={'30vw'} />
        ) : (
          <div className={styles.QR} />
        )}
        </div>
        <p>{date}</p>
      </div>
      <div className={styles.section}>
        <p>Edited by <b>INNERVIEW</b></p>
      </div>
      
    </div>
  </>   
  )
}

export default FinalScreen

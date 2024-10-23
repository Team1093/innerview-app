import React, { useEffect, useState } from 'react'
import styles from '../styles/FinalScreen.module.css'
import noiseBg from '..//assets/images/noiseBg.svg'
import doorIcon from '..//assets/images/door.svg'
import { quotes } from '..//assets/constants'
import { VideoData } from '../service/file/interface'

interface FinalScreenProps {
  lang: 'ko' | 'en'
  qrcodeLink: string
  fileName: string
  videoFile: File | null
  videoMetadata: VideoData | null
}

const FinalScreen: React.FC<FinalScreenProps> = ({ lang, qrcodeLink }) => {
  const [date, setDate] = useState<string>('')

  useEffect(() => {
    const today = new Date().toLocaleDateString()
    setDate(today)
  }, [])

  return (
    <>
      <img className={styles.bg} src={noiseBg} alt="noise" />
      <div
        className={styles.door}
        onClick={() => {
          window.location.reload()
        }}
      >
        <img src={doorIcon} alt="door" width={100} height={160} />
      </div>
      <div className={styles.screen}>
        <div className={styles.section}>
          <h4>
            {quotes[9][lang]}
            <br />
            {quotes[10][lang]}
          </h4>
          {qrcodeLink !== '' ? (
            <img src={qrcodeLink} alt="qrcode" className={styles.qrcode} width={'449vw'} height={'449vw'} />
          ) : (
            <div className={styles.qrcodeBox} />
          )}
        </div>
        <div className={styles.section}>
          <div className={styles.text}>
            <p>{date}</p>
            <p>
              {quotes[11][lang]}
              <span>INNERVIEW</span>
            </p>
            <p>{quotes[12][lang]}</p>
            <br />
            <p>{quotes[13][lang]}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default FinalScreen

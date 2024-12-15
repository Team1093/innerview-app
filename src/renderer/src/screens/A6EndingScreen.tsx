'use client'
import styles from '../styles/A6EndingScreen.module.css'
import useTimer from '../lib/useTimer'
import { Topic } from '../service/topic/interface'
import { Settings } from '../service/settings/interface'

interface A6EndingScreenProps {
  nextScreen: (screenNumber: number) => void
  qrcodeLink: string
  topic: Topic
  settings: Settings
}

const A6EndingScreen: React.FC<A6EndingScreenProps> = ({ 
  nextScreen,
  qrcodeLink,
  topic,
  settings
}) => {
  const { formattedTime } = useTimer(true, 60, () => nextScreen(1))
  const date = `${new Date().getFullYear()}- ${new Date().getMonth() + 1}- ${new Date().getDate()}`
  return (
    <>
    <div className={styles.screen}>
    <div className={styles.timer}>{formattedTime}</div>
      <div className={styles.section}>
        <h4>
          {topic.topic[settings.lang]}
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

export default A6EndingScreen;
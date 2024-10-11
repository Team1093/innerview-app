import { KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT } from '../assets/constants'
import NextIcon from '../assets/icons/NextIcon'
import styles from '../styles/components/LastInfoModal.module.css'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

interface LastInfoModalProps {
  lang: 'ko' | 'en'
  closeModal: () => void
}

const LastInfoModal: React.FC<LastInfoModalProps> = ({ lang, closeModal }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0)

  const InfoMessages = useMemo(
    () => ({
      ko: [
        <motion.div
          key="msg"
          className={styles.msg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p>이번 INNERVIEW는 여기까지였습니다.</p>,
          <p>짧다면 짧고 길다면 긴 10분에서 15분의 시간이</p>
          <p>나 혹은 우리를 되돌아보는 소중한 시간이 되셨길 바랍니다.</p>
        </motion.div>,
        <motion.div
          key="msg"
          className={styles.msg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p>저희 INNERVIEW에 찾아와 주셔서 진심으로 감사드립니다.</p>
          <p>영상은 다음 페이지에 나오는 QR코드를 통해 받아보실 수 있습니다.</p>
        </motion.div>
      ],
      en: [
        <motion.div
          key="msg"
          className={styles.msg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p>This concludes your INNERVIEW.</p>,
          <p>
            We hope that this 10 to 15 minutes has been a meaningful time for you to reflect on
            yourself.
          </p>
        </motion.div>,
        <motion.div
          key="msg"
          className={styles.msg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p>Thank you sincerely for visiting INNERVIEW..</p>,
          <p>You can download your video using the QR code that will appear on the next page.</p>
        </motion.div>
      ]
    }),
    []
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_NEXT.includes(e.key) || KEYS_SCREEN_CONFIRM.includes(e.key)) {
        if (currentMessageIndex < InfoMessages[lang].length - 1) {
          setCurrentMessageIndex((prev) => prev + 1)
        } else {
          closeModal()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentMessageIndex, InfoMessages, lang, closeModal])

  // change to next message every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentMessageIndex < InfoMessages[lang].length - 1) {
        setCurrentMessageIndex((prev) => prev + 1)
      } else {
        clearInterval(interval)
        closeModal()
      }
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [currentMessageIndex, InfoMessages, lang, closeModal])

  return (
    <div className={styles.main}>
      {InfoMessages[lang][currentMessageIndex]}
      <NextIcon size={50} />
    </div>
  )
}

export default LastInfoModal

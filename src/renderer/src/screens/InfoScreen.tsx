'use client'

import React, { useEffect, useState } from 'react'
import styles from '../styles/InfoScreen.module.css'
import bgImage2 from '../assets/images/InfoScreenBG.svg'
import { KEYS_SCREEN_BACK, KEYS_SCREEN_NEXT } from '../assets/constants'
import { motion } from 'framer-motion'
import NextIcon from '../assets/icons/NextIcon'

interface InfoScreenProps {
  lang: 'ko' | 'en'
  peopleMode: number
  nextScreen: (screenNumber: number) => void
  time_limit_seconds: number
}

const MotionP: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className={styles.motionP}>
    {children}
  </motion.p>
)

const InfoScreen: React.FC<InfoScreenProps> = ({ lang, nextScreen, time_limit_seconds }) => {
  const InfoMessages1: { ko: React.ReactNode[]; en: React.ReactNode[] } = {
    ko: [
      <MotionP key="msg">INNERVIEW에 오신 것을 환영합니다.</MotionP>,
      <MotionP key="msg">
        인터뷰는 주제 선택 후부터
        <br/>
        {(time_limit_seconds/60)}분 간 진행됩니다.
      </MotionP>,
      <MotionP key="msg">
        선택하시는 주제 별로 질문 수가 다르니
        <br />이 점 유의해서 시간을 배분하시길 바랍니다.
      </MotionP>,
      <MotionP key="msg">
        <span className={styles.span}>◉</span> 은 선택 버튼이고
        <br />
        <span className={styles.span}>▲</span> 은 이전 화면/질문으로 돌아가는 버튼이며
        <br />
        <span className={styles.span}>▼</span> 은 다음 화면/질문으로 넘어가는 버튼입니다.
      </MotionP>
    ],
    en: [
      <MotionP key="msg">Welcome to INNERVIEW.</MotionP>,
      <MotionP key="msg">
        The interview will begin after you choose a topic <br />
        and will last for {time_limit_seconds/60} minutes.
      </MotionP>,
      <MotionP key="msg">
        Please note that the number of questions varies 
        <br />
        depending on the topic you select,
        <br />
        so manage your time accordingly.
      </MotionP>,
      <MotionP key="msg">
        To select/confirm, press the <span className={styles.span}>◉.</span>
        <br />
        To go back to the previous screen/question, press the <span className={styles.span}> ▲.</span>
        <br />
        To move to the next screen/question, press the <span className={styles.span}> ▼.</span>
      </MotionP>
    ]
  }

  const InfoMessages2: { ko: React.ReactNode[]; en: React.ReactNode[] } = {
    ko: [
      <MotionP key="msg1">
        인터뷰는 주제 선택 후부터 <br />
        {time_limit_seconds/60}분간 진행됩니다.
      </MotionP>,
      <MotionP key="msg2">
        질문에 답변을 모두 마치신 뒤<br />
        <span>▼ 버튼</span>를 눌러주시면
        <br />다음 질문으로 넘어갑니다.
      </MotionP>,
      <MotionP key="msg3">
        {time_limit_seconds/60}분이 지나면 곧바로 종료되니
        <br />
        시간을 확인하며 답변해주세요.
      </MotionP>
    ],
    en: [
      <MotionP key="msg1">
        The interview will last for <br />
        {time_limit_seconds/60} minutes after selecting the topic.
      </MotionP>,
      <MotionP key="msg2">
        After answering all the questions, <br />
        press ▼ button to proceed.
      </MotionP>,
      <MotionP key="msg3">
        The interview will end <br />
        immediately after {time_limit_seconds/60} minutes,
        <br />
        so please answer carefully.
      </MotionP>
    ]
  }

  const [messageIndex, setMessageIndex] = useState<number>(0)
  const [infoMessages, setInfoMessages] = useState<React.ReactNode[]>([])

  const playType = '1'

  useEffect(() => {
    if (playType === '1' || playType === null) {
      setInfoMessages(InfoMessages1[lang])
    } else {
      setInfoMessages(InfoMessages2[lang])
    }
  }, [playType])

  useEffect(() => {
    // const interval = setInterval(() => {
    //   if (messageIndex === InfoMessages.length - 1) {
    //     return;
    //   }
    //   setMessageIndex((prev) => (prev + 1) % InfoMessages.length);
    // }, 5000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_NEXT.includes(e.key)) {
        if (messageIndex === infoMessages.length - 1) {
          nextScreen(3)
        }
        setMessageIndex((prev) => (prev + 1) % infoMessages.length)
      }
      if (KEYS_SCREEN_BACK.includes(e.key)) {
        if (messageIndex === 0) {
          return
        }
        setMessageIndex((prev) => (prev - 1) % infoMessages.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      // clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [messageIndex, setMessageIndex, infoMessages.length])

  return (
    <>
      <img className={styles.bg} src={bgImage2} alt="background" />
      <div className={styles.screen}>
        {infoMessages[messageIndex]}
        {messageIndex === infoMessages.length - 1 && <NextIcon size={50} />}
      </div>
    </>
  )
}

export default InfoScreen
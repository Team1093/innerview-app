'use client'
import styles from '../styles/A2InfoScreen.module.css'

import { Settings } from '../service/settings/interface'
import { DBUserData, DBReservation } from '../service/user/interface'
import { Question } from '../service/topic/interface'

import ko_single from '../assets/videos/ko_single.mp4'
import ko_couple from '../assets/videos/ko_couple.mp4'
import en_single from '../assets/videos/en_single.mp4'
import en_couple from '../assets/videos/en_couple.mp4'
import bgImg from '../assets/images/gridBgWithRemoteController.jpg'
import gridBg from '../assets/images/gridBg.jpg'

import { useEffect, useState } from 'react'
import { useService } from '../service/useService'
import { Topic } from '../service/topic/interface'

import { KEYS_SCREEN_BACK, KEYS_SCREEN_NEXT, KEYS_SCREEN_CONFIRM, langText } from '../assets/constants'

// 플로우 : 언어 선택 -> 안내 문구 : 헤드셋 쓰라는 문구 (클릭) -> 안내 영상 : 영상 끝나면 바로 카메라 세팅 페이지지

interface A2InfoScreenProps {
  nextScreen: (screenNumber: number) => void
  settings: Settings
  setSettings : (settings: Settings) => void
  innerviewUser: DBUserData
  reservationInfo: DBReservation
  forceQuit: boolean;
  setQuestions: (questions: Question[]) => void
  topic: Topic;
  setTopic: (topic: Topic) => void
}

const A2InfoScreen: React.FC<A2InfoScreenProps> = ({ nextScreen, settings, setSettings, innerviewUser, reservationInfo, forceQuit, setQuestions, setTopic, topic }) => {

  const [ wannaQuit, setWannaQuit ] = useState(false);
  const [ isQNTloaded, setIsQNTloaded ] = useState(false);
  const { topicService } = useService();
  const setQuestionsAndTopicData = async () => {
    const questions = await topicService.getQuestions(settings.location, reservationInfo.selected_topic_id);
    setQuestions(questions)
    const topicData = await topicService.getTopic(settings.location, reservationInfo.selected_topic_id)
    setTopic(topicData);
    setIsQNTloaded(true);
  }

  useEffect(() => {
    try { 
      setQuestionsAndTopicData();
    } catch (error) {
      console.log('Error while fetching questions and topic data', error);
      throw error;
    } finally {
      setIsQNTloaded(true);
    }
  }, []);

  useEffect(() => {
    if (wannaQuit && isQNTloaded) nextScreen(3);
  }, [wannaQuit, isQNTloaded, nextScreen]);

  const [lang, setLang] = useState('ko');
  const [messageIndex, setMessageIndex] = useState<number>(0)
  const [videoIndex, setVideoIndex] = useState<boolean>(false)
  const nextPageInfo : langText[] = [
    {
      ko: '아무 버튼을 누르면 다음 화면으로 넘어갑니다.',
      en: 'Press any key to go to the next page!',
    },
    {
      ko: '착용하신 후에 버튼을 눌러주세요.',
      en: 'Press any key after wearing the headset.',
    },
    {
      ko: '버튼을 누르시면 안내 영상이 시작됩니다.',
      en: 'Press any key to start the guide video!',
    },
];
  const messages:langText[] = [
    {
      ko: 'INNERVIEW에 오신 것을 환영합니다!',
      en: 'Welcome to INNERVIEW!'
    },
    {
      ko: '우선 헤드셋을 착용해주세요.',
      en: 'Please wear your headset!'
    },
    {
      ko: '이제 안내 영상이 시작됩니다!',
      en: 'Starting the guide video!'
    }
  ]
  

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_NEXT.includes(e.key) || KEYS_SCREEN_BACK.includes(e.key)) {
        if(lang === 'ko') {
          setLang('en')
        } 
        else if (lang === 'en') {
          setLang('ko')
        }
      } else if(KEYS_SCREEN_CONFIRM.includes(e.key)) {
        const new_settings = {...settings, lang: lang}
        setSettings(new_settings)
        setMessageIndex(1)
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      // clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lang])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (messageIndex >= 1) {
        if(messageIndex === messages.length) {
          setVideoIndex(true);
        } 
        else if(KEYS_SCREEN_NEXT.includes(e.key) || KEYS_SCREEN_BACK.includes(e.key) || KEYS_SCREEN_CONFIRM.includes(e.key)) { 
          setMessageIndex((messageIndex + 1))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)


    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [messageIndex])


  const peopleType = topic.peopleType === 2 ? 'couple' : 'single';
  const videoSrc = (lang: string, peopleType: string) => {
    if(lang === 'ko') {
      if(peopleType === 'couple') {
        return ko_couple
      } else {
        return ko_single
      }
    } 
    else {
      if(peopleType === 'couple') {
        return en_couple
      } else {
        return en_single
      }
    }
  }
  
  const testMode = true;



  return (
    testMode ? (
    <div className={styles.frame}>
    <img src={gridBg} className={styles.bgImg}/>
      {/* 언어 선택 */}
      {messageIndex === 0 && 
      <div className={styles.frame}>
        <img src={bgImg} className={styles.bgImg}/>
        <div className={styles.langContainer}>
          <h1>리모콘의 [이전/다음 버튼]으로 사용하실 언어를 고르고 </h1>
          <h2>Press [Go Back/Next button] on the remote controller to change your language.</h2>
          <h1>[확인 버튼]을 눌러 선택해주세요!</h1>
          <h2>And press [Confirm button] to confirm your language.</h2>
          <div className={styles.langBoxContainer}>
            <div className={`${styles.langBox} ${lang === 'ko' ? styles.selected : styles.unSelected}`}>한국어</div>
            <div className={`${styles.langBox} ${lang === 'en' ? styles.selected : styles.unSelected}`}>English</div>
          </div>
        </div>
      </div>
      }
      {/* 환영 인사 및 안내 문구 : 헤드셋 써주세요요 */}
      {(messageIndex >= 1 && !videoIndex) &&
        <div className={styles.messageContainer}>
          <h1>{messages[messageIndex-1][settings.lang]}</h1>
          <p>{nextPageInfo[messageIndex-1][settings.lang]}</p>
        </div>}
      {/* 안내 영상 */}
      {videoIndex && 
        <video autoPlay preload="auto" className={styles.video} onEnded={() => setWannaQuit(true)}>
          <source src={videoSrc(lang, peopleType)} type="video/mp4"/>
        </video>
      }


    </div>)
    :
    (<div className={styles.userInfoBg}>
          {/* Add your component JSX here */}
          <h1>Info Screen</h1>
          <h2>예약자 정보</h2>
          <p>예약자 이름: {innerviewUser.name}</p>
          <p>예약자 전화번호: {innerviewUser.phone_number}</p>
          <p>예약자 위치 : {settings.location}</p>
          <h2>예약 정보</h2>
          
          <p>예약 날짜: {reservationInfo.date}</p>
          <p>예약 시간: {reservationInfo.time_range}</p>
          <p>선택한 주제: {reservationInfo.selected_topic_id} {topic ? topic.topic['ko'] : '주제 정보 불러오는 중' }</p>
          <h2>강제 종료 여부</h2>
          <p>{forceQuit ? "강제 종료" : "정상 종료"}</p>
          <button onClick={() => setWannaQuit(true)}>Next</button>
    </div>)
  );
}

export default A2InfoScreen;
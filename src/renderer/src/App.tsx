import { useEffect, useState } from 'react'
import styles from './page.module.css'
import A0ManagementScreen from './screens/A0ManagementScreen'
import A1IdentificationScreen from './screens/A1IdentificationScreen'
import A2InfoScreen from './screens/A2InfoScreen'
import A3CameraSettingScreen from './screens/A3CameraSettingScreen'
import A4RecordScreen from './screens/A4RecordScreen'
import A5LastInfoScreen from './screens/A5LastInfoScreen'
import A6EndingScreen from './screens/A6EndingScreen'

import useModal from './lib/useModal'

// import useModal from './lib/useModal'

// import LangSelectScreen from './screens/LangSelectScreen'
// import { Question, Topic } from './service/topic/interface'
// import { useService } from './service/useService'


// A0에 필요한 변수들
import { Settings } from './service/settings/interface'
import { DBUserData, DBReservation } from './service/user/interface'
import { Question, Topic } from './service/topic/interface'

export default function App() {
  // 화면 전환 변수 세팅
  const { openModal: openOverlayModal, closeModal: closeOverlayModal, renderModal: renderOverlayModal } = useModal()
  const [currentScreen, setCurrentScreen] = useState<number>(0)
  const nextScreen = (screenNumber: number) => {
    closeOverlayModal()
    setCurrentScreen(screenNumber)
  }

  // 전역 변수 세팅
  const [ settings, setSettings ] = useState<Settings>({audio: '', video: '', location: '', lang : ''})

  // 예약자 정보
  const [reservationInfo, setReservationInfo] = useState<DBReservation>({
    id: 0,
    userId: 0,
    date: new Date().toISOString().slice(0, 10),
    time_range: '',
    start_time: '',
    end_time: '',
    selected_topic_id: 0
  });
  const [innerviewUser, setInnerviewUser] = useState<DBUserData>({
    id: 0,
    name: '',
    phone_number: ''
  });
  const [forceQuit, setForceQuit] = useState<boolean>(false)

  // 질문 정보
  const [topic, setTopic] = useState<Topic>({
      topicId: 0,
      topic: {'ko': 'topic', 'en': 'topic'},
      description: {'ko': '', 'en': ''},
      peopleType: 0,
      questionType: 'for me',
  })
  const [questions, setQuestions] = useState<Question[]>([])

  // 촬영 관련
    // 이 필터를 수정할 때는 uitls.ts의 processVideoFile 함수에 있는 complexFilter도 수정해야 함
  const filters = [
    'none',
    'grayscale(100%)',
    // 'sepia(40%) contrast(0.8) brightness(1.2) saturate(2)',
    // 'sepia(60%) contrast(1.0) brightness(1.1) saturate(0.9) hue-rotate(-10deg)'
  ];

  const [videoMode, setVideoMode] = useState<number>(0)
  
  // 영상 처리 관련
  const [qrcodeLink, setQrcodeLink] = useState<string>('')
  // const [fileName, setFileName] = useState<string>('')
  // const [videoFile, setVideoFile] = useState<File | null>(null)
  // const [videoMetadata, setVideoMetadata] = useState<VideoData | null>(null)

  useEffect(() => {
    openOverlayModal()
  }, [])

  useEffect(() => {
    const handleF5 = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault()
        window.location.reload()
      }
    }
    window.addEventListener('keydown', handleF5)
    return () => {
      window.removeEventListener('keydown', handleF5)
    }
  }, []);

  return (
    <div className={styles.app}>

      {currentScreen === 1 && (
        <A1IdentificationScreen 
        nextScreen={nextScreen} 
        settings={settings} 
        setInnerviewUser={setInnerviewUser} 
        setReservationInfo={setReservationInfo} 
        setForceQuit={setForceQuit}/>
        )}
      {currentScreen === 2 && (
        <A2InfoScreen 
        nextScreen={nextScreen} 
        settings={settings} 
        setSettings={setSettings} 
        innerviewUser={innerviewUser} 
        reservationInfo={reservationInfo} 
        forceQuit={forceQuit} 
        topic={topic}
        setTopic={setTopic}
        setQuestions={setQuestions}
        />
        )}
      {currentScreen === 3 && (
        <A3CameraSettingScreen 
        nextScreen={nextScreen}
        setVideoMode={setVideoMode}
        videoMode={videoMode}
        filters={filters}
        settings={settings}/>
        )}
      {currentScreen === 4 && (
        <A4RecordScreen 
        nextScreen={nextScreen}
        questions={questions}
        settings={settings}
        topic={topic}
        videoMode={videoMode}
        setQRCodeLink={setQrcodeLink}
        // setFileName={setFileName}
        // setVideoFile={setVideoFile}
        // setVideoMetadata={setVideoMetadata}
        filters={filters}
        reservationInfo={reservationInfo}
        forceQuit={forceQuit}
        />
        )}
      {currentScreen === 5 && (
        <A5LastInfoScreen nextScreen={nextScreen}
        settings={settings}
        />
        )}
      {currentScreen === 6 && (
        <A6EndingScreen 
        nextScreen={nextScreen}
        qrcodeLink={qrcodeLink}
        topic={topic}
        settings={settings}/>
        )}
      {renderOverlayModal(<A0ManagementScreen nextScreen={nextScreen} settings={settings} setSettings={setSettings}/>)}
    </div>
  )
}

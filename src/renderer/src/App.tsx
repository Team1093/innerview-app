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
// import { InterviewCreateDto } from './service/interview/interface'
// import LangSelectScreen from './screens/LangSelectScreen'
// import { Question, Topic } from './service/topic/interface'
// import { useService } from './service/useService'
// import { VideoData } from './service/file/interface'


// A0에 필요한 변수들
import { Settings } from './service/settings/interface'
import { DBUserData, DBReservation } from './service/user/interface'

export default function App() {
  // 화면 전환 변수 세팅
  const { openModal: openOverlayModal, closeModal: closeOverlayModal, renderModal: renderOverlayModal } = useModal()
  const [currentScreen, setCurrentScreen] = useState<number>(0)
  const nextScreen = (screenNumber: number) => {
    closeOverlayModal()
    setCurrentScreen(screenNumber)
  }

  // 전역 변수 세팅
  const [ settings, setSettings ] = useState<Settings>({audio: '', video: '', location: ''})


  // 예약자 정보
  const [reservationInfo, setReservationInfo] = useState<DBReservation>({
    id: 0,
    userId: 0,
    date: new Date(),
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


  useEffect(() => {
    openOverlayModal()
  }, [])

  return (
    <div className={styles.app}>

      {currentScreen === 1 && (
        <A1IdentificationScreen nextScreen={nextScreen} settings={settings} setInnerviewUser={setInnerviewUser} setReservationInfo={setReservationInfo} setForceQuit={setForceQuit}/>
        )}
      {currentScreen === 2 && (
        <A2InfoScreen nextScreen={nextScreen} settings={settings} innerviewUser={innerviewUser} reservationInfo={reservationInfo} forceQuit={forceQuit}/>
        )}
      {currentScreen === 3 && (
        <A3CameraSettingScreen nextScreen={nextScreen}/>
        )}
      {currentScreen === 4 && (
        <A4RecordScreen nextScreen={nextScreen}/>
        )}
      {currentScreen === 5 && (
        <A5LastInfoScreen nextScreen={nextScreen}/>
        )}
      {currentScreen === 6 && (
        <A6EndingScreen nextScreen={nextScreen}/>
        )}
      {renderOverlayModal(<A0ManagementScreen nextScreen={nextScreen} settings={settings} setSettings={setSettings}/>)}
    </div>
  )
}

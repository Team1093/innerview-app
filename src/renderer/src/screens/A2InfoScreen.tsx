'use client'
import styles from '../styles/A2InfoScreen.module.css'
import { Settings } from '../service/settings/interface'
import { DBUserData, DBReservation } from '../service/user/interface'

interface A2InfoScreenProps {
  nextScreen: (screenNumber: number) => void
  settings: Settings
  innerviewUser: DBUserData
  reservationInfo: DBReservation
  forceQuit: boolean;
}

const A2InfoScreen: React.FC<A2InfoScreenProps> = ({ nextScreen, settings, innerviewUser, reservationInfo, forceQuit }) => {
  return (
    <div className={styles.bg}>
      {/* Add your component JSX here */}
      <h1>Info Screen</h1>
      <h2>예약자 정보</h2>
      <p>예약자 이름: {innerviewUser.name}</p>
      <p>예약자 전화번호: {innerviewUser.phone_number}</p>
      <p>예약자 위치 : {settings.location}</p>
      <h2>예약 정보</h2>
      <p>예약 시간: {reservationInfo.time_range}</p>
      <p>선택한 주제: {reservationInfo.selected_topic_id}</p>
      <h2>강제 종료 여부</h2>
      <p>{forceQuit ? "강제 종료" : "정상 종료"}</p>
      <button onClick={() => nextScreen(3)}>Next</button>
    </div>
  );
}

export default A2InfoScreen;
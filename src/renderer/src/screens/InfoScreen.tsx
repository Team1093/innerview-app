'use client'

import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/InfoScreen.module.css';
import videoSrc1 from '../assets/videos/ko_single.mp4';
import videoSrc2 from '../assets/videos/ko_couple.mp4';
import videoSrc3 from '../assets/videos/en_single.mp4';
import videoSrc4 from '../assets/videos/en_couple.mp4';
import bgImg from '../assets/images/InfoScreenBG.svg';
import TextKR from '../assets/images/InfoScreenTextImgKR.svg';
import TextEN from '../assets/images/InfoScreenTextImgENG.svg';
import { KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT } from '../assets/constants';
import StartScreenBg from '../assets/images/StartScreenImg.svg';

interface InfoScreenProps {
  lang: string;
  peopleMode: number;
  nextScreen: (screenNumber: number) => void;
}

const InfoScreen: React.FC<InfoScreenProps> = ({ nextScreen, lang, peopleMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnded, setVideoEnded] = useState(false); // 영상 종료 여부 상태

  let videoSrc = '';
  if (lang === 'ko') {
    videoSrc = peopleMode === 1 ? videoSrc1 : videoSrc2;
  } else {
    videoSrc = peopleMode === 1 ? videoSrc3 : videoSrc4;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (        KEYS_SCREEN_CONFIRM.includes(e.key) || 
        KEYS_SCREEN_NEXT.includes(e.key)){
        // Enter 키로 다음 화면으로 이동
        setVideoEnded(true);
        nextScreen(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextScreen]);

  useEffect(() => {
    const videoElement = videoRef.current;

    const handleVideoEnd = () => {
      setVideoEnded(true); // 영상 종료 시 상태 업데이트
    };

    videoElement?.addEventListener('ended', handleVideoEnd);

    return () => {
      videoElement?.removeEventListener('ended', handleVideoEnd);
    };
  }, []);

  return (
    <div className={styles.screen}>
      <img src={bgImg} className={styles.bgImg} alt="background"/>
      {!isVideoEnded ? ( // 영상이 끝나지 않았을 때만 비디오 표시
        <video ref={videoRef} className={styles.video} autoPlay preload="auto" poster={StartScreenBg}>
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={lang === 'ko' ? TextKR : TextEN}
          className={styles.textImage}
          alt="info text"
        />
      )}
    </div>
  );
};

export default InfoScreen;

'use client'

import React, { useEffect, useRef } from 'react';
import styles from '../styles/InfoScreen.module.css';
import videoSrc1 from '../assets/videos/ko_single.mp4';
import videoSrc2 from '../assets/videos/ko_couple.mp4';
import videoSrc3 from '../assets/videos/en_single.mp4';
import videoSrc4 from '../assets/videos/en_couple.mp4';
import posterImage from '../assets/images/background1.svg'

interface InfoScreenProps {
  lang: string;
  peopleMode: number;
  nextScreen: (screenNumber: number) => void;
}

const InfoScreen: React.FC<InfoScreenProps> = ({ nextScreen, lang, peopleMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  let videoSrc = '';
  if (lang === 'ko') {
    if (peopleMode === 1) {
      videoSrc = videoSrc1;
    } else if (peopleMode === 2) {
      videoSrc = videoSrc2;
    }
  } else if (lang === 'en') {
    if (peopleMode === 1) {
      videoSrc = videoSrc3;
    } else if (peopleMode === 2) {
      videoSrc = videoSrc4;
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Enter 키로 다음 화면으로 이동
        nextScreen(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextScreen]);

  return (
    <div className={styles.screen}>
      <video ref={videoRef} className={styles.video} autoPlay preload='auto' poster={posterImage} loop>
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={styles.info}>
        <p>
          {lang === 'ko'
            ? '준비가 되면 확인 버튼을 눌러주세요.'
            : 'When you are ready, press the Confirm button.'}
        </p>
      </div>
    </div>
  );
};

export default InfoScreen;

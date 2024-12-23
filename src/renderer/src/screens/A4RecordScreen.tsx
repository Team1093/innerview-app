// A4RecordScreen.tsx
'use client'
// 플로우 : 본격적인 인터뷰 녹화에 앞서 짧은 인사나 각오 한 마디 부탁드립니다! : 영상 파일을 따로 저장 
// -> 인사를 남긴 후 본격적인 녹화 시작 : 
// -> 처음 보는 질문에서는 세부질문 표시 + 음성
// -> 질문 다 끝나면 pause 하고 정말 질문을 종료할 건지 확인
    // -> 종료하면 마지막 문구 읽기로 넘어가기
    // -> 종료하지 않으면 녹화 다시 시작
    // -> 쿠키 영상 타임은 일단 보류

import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from '../styles/A4RecordScreen.module.css'
import { motion, AnimatePresence, Variants } from "framer-motion";

const popupVariants: Variants = {
  hidden: { opacity: 0, y: 0 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 0 },
}

import {
  KEYS_SCREEN_BACK,
  KEYS_SCREEN_NEXT,
  KEYS_SCREEN_CONFIRM,
} from '../assets/constants'

import { subtitleData, VideoData } from '../service/file/interface'
import { Topic, Question } from '../service/topic/interface'
import { InterviewCreateDto } from '../service/interview/interface'
import { useService } from '../service/useService'
import { Settings } from '../service/settings/interface'
import { DBReservation } from '../service/user/interface'
import useTimer from '../lib/useTimer'

interface A4RecordScreenProps {
  settings: Settings
  nextScreen: (screenNumber: number) => void
  questions: Question[]
  topic: Topic
  filters: string[]
  videoMode: number
  setQRCodeLink: (link: string) => void
  // setVideoFile: (file: File) => void
  // setVideoMetadata: (metadata: VideoData) => void
  // setFileName: (name: string) => void
  reservationInfo: DBReservation
  forceQuit: boolean
}

const A4RecordScreen: React.FC<A4RecordScreenProps> = ({ 
  nextScreen,
  settings,
  questions,
  topic,
  filters,
  videoMode,
  setQRCodeLink,
  reservationInfo,
  forceQuit,
}) => {

  const { lang, audio, video } = settings;
  const { interviewService, userService } = useService()

  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [videoUploadState, setVideoUploadState] = useState<string>('before saving')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const [timeLimit, setTimeLimit] = useState<number | null>(null); // 초기값을 null로 설정
  const [isByebyePopup, setIsByebyePopup] = useState<boolean>(false);

  // 컴포넌트 마운트 시 타임 리밋 설정
  useEffect(() => {
    const currentTime = new Date().getTime();
    const endTime = new Date(reservationInfo.end_time).getTime();
    const time_milli_seconds = endTime - currentTime;

    console.log('setTimeLimit - currentTime:', new Date(currentTime).toISOString());
    console.log('setTimeLimit - endTime:', new Date(endTime).toISOString());
    console.log('setTimeLimit - time_milli_seconds:', time_milli_seconds);

    let calculatedTimeLimit = 30 * 60; // 기본값

    // if (forceQuit) {
      if (topic.peopleType === 2) {
        if (time_milli_seconds > (30 + 3) * 60 * 1000) { // 33분
          calculatedTimeLimit = 30 * 60;
          console.log('setTimeLimit - peopleType 2, time_milli_seconds > 33분, set to 30*60');
        } else {
          calculatedTimeLimit = Math.floor(time_milli_seconds / 1000) - 3 * 60;
          console.log('setTimeLimit - peopleType 2, time_milli_seconds <= 33분, set to', calculatedTimeLimit);
        }
      }
      else if (topic.peopleType === 1) {
        if (time_milli_seconds > (15 + 2) * 60 * 1000) { // 17분
          calculatedTimeLimit = 15 * 60;
          console.log('setTimeLimit - peopleType 1, time_milli_seconds > 17분, set to 15*60');
        } else {
          calculatedTimeLimit = Math.floor(time_milli_seconds / 1000) - 2 * 60;
          console.log('setTimeLimit - peopleType 1, time_milli_seconds <= 17분, set to', calculatedTimeLimit);
        }
      }
    // }
    // else {
    //   if (topic.peopleType === 2) {
    //     calculatedTimeLimit = 30 * 60;
    //     console.log('setTimeLimit - peopleType 2, forceQuit false, set to 30*60');
    //   } else if (topic.peopleType === 1) {
    //     calculatedTimeLimit = 15 * 60;
    //     console.log('setTimeLimit - peopleType 1, forceQuit false, set to 15*60');
    //   } else {
    //     calculatedTimeLimit = 30 * 60;
    //     console.log('setTimeLimit - unknown peopleType, set to 30*60');
    //   }
    // }

    // 최소 시간 보장 (예: 최소 1분)
    if (calculatedTimeLimit < 60) {
      calculatedTimeLimit = 60;
      console.log('setTimeLimit - calculatedTimeLimit < 60, set to 60');
    }

    setTimeLimit(calculatedTimeLimit);
    console.log('타임 리밋 작동 끝:', calculatedTimeLimit, forceQuit, topic.peopleType);
  }, [reservationInfo.end_time, forceQuit, topic.peopleType]);

  // 타이머 훅 초기화 (조건부 호출)
  const { formattedTime, seconds } = useTimer(
    isRecording, 
    timeLimit !== null ? timeLimit : 0, // timeLimit이 null이 아닐 때만 전달
    () => {
      console.log('녹화 시간 초과');
      setIsByebyePopup(true);
      setIsRecording(false);
      handleResumeRecording();
    }
  );
  const secondsRef = useRef(seconds);

  // 질문 관리하는 변수들 설정
  const [subtitlePieces, setSubtitlePieces] = useState<subtitleData[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isCQIworking, setIsCQIworking] = useState<boolean>(false)
  const [isFirst, setIsFirst] = useState<boolean[]>(Array(questions.length).fill(true));
  const [isQuestionPopup, setIsQuestionPopup] = useState<boolean>(false)

  // 추가 창 관리하는 변수들 설정
  const [isStartingPopup, setIsStartingPopup] = useState<boolean>(true)
  const [isHelloPopup, setIsHelloPopup] = useState<boolean>(false)
  const helloTime = 10;
  const { formattedTime:formattedTimeForHello, } = useTimer(
      isHelloPopup, 
      helloTime,
      () => {
        if(isCQIworking) return
        else {
          setIsHelloPopup(false);
          handlePauseRecording();
          setIsStartingPopup2(true);
          setIsCQIworking(true);
        }
      }
  );

  const totalSecondsRef = useRef(0);

  const [isStartingPopup2, setIsStartingPopup2] = useState<boolean>(false)
  const [isLogoPopup, setIsLogoPopup] = useState<boolean>(false)
  const [isEndingPopup, setIsEndingPopup] = useState<boolean>(false)
  const [endingOption, setEndingOption] = useState<number>(0)
  // const [isByebyePopup, setIsByebyePopup] = useState<boolean>(false) // 이미 선언됨
  const { formattedTime:formattedTimeForByebye, } = useTimer(
      isByebyePopup, 
      10, 
      () => {
        setIsByebyePopup(false);
        handleEndRecording();
      });

 
  // const [isCookiePopup, setIsCookiePopup] = useState<boolean>(false)

  // 키보드 이벤트 관리리
  const [isKeydownActive, setIsKeydownActive] = useState<boolean>(false)
 
  useEffect(() => {
    if(isKeydownActive) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isKeydownActive]);

  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    if(isStartingPopup) {
      const timer = setTimeout(() => {
        setIsStartingPopup(false);
        handleStartRecording();
        setIsHelloPopup(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
    else if(isStartingPopup2) {
      const timer1 = setTimeout(() => {
        setIsStartingPopup2(false);
      }, 3000);
      const timer1_1 = setTimeout(() => {
        setIsLogoPopup(true);
      }, 2000);
      return () => {clearTimeout(timer1_1); clearTimeout(timer1);}
    } else if(isLogoPopup) {
      const timer2 = setTimeout(() => {
        setIsLogoPopup(false);
        handleResumeRecording();
        setIsRecording(true);
        setCurrentQuestionIndex(0);
        setIsQuestionPopup(true);
        setIsKeydownActive(true);
        setSubtitlePieces([
          {
            startSeconds: 0,
            endSeconds: helloTime,
            text1 :`${settings.lang === 'ko' ? `가벼운 인사 한 마디 부탁드립니다!` : 'Please leave a short greeting!'}`,
            text2: '',
            isFirst: false,
          },
          {
            startSeconds: helloTime,
            endSeconds: 0,
            text1: questions[0].questions[lang],
            text2: questions[0].detailedQuestions[lang],
            isFirst: true
        }]);
        console.log('첫 질문 추가 완료: ', subtitlePieces)
        setIsFirst((prev) => {
          return prev.map((item, index) => {
            return index === 0 ? false : item
          })
        });
      }, 4000);
      return () => clearTimeout(timer2);
    } else if(isQuestionPopup){
        let questionPopupTime = 5000;
        if(questions[currentQuestionIndex].detailedQuestions[lang] != '') {
          questionPopupTime = 10000;
        }
      const isQuestionPopupTimer = setTimeout(() => {
        setIsQuestionPopup(false);
        setIsKeydownActive(true);
      }, questionPopupTime);
      return () => clearTimeout(isQuestionPopupTimer);
    } else if(videoUploadState === 'only local uploaded') {
        window.addEventListener('keydown', () => {
          setIsQuestionPopup(false);
          nextScreen(5);
        }, { once: true });
      }
    return;
  }, [isStartingPopup, isStartingPopup2, isLogoPopup, isQuestionPopup, videoUploadState]);

  const [isEndingPopupKeydownActive, setIsEndingPopupKeydownActive] = useState<boolean>(false)
  useEffect(() => {
    if(isEndingPopupKeydownActive) 
      window.addEventListener('keydown', handleKeyDownInEndingPage);
    else
      window.removeEventListener('keydown', handleKeyDownInEndingPage);
    return () => {window.removeEventListener('keydown', handleKeyDownInEndingPage);}
  }, [isEndingPopupKeydownActive, endingOption]);

  // 시작
    // useEffect 처리
  // 기존 useEffect에서 setTimeLimitFunction을 호출하고 있지만, 이미 별도의 useEffect에서 설정했으므로 제거
  // useEffect(() => {
  //   setTimeLimitFunction();
  //   return () => {
  //     setIsKeydownActive(false);
  //   }
  // }, []);

  // timeLimit이 null이 아닐 때만 타이머를 업데이트
  useEffect(() => {
    if(isRecording && timeLimit !== null) {
      secondsRef.current = seconds;
      totalSecondsRef.current = secondsRef.current + helloTime||10;
    }
  }, [seconds, isRecording, timeLimit, helloTime]);

  useEffect(() => {
    if(videoUploadState === 'uploaded') nextScreen(5);
  },[videoUploadState]);

  useEffect(() => {
    console.log('Updated subtitlePieces:', subtitlePieces);
  }, [subtitlePieces]);

  const initializeMedia = async () : Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video:  video ? {deviceId: {  exact: video }, frameRate: {ideal:60, max:60} } : true,
        audio: audio ? {deviceId: { exact: audio }, sampleRate: 44100,  } : true,
      });
      streamRef.current = stream;
      // HTML 비디오 요소에 스트림 연결
      if (videoRef.current) videoRef.current.srcObject = stream;
      // 기록용 미디어 레코더 생성
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/mp4' });

      mediaRecorderRef.current.ondataavailable = (event) => { // 녹화가 가능한 상태일 때때
        if (event.data.size > 0) { // 녹화된 데이터가 있을 때
          chunksRef.current.push(event.data) // 녹화된 데이터를 chunks 배열에 추가
        }
      }

      
      mediaRecorderRef.current.onstop = () => { // 녹화가 끝났을 때
        saveRecording()
      }

      mediaRecorderRef.current.onerror = (event) => { // 미디어 레코더 에러 발생 시
        console.error('MediaRecorder error:', event)
      }} catch (err) { console.error('Error accessing media devices:', err)}};

  const handleStartRecording = async (): Promise<void> => {
    try {
      await initializeMedia(); // 미디어 초기화
      chunksRef.current = []; // 녹화 데이터 초기화
      mediaRecorderRef.current?.start(500); // 500ms 간격으로 녹화 시작
      // setIsRecording(true);
      console.log('녹화가 시작되었습니다.');
    } catch (err) {
      console.error('녹화를 시작할 수 없습니다:', err);
    }
  };

  const handlePauseRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        await mediaRecorderRef.current.pause();
        setIsRecording(false);
        console.log('녹화가 일시정지되었습니다.');
      } catch (err) {
        console.error('녹화를 일시정지할 수 없습니다:', err);
      }
    } else {
      console.log('녹화 중이 아닙니다.');
    }
  }

  const handleResumeRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      try {
        await mediaRecorderRef.current.resume();
        console.log('녹화가 재개되었습니다.');
      } catch (err) {
        console.error('녹화를 재개할 수 없습니다:', err);
      }
    }
  }

  const handleEndRecording = () => {
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('녹화가 종료되었습니다.');
        userService.deleteReservation(settings.location, reservationInfo.id);
      }
      catch (err) {
        console.error('녹화를 종료할 수 없습니다다:', err)
      }
    }
  }

  const completeSubtitle = () => {
    return new Promise<subtitleData[]>((resolve) => {
      setSubtitlePieces((prev) => {
        const lastIndex = prev.length - 1;
        const updated = [
          ...prev,
          {
            text1: `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 ${
              topic.peopleType === 1 ? '나' : '우리'
            }의 INNERVIEW 여기까지.`,
            text2: '',
            startSeconds: prev[lastIndex]?.endSeconds || totalSecondsRef.current,
            endSeconds: prev[lastIndex]?.endSeconds + 10,
            isFirst: false,
          },
        ];
        resolve(updated); // 업데이트된 상태를 Promise로 반환
        return updated;
      });
    });
  };

  const saveRecording = async () => {
    if (chunksRef.current.length === 0) return
    setVideoUploadState('saving')

    const blob = new Blob(chunksRef.current, {type: 'video/mp4'})
    const timeString = new Date().toLocaleString('ko-KR',
      { year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
        .replace(/[^0-9]/g, '')
        .replace(/\s/g, '')
        .replace(/(\d{8})(\d{6})/, '$1_$2')
    // 파일 이름 정하는 곳 ; 파일 이름을 랜덤이 아닌 그날의 날짜와 시간으로 표기(yyyymmdd_hhmmss)
    const fileName = `raw_innerview_${timeString}.mp4`
    const file = new File([blob], fileName, { type: 'video/mp4' })

    try {

      const subtitleData = await completeSubtitle();

      console.log('자막 마무리 완료 : ', subtitleData)

      const payload: InterviewCreateDto = {
        selected_language: lang,
        selected_people_mode: topic.peopleType === 1 ? '1인용' : '2인용',
        selected_question_type: topic.questionType,
        selected_subject: lang === 'ko' ? topic.topic.ko : topic.topic.en,
        selected_color_mode: videoMode,
        recorded_seconds: totalSecondsRef.current,
        video_link: ''
      }

      const res = await interviewService.createInterview(payload)
      
      setQRCodeLink(res.qr_code_link)
      chunksRef.current = []

      const videoData: VideoData = {
        videoMode: videoMode,
        subtitles: subtitleData,
        interview_id: res.id
      }

      // setVideoMetadata(videoData)

      console.log('interview created', res)
      console.log('start uploading video')

      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)
      fileReader.onload = () => {
        const fileContent = fileReader.result as ArrayBuffer
        window.electron.ipcRenderer.send('save-video', {
          fileName,
          fileContent,
          videoData,
          interviewId: res.id,
          presignedPutUrl: res.video_link
        })

        setVideoUploadState('uploaded') 
        console.log('video uploaded')
      // at this point, this component will be unmounted
      }

    } catch (error) {
        console.error(error)
        console.log('internet error, save interview in local')
        
        const videoData: VideoData = {
          videoMode : videoMode,
          subtitles: subtitlePieces,
          interview_id: 0
        }

        const fileReader = new FileReader()

        fileReader.readAsArrayBuffer(file)

        fileReader.onload = () => {
          const fileContent = fileReader.result as ArrayBuffer
          window.electron.ipcRenderer.send('save-video-local', {
            fileName,
            fileContent,
            videoData,
            interviewId: 0,
          })
        setVideoUploadState('only local uploaded')
        }
    }
  }

  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    if(!isCQIworking) {
      setIsKeydownActive(false);
      handlePauseRecording()
      setIsStartingPopup2(true)
      setIsCQIworking(true);
      return
    }
    else {
      if (KEYS_SCREEN_NEXT.includes(event.key)) {
        if(isRecording) {
          if(currentQuestionIndexRef.current + 1 >= questions.length) { // 다음 질문이 없을 때
            console.log('질문이 끝났습니다.')
            setIsKeydownActive(false);
            handlePauseRecording();
            setIsEndingPopup(true);
            setIsEndingPopupKeydownActive(true);
            setSubtitlePieces((prev) => {
                // 마지막 요소를 변경해야 한다면, 불변성을 유지하면서 할 것.
                const lastIndex = prev.length - 1;
                const updatedLast = { ...prev[lastIndex], endSeconds: totalSecondsRef.current };
                return [...prev.slice(0, lastIndex), updatedLast];
              });
            console.log('마지막 질문 시간 수정 완료')
            setCurrentQuestionIndex(questions.length-1);
            console.log('마지막 질문에 인덱스 설정 완료 :', currentQuestionIndexRef.current)
            return
          }
          else { // 다음 질문이 있을 때
            setSubtitlePieces((prev) => {
                const lastIndex = prev.length - 1;
                const updatedLast = { ...prev[lastIndex], endSeconds: totalSecondsRef.current };
                return [...prev.slice(0, lastIndex), updatedLast, {
                  startSeconds: totalSecondsRef.current,
                  endSeconds: 0,
                  text1: questions[currentQuestionIndexRef.current+1].questions[lang],
                  text2: questions[currentQuestionIndexRef.current+1].detailedQuestions[lang],
                  isFirst: isFirst[currentQuestionIndexRef.current+1]
                }];
            });
            console.log(currentQuestionIndexRef.current+1, '번째 질문 추가 완료! ', subtitlePieces)

            if(isFirst[currentQuestionIndexRef.current+1]) {
              setIsKeydownActive(false);
              setIsFirst((prev) => {
                return prev.map((item, index) => {
                  return index === currentQuestionIndexRef.current+1 ? false : item
                })
              });
              setIsQuestionPopup(true)
            }
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
          }
        }
      } 
      else if (KEYS_SCREEN_BACK.includes(event.key)) {
        if(isRecording && currentQuestionIndexRef.current > 0) { // 만약 지금이 녹화 중이고, 질문이 첫 번째가 아닐 때
          try{ // 이전 질문으로 돌아가기 위한 코드
            const updateSubtitle = () => new Promise<subtitleData[]>((resolve) => {
              console.log('KEYDOWNBACK currentIndex : ', currentQuestionIndexRef.current)
              setSubtitlePieces((prev) => {
                const lastIndex = prev.length - 1;
                const updatedLast = { ...prev[lastIndex], endSeconds: totalSecondsRef.current };
                const updated = [...prev.slice(0, lastIndex), updatedLast, {
                  startSeconds: totalSecondsRef.current,
                  endSeconds: 0,
                  text1: questions[currentQuestionIndexRef.current-1].questions[lang],
                  text2: questions[currentQuestionIndexRef.current-1].detailedQuestions[lang],
                  isFirst: false
                }];
                resolve(updated); // 업데이트된 상태를 Promise로 반환
                console.log('KEYDOWNBACK subtitle added')
                return updated;
                });
              });
              await updateSubtitle();
              setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
          } catch(err) {
            console.log(err)
          }
        }
      }
    }
  }, [isRecording, currentQuestionIndex, isFirst, subtitlePieces]);

  const handleKeyDownInEndingPage = (event: KeyboardEvent) => {
    if (KEYS_SCREEN_NEXT.includes(event.key)) {
      setEndingOption((endingOption + 1)%2);
    } else if (KEYS_SCREEN_BACK.includes(event.key)) {
      setEndingOption((endingOption + 1)%2);
    } 
    else if (KEYS_SCREEN_CONFIRM.includes(event.key)) {
      setIsEndingPopupKeydownActive(false);
      setIsEndingPopup(false);
      if(endingOption === 0) {
        console.log('돌아가기')
        console.log('현재 질문 인덱스: ', currentQuestionIndexRef.current)
        handleResumeRecording();
        setIsRecording(true);
        setIsKeydownActive(true);
      } 
      else if(endingOption === 1) {
        console.log('바로 종료')
        setIsByebyePopup(true);
        setIsRecording(false);
        handleResumeRecording();
      } 
    }
  }

  return (
      <div className={styles.bg}>

        {/* 비디오 화면면*/}
      {videoUploadState === "before saving" && 
      ( <>
      <div className={styles.videocontainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.video}
          style={{
            filter: filters[videoMode] ? filters[videoMode] : 'none',
          }}
        />
      </div>
      {/* 녹화 중 자막 UI */}
      {isRecording && 
        (<div className={styles.bigContainer}>
          <div className={styles.container}>
            <p className={styles.questionIndex}>
              {currentQuestionIndexRef.current < questions.length ? `${currentQuestionIndexRef.current + 1} / ${questions.length}` : '' }
            </p>
            <div className={styles.question}>
              {(currentQuestionIndexRef.current < questions.length) &&(
                  <p>{questions[currentQuestionIndexRef.current].questions[lang]}</p>
              )}
            </div>
            <div className={styles.timer}>{formattedTime}</div>
          </div>
        </div>)
      }

      {/* 시작 화면 */}
      <AnimatePresence>
        {isStartingPopup && (
          <motion.div
          variants={popupVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
            transition={{
              duration: 1,
            }}
            className={styles.popup}
          >
            <div className={styles.textContainer}>
              <h1>
                {lang === 'ko' ?
                 `본격적인 인터뷰에 앞서 ${helloTime}초 간\n 가벼운 인사를 촬영합니다.`
                : `Please leave a short greeting\nbefore the interview for ${helloTime} seconds.`
                }
              </h1>
              <p>
                {lang === 'ko' ?
                  '다음 예시와 같이 짧게 인사를 남겨주세요!\n"안녕하세요, 저는 2025년 1월 1일의 홍길동입니다."' 
                  : 'Please say something like\n"Hello, I am Hong Gil-dong on January 1, 2025."'
                  }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isHelloPopup && (
        <div className={styles.bigContainer}>
        <div className={styles.container}>
          <p className={styles.questionIndex}></p>
          <div className={styles.question}>
            <p>
              {lang === 'ko' ? 
              `가벼운 인사 한 마디 부탁드립니다!` 
              : `Please leave a short greeting!`
              }
            </p>
          </div>
          <div className={styles.timer}>{formattedTimeForHello}</div>
        </div>
      </div>
      )}
      {/* 시작 화면 2 */}
      <AnimatePresence>
        {isStartingPopup2 && (
          <motion.div
            variants={popupVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            transition={{
              duration: 0.5,
            }}
            className={styles.popup}
            >
              <div className={styles.textContainer}>
              <h1>
                {lang === 'ko' ?
                '지금부터는 본격적인 인터뷰가 시작됩니다!' 
                : 'Now the real interview begins!'
                }
              </h1>
              <p>
                {lang === 'ko' ? ( topic.peopleType === 1 ?
                  '온전히 나다운 시간이 되시길 바랍니다.' : '온전히 우리다운 시간이 되시길 바랍니다.' )
                  : 'I hope you have a good time being yourself.'
                  }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 로고 화면 */}
      <AnimatePresence>
        {isLogoPopup && (
          <motion.div
          variants={popupVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          transition={{
            duration: 2,
          }}
          className={styles.logoPopup}
          >
          </motion.div>
        )}
      </AnimatePresence>

      {/* 세부 질문 */}
      <AnimatePresence>
        {isQuestionPopup && (
          <motion.div
            variants={popupVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            transition={{
              duration: 0.5,
            }}
            className={styles.popup}
          >
            <div className={styles.textContainer}>
              <h1>{questions[currentQuestionIndex].questions[lang]}</h1>
              <p>{questions[currentQuestionIndex].detailedQuestions[lang]}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 종료 확인 */}
      <AnimatePresence>
        {isEndingPopup && (
          <motion.div
            variants={popupVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            transition={{
              duration: 0.5,
            }}
            className={styles.popup}
          >
            <div className={styles.endingContent}>
              <h1>
                {lang === 'ko' ?
                '인터뷰를 바로 종료하시겠습니까?' 
                : 'Would you like to end the interview now?'
                }
              </h1>
              <div className={styles.endingButtons}>
                <div className={`${styles.endingButton} ${ endingOption === 0 ? styles.selected : ''}`}>
                  {lang === 'ko' ? '돌아가기' : 'Go Back'}
                </div>
                <div className={`${styles.endingButton} ${ endingOption === 1 ? styles.selected : ''}`}>
                  {lang === 'ko' ? '바로 종료' : 'End Now'}
                </div>
                {/* <div className={`${styles.endingButton} ${ endingOption === 3 ? styles.selected : ''}`}>
                  {lang === 'ko' ? '쿠키 영상 촬영' : 'Take a Cookie Video'}
                </div> */}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        
      {/* 종료 후 마지막 인사*/}
      {isByebyePopup && (
        <div className={styles.bigContainer}>
        <div className={styles.container}>
          <p className={styles.questionIndex}></p>
          <div className={styles.question}>
            <p>
              {lang === 'ko' ? 
              `마지막으로 아래 문구를 읽어주세요.\n${new Date().getFullYear()}년 ${new Date().getMonth()+1}월 ${new Date().getDate()}일 ${topic.peopleType === 1 ? '나' : '우리'}의 INNERVIEW 여기까지.` 
              : `Lastly, please read the text below.\n${topic.peopleType === 1 ? 'My' : 'Our'} INNERVIEW on ${new Date().getMonth()+1}/${new Date().getDate()}/${new Date().getFullYear()} finished.`
              }
            </p>
          </div>
          <div className={styles.timer}>{formattedTimeForByebye}</div>
        </div>
      </div>
      )}

      {/* 쿠키 영상 촬영 */}
      {/* {isCookiePopup && (
        <div className={styles.bigContainer}>
          <div className={styles.container}>
            <p className={styles.questionIndex}></p>
            <div className={styles.question}>
              <p>
                {lang === 'ko' ? 
                `쿠키 영상 촬영을 시작합니다.`
                : `Cookie video recording starts.`
                }
              </p>
            </div>
          </div>
        </div>)} */}
    </>
  )}
  {videoUploadState === "saving" && (
      <div className={styles.savingContainer}>
        <p>영상이 저장 중입니다. 잠시만 기다려주세요.</p>
      </div>

    )}
    {videoUploadState === "only local uploaded" && (
      <AnimatePresence>
        <motion.div
          variants={popupVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          transition={{
            duration: 0.5,
          }}
          className={styles.questionPopup}
        >
          <div className={styles.questionPopupContent}>
            <h1>
              {lang === 'ko' ?
              '인터넷 연결 문제로 인해 영상 업로드에 실패했습니다.\n영상은 안전하게 저장되었으니, 관리자에게 문의해주세요.\n안내문을 확인 후에는 다음 화면으로 넘어가주세요.' 
              : 'Failed to upload the video due to internet connection issues. \nPlease contact the administrator as the video has been safely stored.\nAfter checking the guide, please proceed to the next screen.'
              }
            </h1>
          </div>
        </motion.div>
    </AnimatePresence>
    )}
  </div>

  ) 
}

export default A4RecordScreen;

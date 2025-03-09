import React, { useState, useEffect, useRef } from 'react'
import styles from '../styles/RecordScreen.module.css'

import { useService } from '../service/useService'
import useModal from '../lib/useModal'
// import textLogo from '../assets/images/textLogo.svg'
import { useDevice } from '../lib/DeviceContext'

import {
  KEYS_SCREEN_BACK,
  KEYS_SCREEN_NEXT,
  krNumPrefixs,
  langText,
  questionSuffixs,
  quotes
} from '../assets/constants'

import useTimer from '../lib/useTimer'
import { subtitleData, VideoData } from '../service/file/interface'
import { InterviewCreateDto } from '../service/interview/interface'
import LastInfoModal from '../components/LastInfoModal'

interface RecordScreenProps {
  lang: 'ko' | 'en'
  //peopleMode: number
  nextScreen: (screenNumber: number) => void
  questions: langText[]
  setQRCodeLink: (link: string) => void
  interviewCreateData: InterviewCreateDto
  videoMode: number
  setFileName: (fileName: string) => void
  setVideoFile: (file: File) => void
  setVideoMetadata: (metadata: VideoData) => void
  time_limit_seconds: number
  filters: string[]
}

const RecordScreen: React.FC<RecordScreenProps> = ({
  lang,
  //peopleMode,
  nextScreen,
  questions,
  setQRCodeLink,
  interviewCreateData,
  videoMode,
  setFileName,
  setVideoFile,
  setVideoMetadata,
  time_limit_seconds,
  filters
}) => {
  // 시간 관련값 세팅
  const READY_SECONDS = 5

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [timestamps, setTimestamps] = useState<number[]>([0])
  const [videoUploadState, setVideoUploadState] = useState<number>(0)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const { formattedTime, seconds } = useTimer(isRecording, time_limit_seconds, () => nextScreen(6))

  const playType: string = '2'

  const {
    renderModal: renderLoadingModal,
    openModal: openLoadingModal,
    closeModal: closeLoadingModal,
    isModalOpen: isLoadingModalOpen
  } = useModal()

  const {
    renderModal: renderInfoModal,
    openModal: openInfoModal,
    closeModal: closeInfoModal
  } = useModal()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const { selectedAudio, selectedVideo } = useDevice()

  const timestampsRef = useRef(timestamps)
  const secondsRef = useRef(seconds)
  const currentQuestionIndexRef = useRef(currentQuestionIndex)
  const videoUploadStateRef = useRef(videoUploadState)
  const isInfoModalOpenRef = useRef(isInfoModalOpen)

  const { interviewService } = useService()

  //시작할 때 호출되는 useEffect
  useEffect(() => {
    // 미디어 초기화 함수 호출
    initializeMedia()

    // 안내 모달 띄우기
    openInfoModal()

    // 5초 뒤에 모달 지우고 녹화 시작
    setTimeout(() => {
      closeInfoModal()
      handleStartRecording()
    }, READY_SECONDS * 1000)

    // 키보드 이벤트 리스너 등록
    window.addEventListener('keydown', handleKeyDown)

    //useEffect의 return은 컴포넌트가 언마운트 될 때 호출됨
    return () => {
      // 언마운트 될 때 미디어 스트림이 존재하면
      if (streamRef.current) {
        // 미디어 스트림의 모든 트랙을 중지('트랙'이란 비디오나 오디오 스트림을 의미)
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // 미디어 초기화 함수
  const initializeMedia = async () => {
    try {
      // 미디어 스트림 정의
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedVideo ? { exact: selectedVideo } : undefined
        },
        audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true
      })

      streamRef.current = stream

      // 비디오 요소에 미디어 스트림 연결
      if (videoRef.current) videoRef.current.srcObject = stream

      // 미디어 레코더 정의
      mediaRecorderRef.current = new MediaRecorder(stream, {
        // 녹화할 미디어 타입 정의
        mimeType: 'video/mp4'
      })

      // 녹화가 시작될 때
      mediaRecorderRef.current.ondataavailable = (event) => {
        // 녹화된 데이터가 있을 때
        if (event.data.size > 0) {
          // 녹화된 데이터를 chunks 배열에 추가
          chunksRef.current.push(event.data)
        }
      }

      // 녹화가 끝났을 때
      mediaRecorderRef.current.onstop = () => {
        // 녹화된 데이터를 저장하는 함수 호출
        saveRecording()
      }

      // 미디어 레코더 에러 발생 시
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event)
      }
    } catch (err) {
      console.error('Error accessing media devices:', err)
    }
  }

  // 녹화 시작 함수
  const handleStartRecording = () => {
    // 아직 녹화할 준비가 되지 않았을 때
    if (!mediaRecorderRef.current) {
      // 0.1초 뒤에 다시 호출
      setTimeout(() => {
        handleStartRecording()
        return
      }, 100)
    }
    // 녹화 준비가 다 되었을 때
    else {
      // 녹화 중임을 표시
      setIsRecording(true)
      // 녹화 데이터 초기화
      chunksRef.current = []
      // 녹화 시작
      try {
        mediaRecorderRef.current.start(500) // 숫자는 녹화 간격을 나타냄. 짧을수록 연산을 많이함.
      } catch (err) {
        console.error('Error starting recording:', err)
      }
    }
  }

  // 녹화 종료 함수
  const handleEndRecording = () => {
    setIsRecording(false)
    console.log('tryed to set timer stopped')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop()
        console.log('recording stopped')
      } catch (err) {
        console.error('Error stopping recording:', err)
      }
    }
  }

  // 녹화 저장 함수
  const saveRecording = async () => {
    if (chunksRef.current.length === 0) {
      return
    }

    window.removeEventListener('keydown', handleKeyDown)

    openLoadingModal()
    setIsInfoModalOpen(true)
    setVideoUploadState(1)

    console.log('timestamps', timestampsRef.current)
    console.log('seconds', secondsRef.current)
    console.log('currentQuestionIndex', currentQuestionIndexRef.current)
    console.log('questions', questions)

    // generate subtitles based on timestamps
    const totalSubtitles = timestampsRef.current
      .map((timestamp, index) => {
        if (index === timestampsRef.current.length - 1) {
          if (playType === '2' && timestampsRef.current.length < questions.length + 1) {
            return {
              startSeconds: timestamp,
              endSeconds: secondsRef.current,
              text1: `${krNumPrefixs[index][lang]} ${questionSuffixs[lang]}`,
              text2: questions[index][lang]
            }
          } else {
            return null
          }
        }
        return {
          startSeconds: timestamp,
          endSeconds: timestampsRef.current[index + 1],
          text1:
            index === questions.length - 1 && index === timestampsRef.current.length - 2
              ? `${
                  lang === 'ko'
                    ? '마지막으로 아래 문구를 읽어주세요'
                    : 'Please read the following text'
                }`
              : `${krNumPrefixs[index][lang]} ${questionSuffixs[lang]}`,
          text2: questions[index][lang]
        }
      })
      .filter((subtitle) => subtitle !== null) as subtitleData[]

    const blob = new Blob(chunksRef.current, {
      type: 'video/mp4'
    })
    const timeString = new Date()
      .toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      .replace(/[^0-9]/g, '')
      .replace(/\s/g, '')
      .replace(/(\d{8})(\d{6})/, '$1_$2')
    // 파일 이름 정하는 곳 ; 파일 이름을 랜덤이 아닌 그날의 날짜와 시간으로 표기(yyyymmdd_hhmmss)
    const fileName = `raw_innerview_${timeString}.mp4`
    const file = new File([blob], fileName, { type: 'video/mp4' })

    setVideoFile(file)
    setFileName(fileName)

    try {
      const payload: InterviewCreateDto = {
        ...interviewCreateData,
        selected_color_mode: videoMode,
        recorded_seconds: secondsRef.current,
        video_link: ''
      }
      const res = await interviewService.createInterview(payload)

      setVideoUploadState(2)
      // at this point, this component will be unmounted

      setQRCodeLink(res.qr_code_link)
      chunksRef.current = []

      const videoData: VideoData = {
        videoMode: videoMode,
        subtitles: totalSubtitles,
        interview_id: res.id
      }

      setVideoMetadata(videoData)

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
      }

      // const uploadedURL = await fileService.uploadFile({ file, videoData })

      // const videoMsg = await interviewService.updateInterview({
      //   interviewId: res.id,
      //   videoLink: uploadedURL
      // })

      // console.log('video uploaded', videoMsg)
      // console.log('video uploaded URL', uploadedURL)
    } catch (error) {
      console.error(error)

      console.log('internet error, save interview in local')

      const videoData: VideoData = {
        videoMode: videoMode,
        subtitles: totalSubtitles,
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
          interviewId: 0
        })
        setVideoUploadState(0)
      }
    }
  }

  // 질문 조정
  // 키보드 이벤트
  const handleKeyDown = (event: KeyboardEvent) => {
    if (KEYS_SCREEN_NEXT.includes(event.key)) {
      if (currentQuestionIndex >= questions.length) {
        return
      }

      setTimestamps((prev) => {
        return [...prev, secondsRef.current]
      })
      handleNextQuestion()
    } else if (KEYS_SCREEN_BACK.includes(event.key)) {
      setTimestamps((prev) => {
        if (prev.length === 1) {
          return prev
        }
        return prev.slice(0, prev.length - 1)
      })

      handlePreviousQuestion()
    }
  }
  // 이전 질문으로 돌아가기
  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => {
      if (prevIndex === 0) {
        return 0
      }
      return prevIndex - 1
    })
  }

  // 다음 질문으로 넘어가기
  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
  }

  // 인터뷰 종료 프로세스
  useEffect(() => {
    timestampsRef.current = timestamps
    secondsRef.current = seconds
    currentQuestionIndexRef.current = currentQuestionIndex
    videoUploadStateRef.current = videoUploadState
    isInfoModalOpenRef.current = isInfoModalOpen

    // 시간이 다 되거나 질문이 끝나면 녹화 종료
    if (currentQuestionIndex >= questions.length || seconds >= time_limit_seconds) {
      handleEndRecording()
    }
    //업로드가 완료되면 로딩 모달을 띄움
    if (videoUploadState === 2 && !isLoadingModalOpen) {
      nextScreen(6)
    }
  }, [
    seconds,
    currentQuestionIndex,
    videoUploadState,
    isInfoModalOpen,
    time_limit_seconds,
    isLoadingModalOpen,
    nextScreen
  ])

  return (
    <div className={styles.screen}>
      {/* 녹화중일 때 */}
      {videoUploadState === 0 && (
        <>
          {/* 비디오 */}
          <div className={styles.videocontainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={styles.video}
              style={{
                filter: filters[videoMode] ? filters[videoMode] : 'none'
              }}
            />
          </div>
          {/* 워터마크 */}
          {/* <p className={styles.watermark}>
            <img src={textLogo} alt="logo" />
          </p> */}
          <div className={styles.bigContainer}>
            <div className={styles.container}>
              <p className={styles.questionIndex}>
                {currentQuestionIndex + 1 === questions.length
                  ? ''
                  : `${currentQuestionIndex + 1} / ${questions.length - 1}`}
              </p>

              <div className={styles.question}>
                {currentQuestionIndex < questions.length && (
                  <p>{questions[currentQuestionIndex][lang]}</p>
                )}
              </div>

              <div className={styles.timer}>{formattedTime}</div>
            </div>
          </div>
        </>
      )}
      {/* 녹화 끝나고 업로드 시작할 때 */}
      {videoUploadState === 1 && (
        <div className={styles.uploading}>
          {/* '인터뷰를 저장하는 중입니다...' */}
          <p>{quotes[7][lang]}</p>
          <p>{quotes[8][lang]}</p>
        </div>
      )}
      {/* 녹화가 끝나고 업로드 중일 때 */}
      {renderInfoModal(
        <div className={styles.infoModal}>
          <p>{quotes[5][lang]}</p>
          <p>{quotes[6][lang]}</p>
        </div>
      )}
      {/* 로딩 모달 */}
      {renderLoadingModal(
        <div className={styles.loadingModal}>
          <LastInfoModal
            lang={lang}
            closeModal={() => {
              closeLoadingModal()
              setIsInfoModalOpen(false)
              videoUploadStateRef.current === 2 && nextScreen(6)
            }}
            time_limit_seconds={time_limit_seconds}
          />
        </div>
      )}
    </div>
  )
}

export default RecordScreen

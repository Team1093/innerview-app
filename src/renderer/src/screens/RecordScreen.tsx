import React, { useState, useEffect, useRef } from 'react'
import styles from '../styles/RecordScreen.module.css'
import useTimer from '../lib/useTimer'
import { useService } from '../service/useService'
import useModal from '../lib/useModal'
import textLogo from '../assets/images/textLogo.svg'
import { useDevice } from '../lib/DeviceContext';

import {
  KEYS_SCREEN_BACK,
  KEYS_SCREEN_NEXT,
  krNumPrefixs,
  langText,
  questionSuffixs,
  quotes
} from '../assets/constants'

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
  videoMode: string
  setFileName: (fileName: string) => void
  setVideoFile: (file: File) => void
  setVideoMetadata: (metadata: VideoData) => void
  time_limit_seconds: number
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
  time_limit_seconds
}) => {
  // 시간 관련값 세팅
  const READY_SECONDS = 5

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [timestamps, setTimestamps] = useState<{questionIndex:number,time:number}[]>([{questionIndex:0,time:0}])
  const [videoUploadState, setVideoUploadState] = useState<number>(0)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const { formattedTime, seconds } = useTimer(isRecording, time_limit_seconds, () => nextScreen(6))

  

  const playType: string = '2'

  const {
    renderModal: renderLoadingModal,
    openModal: openLoadingModal,
    closeModal: closeLoadingModal,
    isModalOpen: isLoadingModalOpen
  } = useModal();

  const {
    renderModal: renderInfoModal,
    openModal: openInfoModal,
    closeModal: closeInfoModal
  } = useModal();

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const streamRef = useRef<MediaStream | null>(null)
  const { selectedAudio, selectedVideo } = useDevice();

  const timestampsRef = useRef(timestamps)
  const secondsRef = useRef(seconds)
  const currentQuestionIndexRef = useRef(currentQuestionIndex)
  const videoUploadStateRef = useRef(videoUploadState)
  const isInfoModalOpenRef = useRef(isInfoModalOpen)

  const { interviewService } = useService()

  useEffect(() => {
    if (currentQuestionIndex >= questions.length) {
      handleEndRecording()
    }
  }, [currentQuestionIndex])

  useEffect(() => {
    initializeMedia()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const initializeMedia = async () => {
    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedVideo ? { deviceId: { exact: selectedVideo } } : true,
        audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true,
      });
      streamRef.current = stream;


      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/mp4'
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        saveRecording()
      }

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event)
      }
    } catch (err) {
      console.error('Error accessing media devices:', err)
    }
  }

  const handleStartRecording = () => {

    // 아직 녹화할 준비가 되지 않았을 때
    if (!mediaRecorderRef.current) {
      setTimeout(() => {
        handleStartRecording()
        return
        }, 100);
    }

    // 녹화 준비가 다 되었을 때
    else {
      setIsRecording(true)
      chunksRef.current = []
      try {
        mediaRecorderRef.current.start(500)
      } catch (err) {
        console.error('Error starting recording:', err)
      }
    }

  }

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
            return {
              startSeconds: timestamp.time,
              // if it's the last timestamp, set endSeconds to the last second of the video
              endSeconds: index === timestampsRef.current.length - 1
                ? secondsRef.current
                : timestampsRef.current[index + 1].time,
              text1:
              // if it's the last question, set text1 to the last subtitle
              timestamp.questionIndex === questions.length - 1
                ? `${lang === 'ko' ? '마지막으로 아래 문구를 읽어주세요' : 'Please read the following text'}`
                : `${krNumPrefixs[timestamp.questionIndex][lang]} ${questionSuffixs[lang]}`,
              text2: questions[timestamp.questionIndex][lang]
            }
      })
      .filter((subtitle) => subtitle !== null) as subtitleData[]

    const blob = new Blob(chunksRef.current, {
      type: 'video/mp4'
    })
    const timeString = new Date().toLocaleString('ko-KR',
      { year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
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

      setVideoUploadState(2) // at this point, this component will be unmounted
      setQRCodeLink(res.qr_code_link)
      chunksRef.current = []

      const videoData: VideoData = {
        isGrayScale: videoMode === 'black-and-white',
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
        isGrayScale: videoMode === 'black-and-white',
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
          interviewId: 0,
        })
      setVideoUploadState(0)
      }
    }
  }
  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => {
      if (prevIndex === 0) {
        return 0
      }

      return prevIndex - 1
    })
  }

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
  }

  useEffect(() => {
    timestampsRef.current = timestamps
    secondsRef.current = seconds
    currentQuestionIndexRef.current = currentQuestionIndex
    videoUploadStateRef.current = videoUploadState
    isInfoModalOpenRef.current = isInfoModalOpen

    if (seconds >= time_limit_seconds) {
      handleEndRecording()
    }

    if (videoUploadState === 2 && !isLoadingModalOpen) {
      nextScreen(6)
    }
  }, [
    seconds,
    currentQuestionIndex,
    timestamps,
    videoUploadState,
    isInfoModalOpen,
    time_limit_seconds,
    playType,
    isLoadingModalOpen,
    nextScreen
  ])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (KEYS_SCREEN_NEXT.includes(event.key)) {
      if (currentQuestionIndex >= questions.length) {
        return
      }

      setTimestamps((prev) => {
        return [...prev, {questionIndex:currentQuestionIndexRef.current, time:secondsRef.current}]
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

  useEffect(() => {
    openInfoModal()
    setTimeout(() => {
      closeInfoModal();
      handleStartRecording();
    }, READY_SECONDS*1000 )

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className={styles.screen}>
      {videoUploadState === 0 && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
            style={{
              filter: videoMode == 'black-and-white' ? 'grayscale(100%)' : 'none'
            }}
          />
          <p className={styles.watermark}>
            <img src={textLogo} alt="logo" />
          </p>

          <div className={styles.container}>
            <div className={styles.question}>
              {currentQuestionIndex < questions.length && (
                <>
                  {currentQuestionIndex === questions.length - 1 ? (
                    <h3>{`${
                      lang === 'ko'
                        ? '마지막으로 아래 문구를 읽어주세요'
                        : 'Please read the following text'
                    }`}</h3>
                  ) : (
                    <h3>{`${krNumPrefixs[currentQuestionIndex][lang]} ${questionSuffixs[lang]}`}</h3>
                  )}
                  <p>{questions[currentQuestionIndex][lang]}</p>
                </>
              )}
            </div>
            <div className={styles.timer}>{formattedTime}</div>
          </div>
          <p className={styles.questionIndex}>
            {currentQuestionIndex+1 === questions.length ? '' : `${currentQuestionIndex + 1} / ${questions.length-1}`}
          </p>
          
        </>
      )}
      {videoUploadState === 1 && (
        <div className={styles.uploading}>
          <p>{quotes[7][lang]}</p>
          <p>{quotes[8][lang]}</p>
        </div>
      )}
      {renderInfoModal(
        <div className={styles.infoModal}>
          <p>{quotes[5][lang]}</p>
          <p>{quotes[6][lang]}</p>
        </div>
      )}
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

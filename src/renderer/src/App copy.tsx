import { useEffect, useState } from 'react'
import styles from './page.module.css'
import StartScreen from './screens/StartScreen'
import InfoScreen from './screens/InfoScreen'
import ColorSelectScreen from './screens/ColorSelectScreen'
import RecordScreen from './screens/RecordScreen'
import FinalScreen from './screens/FinalScreen'
import TopicSelectionScreen from './screens/TopicSelectionScreen'

import useModal from './lib/useModal'
import { InterviewCreateDto } from './service/interview/interface'
import LangSelectScreen from './screens/LangSelectScreen'
import { Question, Topic } from './service/topic/interface'
import { useService } from './service/useService'
import { VideoData } from './service/file/interface'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<number>(0)
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<number>(0)
  const [videoMode, setVideoMode] = useState<number>(0)
  const [qrcodeLink, setQrcodeLink] = useState<string>('')
  const [lang, setLang] = useState<'ko' | 'en'>('ko')
  const [peopleMode, setPeopleMode] = useState<number>(1)
  const [interviewCreateData, setInterviewCreateData] = useState<InterviewCreateDto>({
    selected_language: 'ko',
    selected_people_mode: '1인용',
    selected_question_type: "for me",
    selected_color_mode: 0,
    selected_subject: '',
    recorded_seconds: 0,
    video_link: ''
  })
  const [questionType, setQuestionType] = useState<string>('for me')

  const [fileName, setFileName] = useState<string>('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoMetadata, setVideoMetadata] = useState<VideoData | null>(null)

  const filters = [
    'none',
    'grayscale(100%)',
    'sepia(50%) contrast(1.2) brightness(0.9) saturate(0.8) blur(1px)',
    'sepia(60%) contrast(1.2) brightness(1.1) saturate(0.9) hue-rotate(-10deg)'
  ];
  //이 필터를 수정할 때는 uitls.ts의 processVideoFile 함수에 있는 complexFilter도 수정해야 함

  // 인터뷰 제한시간 설정
  const TimeLimitof = [10*60, 15*60] //1인용 10분, 2인용 15분
  const [time_limit_seconds, setTimeLimit] = useState<number>(TimeLimitof[peopleMode-1])
  useEffect(() => {
    setTimeLimit(TimeLimitof[peopleMode-1])
  },[peopleMode]);

  const { topicService } = useService()

  const {
    openModal: openOverlayModal,
    closeModal: closeOverlayModal,
    renderModal: renderOverlayModal
  } = useModal()

  const nextScreen = (screenNumber: number) => {
    closeOverlayModal()
    setCurrentScreen(screenNumber)
  }

  useEffect(() => {
    const fetchTopics = async () => {
      const res = await topicService.getTopicAndQuestion()
      setAllTopics(res.topics)
      const year = new Date().getFullYear()
      const month = new Date().getMonth() + 1
      const date = new Date().getDate()

      const today = {
        ko: `${year}년 ${month}월 ${date}일`,
        en: `${month}/${date}/${year}`
      }

      res.questions.forEach((question: Question) => {
        question.questions.push({
          ko: `${today['ko']} ${peopleMode === 1 ? '나' : '우리'}의 INNERVIEW 여기까지.`,
          en: `${peopleMode === 1 ? 'My' : 'Our'} INNERVIEW on ${today['en']} finished.`
        })
        setAllQuestions(res.questions)
      })
    }
    fetchTopics()
    openOverlayModal()
    
  }, [])

  return (
    <div className={styles.app}>

      {currentScreen === 1 && (
        <StartScreen lang={lang} nextScreen={nextScreen} />
        )}

      {currentScreen === 2 && (
        <InfoScreen nextScreen={nextScreen} lang={lang} peopleMode={peopleMode} time_limit_seconds={time_limit_seconds} />
        )}
      {currentScreen === 3 && (
        <ColorSelectScreen
          nextScreen={nextScreen}
          setVideoMode={(mode: number) => {
            setVideoMode(mode)
          }}
          videoMode={videoMode}
          filters={filters}
        />
      )}
      {currentScreen === 4 && 
      (
        <TopicSelectionScreen
          lang={lang}
          nextScreen={nextScreen}
          topics={allTopics.filter((t) => {
            return (t.peopleType === peopleMode || t.peopleType === 0) && (t.questionType === questionType )
          })}
          questions={allQuestions}
          selectTopic={(topicId: number) => {
            setSelectedTopicId(topicId)
            setInterviewCreateData({
              ...interviewCreateData,
              selected_subject: allTopics.find((t) => t.topicId === topicId)!.topic[lang]
            })
          }}
        />
        
      )}
      {currentScreen === 5 && (
        <RecordScreen
          lang={lang}
          //peopleMode={peopleMode}
          nextScreen={nextScreen}
          questions={allQuestions.find((q) => q.topicId === selectedTopicId)!.questions}
          setQRCodeLink={(link: string) => {
            setQrcodeLink(link)
          }}
          interviewCreateData={interviewCreateData}
          videoMode={videoMode}
          setFileName={(name: string) => {
            setFileName(name)
          }}
          setVideoFile={(file: File) => {
            setVideoFile(file)
          }}
          setVideoMetadata={(metadata: VideoData) => {
            setVideoMetadata(metadata)
          }}
          time_limit_seconds={time_limit_seconds}
          filters={filters}
        />
      )}
      {currentScreen === 6 && (
        <FinalScreen
          lang={lang}
          qrcodeLink={qrcodeLink}
          fileName={fileName}
          videoFile={videoFile}
          videoMetadata={videoMetadata}
        />
      )}
      {renderOverlayModal(
        <div className={styles.overlay}>
          <LangSelectScreen
            lang={lang}
            setLang={(lang: 'ko' | 'en') => {
              setLang(lang)
              setInterviewCreateData({
                ...interviewCreateData,
                selected_language: lang
              })
            }}
            peopleMode={peopleMode}
            setPeopleMode={(mode: number) => {
              setPeopleMode(mode)
              setInterviewCreateData({
                ...interviewCreateData,
                selected_people_mode: mode === 1 ? '1인용' : '2인용'
              })
            }}
            questionType={questionType}
            setQuestionType={(Qtype: string) => {
              setQuestionType(Qtype)
              setInterviewCreateData({
                ...interviewCreateData,
                selected_question_type: Qtype === 'by me' ? 'by me' : 'for me'
              })  
            }}
            close={() => {
              setCurrentScreen(1)
              closeOverlayModal()
            }}
          />
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import styles from '../styles/TopicSelectionScreen.module.css'
import topicBg from '../assets/images/topicBg.svg'
import { KEYS_SCREEN_BACK, KEYS_SCREEN_CONFIRM, KEYS_SCREEN_NEXT } from '../assets/constants'
import { Question, Topic } from '../service/topic/interface'

interface TopicSelectionScreenProps {
  lang: 'ko' | 'en'
  nextScreen: (screenNumber: number) => void
  topics: Topic[]
  questions: Question[]
  selectTopic: (topicId: number) => void
}

const TopicSelectionScreen: React.FC<TopicSelectionScreenProps> = ({
  lang,
  nextScreen,
  topics,
  questions,
  selectTopic
}) => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(0)

  const handleSelectTopic = (topicId: number) => {
    selectTopic(topicId)
    // 만약 촬영장 팝업 안정화를 시킨다면 여기서 !
    nextScreen(5)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYS_SCREEN_BACK.includes(e.key)) {
        setSelectedTopicIndex((prev) => (prev === 0 ? topics.length - 1 : prev - 1))
      }
      if (KEYS_SCREEN_NEXT.includes(e.key)) {
        setSelectedTopicIndex((prev) => (prev === topics.length - 1 ? 0 : prev + 1))
      }
      if (KEYS_SCREEN_CONFIRM.includes(e.key)) {
        handleSelectTopic(topics[selectedTopicIndex].topicId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [topics, selectedTopicIndex, setSelectedTopicIndex, handleSelectTopic, nextScreen])

  return (
    <>
      <img className={styles.bg} src={topicBg} alt="topic" />
      <div className={styles.screen}>
        <div className={styles.topicButtons}>
          {topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleSelectTopic(topic.topicId)}
              className={`${styles.topicButton} ${selectedTopicIndex === index && styles.selected}`}
              tabIndex={-1}
            >
              <p>{topic.topic[lang]}</p>
            </button>
          ))}
        </div>
        <div className={styles.description}>
          <h3>{`\[${topics[selectedTopicIndex].topic[lang]}\]`}</h3>
          <h4>{topics[selectedTopicIndex].description[lang]}</h4>
          <p>
            {questions.find((q) => q.topicId === topics[selectedTopicIndex].topicId)
              ?.questions[1] !== undefined &&
              questions.find((q) => q.topicId === topics[selectedTopicIndex].topicId)?.questions[1][
                lang
              ]}
          </p>
          <p>
            {questions.find((q) => q.topicId === topics[selectedTopicIndex].topicId)
              ?.questions[2] !== undefined &&
              questions.length > 3 &&
              questions.find((q) => q.topicId === topics[selectedTopicIndex].topicId)?.questions[2][
                lang
              ]}
          </p>
        </div>
      </div>
    </>
  )
}

export default TopicSelectionScreen

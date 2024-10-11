import { langText } from '../../assets/constants'

export interface Topic {
  topicId: number
  topic: langText
  description: langText
  peopleType: number
}

export interface Question {
  topicId: number
  questions: langText[]
}

export interface TopicAndQuestionResponse {
  topics: Topic[]
  questions: Question[]
}

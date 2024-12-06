import { langText } from '../../assets/constants'

export interface Topic {
  topicId: number;
  topic: langText;
  description: langText;
  peopleType: number;
  questionType: 'for me' | 'by me';
}

export interface Question {
  topicId: number;
  questions: langText[];
  detailedQuestions: langText[];
}

export interface TopicAndQuestionResponse {
  topics: Topic[];
  questions: Question[];
}

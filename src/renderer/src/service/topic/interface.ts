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

export interface ServerTopic {
  topic_id: number;
  topic_ko: string;
  topic_en: string;
  description_ko: string;
  description_en: string;
  people_type: number;
  question_type: 'for me' | 'by me';
}
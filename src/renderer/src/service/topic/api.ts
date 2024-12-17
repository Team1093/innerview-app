import { AxiosInstance } from "axios";
import { TopicAndQuestionResponse, Topic, Question } from "./interface";
import { SCHEMA } from '../../assets/constants';

export class TopicService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getTopicAndQuestion() {
    const res = await this.instance.get(`/topic/${SCHEMA}/all/topicAndQuestion`);
    console.log(res.data);
    return res.data as TopicAndQuestionResponse;
  }

  async getQuestions(location: string, topicId: number): Promise<Question[]> {
    try {
      const res = await this.instance.get(`/question/${location}/all/${topicId}`);
      console.log(res.data);
      
      const questions: Question[] = res.data.map((question) => ({
        questionId: question.question_id, // `Question` 인터페이스에 필요한 속성 추가
        topicId: question.topic_id,
        questions: {
          ko: question.question_ko,
          en: question.question_en,
        },
        detailedQuestions: {
          ko: question.detailed_question_ko,
          en: question.detailed_question_en,
        },
      }));
      console.log('questions :', questions);
      return questions;
    } catch (error) {
      console.log('Error while fetching or mapping questions', error);
      throw error;
    }
  }
  

  async getTopic(location:string, topicId: number) : Promise<Topic> {
    const res = await this.instance.get(`/topic/${location}/${topicId}`);
    console.log(res.data);
    const selected_topic : Topic ={
      topicId: res.data.topic_id,
      topic: {
        'ko': res.data.topic_ko,
        'en': res.data.topic_en},
      description: {
        'ko': res.data.description_ko,
        'en': res.data.description_en
      },
      peopleType: res.data.people_type,
      questionType: res.data.question_type
    }
    return selected_topic as Topic;
  }
}

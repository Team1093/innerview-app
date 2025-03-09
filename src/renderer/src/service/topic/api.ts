import { AxiosInstance } from 'axios'
import { TopicAndQuestionResponse, Topic, Question } from './interface'

export class TopicService {
  private instance: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.instance = instance
  }

  async getQuestions(topicId: number): Promise<Question[]> {
    try {
      const res_ko = await this.instance.get(`/question/topic/${topicId}?lang=ko`)
      const res_en = await this.instance.get(`/question/topic/${topicId}?lang=en`)

      const questions: Question[] = res_ko.data.map((question_ko) => ({
        topicId: topicId,
        questions: {
          ko: question_ko.question_text,
          en: res_en.data.find((question_en) => question_en.question_id === question_ko.question_id)
            .question_text
        },
        detailedQuestions: {
          ko: question_ko.question_text_detailed,
          en: res_en.data.find((question_en) => question_en.question_id === question_ko.question_id)
            .question_text_detailed
        }
      }))

      console.log('questions :', questions)
      return questions
    } catch (error) {
      console.log('Error while fetching or mapping questions', error)
      throw error
    }
  }

  async getTopic(topicId: number): Promise<Topic> {
    try {
      const res_ko = await this.instance.get(`/topic/${topicId}?lang=ko`)
      const res_en = await this.instance.get(`/topic/${topicId}?lang=en`)

      // const selected_topic: Topic = {
      //   topicId: res.data.topic_id,
      //   topic: {
      //     ko: res.data.topic_ko,
      //     en: res.data.topic_en
      //   },
      //   description: {
      //     ko: res.data.description_ko,
      //     en: res.data.description_en
      //   },
      //   peopleType: res.data.people_type,
      //   questionType: res.data.question_type
      // }

      const selected_topic: Topic = {
        topicId: topicId,
        topic: {
          ko: res_ko.data?.topic_name,
          en: res_en.data?.topic_name
        },
        description: {
          ko: res_ko.data?.description,
          en: res_en.data?.description
        },
        peopleType: res_ko.data.people_type,
        questionType: 'for me'
      }

      console.log('selected_topic :', selected_topic)
      return selected_topic as Topic
    } catch (error) {
      console.log('Error while fetching or mapping topic', error)
      throw error
    }
  }
}

import { AxiosInstance } from "axios";
import { TopicAndQuestionResponse } from "./interface";
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
}

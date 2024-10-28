import { AxiosInstance } from "axios";
import { TopicAndQuestionResponse } from "./interface";

export class TopicService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getTopicAndQuestion() {
    const res = await this.instance.get("/topic/all/topicAndQuestion");
    console.log(res.data);
    return res.data as TopicAndQuestionResponse;
  }
}

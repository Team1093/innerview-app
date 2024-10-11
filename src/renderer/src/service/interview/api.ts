import { AxiosInstance } from "axios";
import { Interview, InterviewCreateDto } from "./interface";

export class InterviewService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async createInterview(interviewData: InterviewCreateDto): Promise<Interview> {
    const res = await this.instance.post(`/interview`, interviewData);
    return res.data as Interview;
  }

  async getInterviewByInterviewId(interview_id: string): Promise<Interview> {
    const res = await this.instance.get(`/interview/${interview_id}`);
    return res.data as Interview;
  }

  async updateInterview({
    interviewId,
    videoLink,
  }: {
    interviewId: number;
    videoLink: string;
  }) {
    const res = await this.instance.patch(`/interview/${interviewId}`, {
      video_link: videoLink,
    });
    return res.data.message as string;
  }
}

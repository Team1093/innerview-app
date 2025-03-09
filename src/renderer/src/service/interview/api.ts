import { AxiosInstance } from 'axios'

import {
  CreateInterviewDTO,
  CreateInterviewResponse,
  ReadInterviewVideoDTO,
  SharedInterviewVideoDTO
} from './interface'

export class InterviewService {
  private instance: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.instance = instance
  }

  async createInterview(data: CreateInterviewDTO) {
    const res = await this.instance.post('/interview', data)

    return res.data as CreateInterviewResponse
  }

  async readInterviewVideoStatus(interviewId: number) {
    const res = await this.instance.get(`/interview/video/${interviewId}/status`)

    return res.data as { status: string }
  }

  async readInterviewVideo(interviewId: number) {
    const res = await this.instance.get(`/interview/video/${interviewId}`)

    return res.data as ReadInterviewVideoDTO
  }

  async updateInterviewVideoStatus(interviewId: number, status: string) {
    await this.instance.put(`/interview/video/${interviewId}/status`, {
      status
    })
  }

  async getUploadVideoPresignedUrl(interviewId: number, videoType: string) {
    // interviewId as path parameter, videoType as query parameter
    const res = await this.instance.get(`/interview/video/${interviewId}/upload-url`, {
      params: {
        type: videoType
      }
    })

    return res.data as { url: string }
  }

  async getInterviewVideoBySharedCode(sharedCode: string) {
    const res = await this.instance.get(`/interview/video/shared/${sharedCode}`)

    return res.data as SharedInterviewVideoDTO
  }

  async readInterviewByUserId() {
    const res = await this.instance.get('/interview')

    return res.data as ReadInterviewVideoDTO[]
  }

  async deleteInterview(interviewId: number) {
    await this.instance.delete(`/interview/${interviewId}`)
  }
}

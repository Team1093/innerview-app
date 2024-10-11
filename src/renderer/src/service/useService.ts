import axios from 'axios'
import { InterviewService } from './interview/api'
import { FileService } from './file/api'
import { TopicService } from './topic/api'

export const useService = () => {
  const instance = axios.create({
    baseURL: 'https://api.innerviewkr.com',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  instance.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      if (error.response?.status == 401) {
        if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
          window.location.href = '/signin'
        }
        return Promise.reject(error)
      }
      return Promise.reject(error)
    }
  )

  return {
    topicService: new TopicService(instance),
    interviewService: new InterviewService(instance),
    fileService: new FileService(instance)
  }
}

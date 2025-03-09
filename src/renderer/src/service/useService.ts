import axios from 'axios'
import { InterviewService } from './interview/api'
import { TopicService } from './topic/api'
import { FacilityService } from './facility/api'
// import { SettingService } from './settings/api'

export const useService = () => {
  const instance = axios.create({
    baseURL: 'https://api.innerview.today/v1',
    // baseURL: 'http://localhost:8080/v1',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return {
    facilityService: new FacilityService(instance),
    topicService: new TopicService(instance),
    interviewService: new InterviewService(instance)
  }
}

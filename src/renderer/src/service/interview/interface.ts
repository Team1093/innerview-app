export interface ReadInterviewDTO {
  interview_id: number
  reservation_id: number
  selected_color_mode: string
  recorded_seconds: number
  video_status: string
  created_at: string
  thumbnail_image_url: string
}

export interface ReadInterviewVideoDTO {
  video_id: number
  video_type: string
  question_id: number
  thumbnail_image_url: string
  video_url: string
}

export interface SharedInterviewVideoDTO {
  is_available: boolean
  status: string
  video_url: string
}

export interface CreateInterviewDTO {
  reservation_id: number
  selected_color_mode: string
  recorded_seconds: number
  video_status: string
}

export interface CreateInterviewResponse {
  interview_id: number
  presigned_put_url: string
  shared_code: string
}

export interface UpdateInterviewVideoStatusDTO {
  status: string
}

export interface UploadInterviewOriginalVideoResponse {
  presigned_put_url: string
}

export interface Interview {
  id: number;
  interview_id: string;
  selected_language: string;
  selected_people_mode: string;
  selected_color_mode: string;

  selected_subject: string;

  recorded_seconds: number;
  video_status: number;
  video_link: string;
  qr_code_link: string;
  created_at: string;
}

export interface InterviewCreateDto {
  selected_language: string;
  selected_people_mode: string;
  selected_color_mode: string;
  selected_subject: string;
  recorded_seconds: number;
  video_link: string;
}

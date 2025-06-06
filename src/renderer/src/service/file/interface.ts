export interface subtitleData {
  startSeconds: number;
  endSeconds: number;
  text1: string;
  text2: string;
}

export interface VideoData {
  videoMode: number;
  subtitles: subtitleData[];
  interview_id: number;
}

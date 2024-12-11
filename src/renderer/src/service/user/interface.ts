export interface DBUserData {
  id: number;
  name: string;
  phone_number: string;
}

export interface DBReservation {
  id: number;
  userId: number;
  date: Date;
  time_range: string;
  selected_topic_id: number;
  start_time: string;
  end_time: string;
}

export interface ResponseToDesktop {
  state: boolean;
  user: DBUserData;
  reservation: DBReservation;
  forceQuit: boolean;
}
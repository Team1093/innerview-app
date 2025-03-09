export interface Branch {
  branch_id: number
  branch_name: string
  branch_location: string
  branch_picture_url: string
  created_at: string
}

export interface BranchTranslation {
  translation_id: number
  branch_id: number
  language_code: string
  branch_name: string
  branch_location: string
}

export interface Booth {
  booth_id: number
  branch_id: number
  booth_name: string
  max_people_capacity: number
  description: string
}

export interface BoothTranslation {
  translation_id: number
  booth_id: number
  language_code: string
  booth_name: string
  description: string
}

export interface CreateBranchTranslationDTO {
  language_code: string
  branch_name: string
  branch_location: string
}

export interface CreateBranchDTO {
  branch_picture_url: string
  translations: CreateBranchTranslationDTO[]
}

export interface UpdateBranchDTO {
  branch_picture_url: string
}

export interface CreateBoothTranslationDTO {
  language_code: string
  booth_name: string
  description: string
}

export interface CreateBoothDTO {
  max_people_capacity: number
  translations: CreateBoothTranslationDTO[]
}

export interface UpdateBoothDTO {
  max_people_capacity: number
}

export interface UpdateBoothRunningReservationDTO {
  running_reservation_id: number
}

export interface DBUserData {
  id: number
  name: string
  phone_number: string
}

export interface DBReservation {
  id: number
  userId: number
  date: string
  time_range: string
  selected_topic_id: number
  start_time: string
  end_time: string
}

export interface ResponseToDesktop {
  state: boolean
  user: DBUserData
  reservation: DBReservation
  forceQuit: boolean
}

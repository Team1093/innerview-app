export const KEYS_SCREEN_BACK = ['ArrowLeft', 'ArrowUp', 'PageUp']
export const KEYS_SCREEN_NEXT = ['ArrowRight', 'ArrowDown', 'PageDown']
export const KEYS_SCREEN_CONFIRM = ['Enter']

export interface langText {
  ko: string
  en: string
}

export const questionSuffixs: langText = {
  ko: '번째 질문',
  en: 'question'
}

export const krNumPrefixs: langText[] = [
  { ko: '첫', en: 'First' }, // 1
  { ko: '두', en: 'Second' }, // 2
  { ko: '세', en: 'Third' }, // 3
  { ko: '네', en: 'Fourth' }, // 4
  { ko: '다섯', en: 'Fifth' }, // 5
  { ko: '여섯', en: 'Sixth' }, // 6
  { ko: '일곱', en: 'Seventh' }, // 7
  { ko: '여덟', en: 'Eighth' }, // 8
  { ko: '아홉', en: 'Ninth' }, // 9
  { ko: '열', en: 'Tenth' }, // 10
  { ko: '열한', en: 'Eleventh' }, // 11
  { ko: '열두', en: 'Twelfth' }, // 12
  { ko: '열세', en: 'Thirteenth' }, // 13
  { ko: '열네', en: 'Fourteenth' }, // 14
  { ko: '열다섯', en: 'Fifteenth' }, // 15
  { ko: '열여섯', en: 'Sixteenth' }, // 16
  { ko: '열일곱', en: 'Seventeenth' }, // 17
  { ko: '열여덟', en: 'Eighteenth' }, // 18
  { ko: '열아홉', en: 'Nineteenth' }, // 19
  { ko: '스물', en: 'Twentieth' }, // 20
  { ko: '스물한', en: 'Twenty-first' }, // 21
  { ko: '스물두', en: 'Twenty-second' }, // 22
  { ko: '스물세', en: 'Twenty-third' }, // 23
  { ko: '스물네', en: 'Twenty-fourth' }, // 24
  { ko: '스물다섯', en: 'Twenty-fifth' }, // 25
  { ko: '스물여섯', en: 'Twenty-sixth' }, // 26
  { ko: '스물일곱', en: 'Twenty-seventh' }, // 27
  { ko: '스물여덟', en: 'Twenty-eighth' }, // 28
  { ko: '스물아홉', en: 'Twenty-ninth' }, // 29
  { ko: '서른', en: 'Thirtieth' }, // 30
  { ko: '서른한', en: 'Thirty-first' }, // 31
  { ko: '서른두', en: 'Thirty-second' }, // 32
  { ko: '서른세', en: 'Thirty-third' }, // 33
  { ko: '서른네', en: 'Thirty-fourth' }, // 34
  { ko: '서른다섯', en: 'Thirty-fifth' }, // 35
  { ko: '서른여섯', en: 'Thirty-sixth' }, // 36
  { ko: '서른일곱', en: 'Thirty-seventh' }, // 37
  { ko: '서른여덟', en: 'Thirty-eighth' }, // 38
  { ko: '서른아홉', en: 'Thirty-ninth' }, // 39
  { ko: '마흔', en: 'Fortieth' }, // 40
  { ko: '마흔한', en: 'Forty-first' }, // 41
  { ko: '마흔두', en: 'Forty-second' }, // 42
  { ko: '마흔세', en: 'Forty-third' }, // 43
  { ko: '마흔네', en: 'Forty-fourth' }, // 44
  { ko: '마흔다섯', en: 'Forty-fifth' }, // 45
  { ko: '마흔여섯', en: 'Forty-sixth' }, // 46
  { ko: '마흔일곱', en: 'Forty-seventh' }, // 47
  { ko: '마흔여덟', en: 'Forty-eighth' }, // 48
  { ko: '마흔아홉', en: 'Forty-ninth' }, // 49
  { ko: '쉰', en: 'Fiftieth' } // 50
]

export const quotes: langText[] = [
  //0
  {
    ko: '원하시는 언어를 선택해주세요.',
    en: 'Please select your preferred language.'
  },
  //1
  {
    ko: '인터뷰 인원을 선택해주세요.',
    en: 'Please select the number of people for the interview.'
  },
  //2
  {
    ko: '1인용',
    en: 'Single'
  },
  //3
  {
    ko: '2인용',
    en: 'Couple'
  },
  //4
  {
    ko: '시작하기',
    en: 'Start'
  },
  //5
  {
    ko: '안내사항',
    en: 'Info'
  },
  //6
  {
    ko: '인터뷰가 5초 뒤에 시작됩니다.',
    en: 'The interview will start in 5 seconds.'
  },
  //7
  {
    ko: '인터뷰를 저장하는 중입니다...',
    en: 'Saving the interview...'
  },
  //8
  {
    ko: '이 과정은 30 ~ 60초 정도가 소요됩니다. 잠시만 기다려주세요!',
    en: 'This process will take about 30 to 60 seconds. Please wait a moment!'
  },
  //9
  {
    ko: 'QR 코드를 스캔 혹은 촬영해주세요!',
    en: 'Please scan or take a picture of the QR code!'
  },
  //10
  {
    ko: '영상은 일주일 후까지 다운로드하실 수 있습니다.',
    en: 'You can download the video until a week later.'
  },
  //11
  {
    ko: '나의 ',
    en: 'My '
  },
  //12
  {
    ko: '여기까지.',
    en: ''
  },
  //13
  {
    ko: '마침.',
    en: 'The end.'
  },
  //14
  {
    ko: '아래 화살표 버튼을 누르면 넘어갑니다.',
    en: 'Press the arrow button below to proceed.'
  }
]

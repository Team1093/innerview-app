const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development';
import { createWriteStream, mkdirSync, readFile } from 'fs'//, writeFile unlinkSync
import { resolve } from 'path'
import { platform, arch } from 'os'
import { app, dialog } from 'electron'

export interface subtitleData {
  startSeconds: number
  endSeconds: number
  text1: string
  text2: string
}

export interface VideoData {
  videoMode: number
  subtitles: subtitleData[]
  interview_id: number
}

function secondsToString(seconds: number): string {
  // 00:00:00,000
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  const milliseconds = Math.floor((remainingSeconds % 1) * 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${Math.floor(remainingSeconds).toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`
}

function subtitleDataToString(subtitles: subtitleData[]): string {
  if (!subtitles || subtitles.length === 0) {
    return `1
00:00:00,000 --> 00:00:01,000
 `
  }
  return subtitles
    .map((subtitle, index) => {
      if (!subtitle.text1 || !subtitle.text2) {
        return ''
      }
      return `${index + 1}
${secondsToString(subtitle.startSeconds)} --> ${secondsToString(subtitle.endSeconds)}
<font size="24px"><b>${subtitle.text1}</b></font>
<font size="20px">${subtitle.text2}</font>
`
    })
    .join('\n')
}

export async function processVideoFile({
  originalFileBuffer,
  originalFileName,
  subtitles,
  videoMode,
}: {
  originalFileBuffer: Buffer
  originalFileName: string
  subtitles: subtitleData[]
  videoMode?: number
}): Promise<Buffer> {
  const platformName = `${platform()}-${arch()}`
  const ffmpegPath =
    isDev === true
      ? path.join(
          __dirname,
          '../../resources',
          'ffmpeg-bin',
          platformName,
          `ffmpeg${platform() === 'win32' ? '.exe' : ''}`
        )
      : path.join(
          process.resourcesPath,
          'resources',
          'ffmpeg-bin',
          platformName,
          `ffmpeg${platform() === 'win32' ? '.exe' : ''}`
        )
  ffmpeg.setFfmpegPath(ffmpegPath)



  const tempCode = new Date().toLocaleDateString('ko-KR',
    { year: 'numeric', month: '2-digit', day: '2-digit'})
      .replace(/[^0-9]/g, '')
      .replace(/\s/g, '')
      .slice(0, 8)

  const localTime = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(':', '')
  
  const tempDir = (process.platform==='win32') ? `../../innerview-downloads/${tempCode}` : path.join(app.getPath('downloads'), tempCode)
  mkdirSync(tempDir,{ recursive: true })

  const inputFileName = (process.platform==='win32') ? (tempDir +'/'+ originalFileName) : resolve(tempDir, originalFileName)
  const outputFileName = (process.platform==='win32') ? (tempDir +'/'+ 'output.mp4') : resolve(tempDir, 'output.mp4')
  const subtitleFileName = (process.platform==='win32') ? (tempDir +'/'+ localTime+'subtitles.srt') : resolve(tempDir, localTime+'subtitles.srt')
  const watermarkFileName = isDev === true ?
                            path.join(__dirname, '../../src/renderer/src/assets/images/watermark.png') 
                            : path.join(process.resourcesPath, 'resources', 'assets', 'images', 'watermark.png');  // Prod 모드


  await new Promise<void>((resolve, reject) => {
    const inputWriteStream = createWriteStream(inputFileName)
    inputWriteStream.write(originalFileBuffer)
    inputWriteStream.end()
    inputWriteStream.on('finish', resolve)
    inputWriteStream.on('error', reject)
  })

  await new Promise<void>((resolve, reject) => {
    // const bom = Buffer.from([0xef, 0xbb, 0xbf])
    const subtitleWriteStream = createWriteStream(subtitleFileName, {
      encoding: 'utf-8'
    })
    // subtitleWriteStream.write(bom)
    subtitleWriteStream.write(subtitleDataToString(subtitles))
    subtitleWriteStream.end()
    subtitleWriteStream.on('finish', resolve)
    subtitleWriteStream.on('error', reject)
  })

  const commonFilters =[
    [
      {
      filter: 'hflip',  // 좌우 반전 필터
      inputs: '[0]',
      outputs: 'flippedRawVideo'
      }
    ],
    [{
      filter: 'format',
      options: 'rgba',
      inputs: '[1]',
      outputs: 'rawLogo'
    },
    {
      filter: 'colorchannelmixer',
      options: { aa: '0.7' },
      inputs: 'rawLogo',
      outputs: 'logo'
    },
    {
      filter: 'overlay',
      options: { x: '0', y: '0' },
      inputs: ['filteredVideo', 'logo'],
      outputs: 'overlayed'
    },
    {
      filter: 'subtitles',
      options: `filename=${subtitleFileName}:force_style='FontName=Pretendard,Alignment=1,Outline=0'`,
      inputs: 'overlayed',
      outputs: 'subtitled'
    },    
    {
      filter: 'format',
      options: 'yuv420p',  // 최종 색상 포맷 정상화
      inputs: 'subtitled',
      outputs: 'outputVideo'
    }]
  ]
  const complexFilter = [
    [ // 0. Original Filter
      {
      filter: 'null',
      inputs: 'flippedRawVideo',
      outputs: 'filteredVideo'
      }
    ],
    [ // 1. Black&White Filter
      {
        filter: 'format',
        options: 'gray',
        inputs: 'flippedRawVideo',
        outputs: 'filteredVideo'
      }
    ],
    [ // 2. Vintage 1 Filter
      // 세피아 효과
      {
        filter: 'colorchannelmixer',
        options: {
          rr: 0.8179, // (0.393 * 0.3) + (1 * 0.7)
          rg: 0.2307, // (0.769 * 0.3) + (0 * 0.7)
          rb: 0.0567, // (0.189 * 0.3) + (0 * 0.7)
          gr: 0.1047, // (0.349 * 0.3) + (0 * 0.7)
          gg: 0.9058, // (0.686 * 0.3) + (1 * 0.7)
          gb: 0.0504, // (0.168 * 0.3) + (0 * 0.7)
          br: 0.0816, // (0.272 * 0.3) + (0 * 0.7)
          bg: 0.1602, // (0.534 * 0.3) + (0 * 0.7)
          bb: 0.7393, // (0.131 * 0.3) + (1 * 0.7)
          aa: 1       // 알파 채널 (투명도), 일반적으로 변경하지 않음
        },
        inputs: 'flippedRawVideo',
        outputs: 'firstFilteredVideo'
      },
      // 밝기, 대비, 채도 조정
      {
        filter: 'eq',
        options: {
          contrast: 0.8,
          brightness: 0.2, // CSS의 1.2는 ffmpeg에서 기준값 1에서 0.2 증가
          saturation: 2
        },
        inputs: 'firstFilteredVideo',
        outputs: 'filteredVideo'
      }
    ],
    
    [ // 3. Vintage 2 Filter
      // 세피아 효과
      {
        filter: 'colorchannelmixer',
        options: '0.472:0.858:0.234:0:0.393:0.769:0.189:0:0.272:0.534:0.131:0',
        inputs: 'flippedRawVideo',
        outputs: 'firstFilteredVideo'
      },
      // 밝기, 대비, 채도 조정
      {
        filter: 'eq',
        options: {
          brightness: 0.1,  // +0.1 밝기 증가
          contrast: 1.2,    // 대비 증가
          saturation: 0.9,  // 채도 약간 감소
        },
        inputs: 'firstFilteredVideo',
        outputs: 'secondFilteredVideo'
      },
      // 색상 회전
      {
        filter: 'hue',
        options: 'h=-10', // -10도 회전
        inputs: 'secondFilteredVideo',
        outputs: 'filteredVideo'
      }
    ]
  ];
  const finalFilter = [...commonFilters[0], ...complexFilter[videoMode ?? 0], ...commonFilters[1]]

  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg(inputFileName)
      .input(watermarkFileName)
      .videoCodec('libx264')
      .audioCodec('aac')
      .complexFilter(finalFilter)
      .output(outputFileName)
      .outputOptions('-preset fast')
      .outputOptions('-movflags +faststart')
      .outputOptions('-async 1') // 싱크 문제 해결 옵션
      .outputOptions([
        '-map [outputVideo]',
        '-map 0:a'
      ])
      .on('start', (commandLine) => {
      console.log('FFmpeg command:', commandLine)
      })
      .on('error', (err: Error) => {
      dialog.showErrorBox('FFmpeg Error', err.message)
      reject(err)
      })
      .on('progress', (progress: { percent?: number }) => {
        const percentage = progress.percent ?? 0; // Set to 0 if percent is undefined
        console.log(`Processing: ${percentage}% done`);
      })
      .on('end', () => {
      readFile(outputFileName, (err, data) => {
        if (err) {
        dialog.showErrorBox('Read File Error', err.message)
        reject(err)
        } else {
        // ;[inputFileName, subtitleFileName, outputFileName].forEach((file) => {
        //   try {
        //   unlinkSync(file) // 위에 import도 취소해둠
        //   } catch (err) {
        //   dialog.showErrorBox('Delete File Error', (err as Error).message)
        //   }
        // })

        resolve(data)
        }
      })
      })
      .run()
  })
}
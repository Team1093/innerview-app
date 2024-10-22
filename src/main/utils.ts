const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
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
  isGrayScale: boolean
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
  toGrayScale
}: {
  originalFileBuffer: Buffer
  originalFileName: string
  subtitles: subtitleData[]
  toGrayScale?: boolean
}): Promise<Buffer> {
  const platformName = `${platform()}-${arch()}`
  const ffmpegPath =
    process.env.NODE_ENV === 'development'
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
  
  const tempDir = (process.platform==='win32') ? `../../innerview-downloads/${tempCode}` : path.join(app.getPath('temp'), tempCode)
  mkdirSync(tempDir,{ recursive: true })

  const inputFileName = (process.platform==='win32') ? (tempDir +'/'+ originalFileName) : resolve(tempDir, originalFileName)
  const outputFileName = (process.platform==='win32') ? (tempDir +'/'+ 'output.mp4') : resolve(tempDir, 'output.mp4')
  const subtitleFileName = (process.platform==='win32') ? (tempDir +'/'+ localTime+'subtitles.srt') : resolve(tempDir, localTime+'subtitles.srt')

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

  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg(inputFileName)
      .output(outputFileName)
      .videoCodec('libx264')
      .audioCodec('aac')
      .videoFilters(
      `hflip,subtitles=${subtitleFileName}:force_style='FontName=NotoSansCJK,Alignment=1,Outline=0'${
        toGrayScale ? ',format=gray' : ''
      }`
      )
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
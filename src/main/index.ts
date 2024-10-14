import { app, shell, BrowserWindow, ipcMain, systemPreferences } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { mkdirSync, writeFile } from 'fs'
import axios from 'axios'
import { processVideoFile } from './utils'
import { autoUpdater } from 'electron-updater'
import Logger from 'electron-log'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    show: false,
    fullscreen: true,
    fullscreenable: true,
    title: 'Innerview',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      webSecurity: false,  // 로컬 장치 접근 허용
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

autoUpdater.on('checking-for-update', () => {
  Logger.log('Checking for update...')
})

autoUpdater.on('update-available', () => {
  Logger.log('Update available.')
})

autoUpdater.on('update-not-available', () => {
  Logger.log('Update not available.')
})

autoUpdater.on('error', (err) => {
  Logger.error('Error in auto-updater. ' + err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  Logger.log(log_message)
})

autoUpdater.on('update-downloaded', () => {
  Logger.log('Update downloaded')
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  mkdirSync(app.getPath('downloads') + '/innerview-videos/processed', { recursive: true })
  app.setPath('downloads', app.getPath('downloads') + '/innerview-videos')

  if (process.platform === 'darwin') {
    systemPreferences.askForMediaAccess('camera').then((status) => {
      console.log('carmera access authority:', status)
    })

    systemPreferences.askForMediaAccess('microphone').then((status) => {
      console.log('mic access authority:', status)
    })
  } else if (process.platform === 'win32') {
    ipcMain.on('request-meia-access', (event) => {
      event.reply('media-access-response')
    })
  } else {
    console.log('not supported by the os:',process.platform)
  }

  ipcMain.on('save-video', (event, arg) => {
    saveFileToDownloads(arg.fileContent, arg.fileName)
    saveMetaDataToDownloads(arg.videoData, `meta_${arg.fileName}.json`)
    const fileArrayBuffer = arg.fileContent
    const formData = new FormData()
    const file = new Blob([fileArrayBuffer], { type: 'video/mp4' })
    formData.append('file', file, arg.fileName)
    formData.append('json', JSON.stringify(arg.videoData))

    processVideoFile({
      originalFileBuffer: Buffer.from(fileArrayBuffer),
      originalFileName: arg.fileName,
      subtitles: arg.videoData.subtitles,
      toGrayScale: arg.videoData.isGrayscale
    })
      .then((buffer) => {
        // save to downloads
        const downloadPath = app.getPath('downloads')
        mkdirSync(path.join(downloadPath, 'processed'), { recursive: true })
        const filePath = path.join(downloadPath, 'processed', (arg.fileName.replace('raw_','')))

        // put file to aws s3 using arg.presignedPutUrl and send server the s3 url
        axios
          .put(arg.presignedPutUrl, buffer, {
            headers: {
              'Content-Type': 'video/mp4'
            }
          })
          .then(() => {
            console.log('file upload success!')
          })
          .catch((err) => {
            console.error('file upload fail:', err)
          })

        writeFile(filePath, buffer, (err) => {
          if (err) {
            console.error('file upload fail ; error:', err)
          } else {
            console.log('file is successfully saved:', filePath)
          }
        })
      })
      .catch((err) => {
        console.error('video processing error:', err)
      })

    axios
      .patch(
        `http://ec2-13-125-239-221.ap-northeast-2.compute.amazonaws.com:8080/interview/${arg.interviewId}`,
        {
          video_link: `${arg.presignedPutUrl.split('?')[0]}`
        }
      )
      .then((res) => {
        console.log('interview_data update success:', res.data.message)
      })
      .catch((err) => {
        console.error('interview_data update fail:', err)
      })

    // axios
    //   .post('https://api-innerview.lighterlinks.io/file/upload', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   })
    //   .then((res) => {
    //     console.log('파일 업로드 성공:', res.data.url)
    //     axios
    //       .patch(`https://api-innerview.lighterlinks.io/interview/${arg.interviewId}`, {
    //         video_link: res.data.url
    //       })
    //       .then((res) => {
    //         console.log('인터뷰 정보 업데이트 성공:', res.data.message)
    //       })
    //       .catch((err) => {
    //         console.error('인터뷰 정보 업데이트 실패:', err)
    //       })
    //   })
    //   .catch((err) => {
    //     console.error('파일 업로드 실패:', err)
    //   })

    event.returnValue = 'success'
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

export async function saveFileToDownloads(fileContent: ArrayBuffer, fileName: string) {
  const downloadPath = (process.platform==='win32') ? `../../innerview-downloads` : app.getPath('temp')
  mkdirSync(downloadPath,{ recursive: true })

  const filePath = path.join(downloadPath, fileName)

  writeFile(filePath, new Uint8Array(fileContent), (err) => {
    if (err) {
      console.error('video file saving failed:', err)
    } else {
      console.log('raw video file saved well:', filePath)
    }
  })

  return filePath
}

export async function saveMetaDataToDownloads(metaData: any, fileName: string) {
  const downloadPath = (process.platform==='win32') ? `../../innerview-downloads` : app.getPath('temp')
  mkdirSync(downloadPath,{ recursive: true });

  const filePath = path.join(downloadPath, fileName)
  const fileContent = JSON.stringify(metaData, null, 2)

  writeFile(filePath, fileContent, (err) => {
    if (err) {
      console.error('metadata file saving failed:', err)
    } else {
      console.log('metadata file saved well:', filePath)
    }
  })

  return filePath
}

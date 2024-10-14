const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  if (process.platform === 'win32') {
    ipcRenderer.send('request-media-access')
    ipcRenderer.on('media-access-response', () => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log('카메라 및 마이크 접근이 허용되었습니다.')
          // 여기서 stream을 사용하여 비디오 및 오디오 처리
        })
        .catch((error) => {
          console.error('카메라 또는 마이크 접근이 거부되었습니다:', error)
          // 사용자에게 권한 설정 방법 안내
        })
    })
  }
})

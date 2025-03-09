'use client'
import styles from '../styles/A0ManagementScreen.module.css'
import { useEffect, useState } from 'react'
// import { useService } from '@renderer/service/useService';

interface Device {
  label: string
  deviceId: string
}

import { Settings } from '../service/settings/interface'
import { useService } from '@renderer/service/useService'
import { Booth } from '@renderer/service/facility/interface'

interface A0ManagementScreenProps {
  nextScreen: (screenNumber: number) => void
  settings: Settings
  setSettings: (settings: Settings) => void
}

const A0ManagementScreen: React.FC<A0ManagementScreenProps> = ({
  nextScreen,
  settings,
  setSettings
}) => {
  const { facilityService } = useService()

  const [audioDevices, setAudioDevices] = useState<Device[]>([])
  const [videoDevices, setVideoDevices] = useState<Device[]>([])
  const [allBooths, setAllBooths] = useState<Booth[]>([])
  const [isLoaded, setIsLoaded] = useState(false) // 기기 설정 로드 여부 추적

  // 설정과 기기 목록 불러오기
  useEffect(() => {
    const loadSettingsAndDevices = async () => {
      const booths = await facilityService.readAllBooths('ko')
      setAllBooths(booths)

      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter((d) => d.kind === 'audioinput')
        const videoInputs = devices.filter((d) => d.kind === 'videoinput')

        setAudioDevices(audioInputs)
        setVideoDevices(videoInputs)

        const loaded_settings = await window.require('electron').ipcRenderer.invoke('load-settings')

        const newSettings = { ...settings }

        if (loaded_settings.audio) {
          newSettings.audio = loaded_settings.audio
        } else {
          newSettings.audio = audioInputs[0].deviceId
        }

        if (loaded_settings.video) {
          newSettings.video = loaded_settings.video
        } else {
          newSettings.video = videoInputs[0].deviceId
        }

        if (loaded_settings.booth_id) {
          newSettings.booth_id = loaded_settings.booth_id
        } else {
          newSettings.booth_id = booths[0].booth_id
        }

        setSettings(newSettings)
        setIsLoaded(true) // 설정 로드 완료 표시
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    loadSettingsAndDevices()
  }, [])

  // 처음 로드가 된 이후로 설정이 변경될 때만 저장
  useEffect(() => {
    if (isLoaded) {
      const saveSettings = async () => {
        try {
          console.log('Saving settings:', settings)
          await window.require('electron').ipcRenderer.invoke('save-settings', settings)
        } catch (error) {
          console.error('Error saving settings:', error)
        }
      }

      saveSettings()
    }
  }, [settings, isLoaded])

  return (
    <div className={styles.bg}>
      <div className={styles.logo}>
        <p>INNERVIEW</p>
      </div>
      <div className={styles.setting}>
        <p>Location Setting</p>
        <select
          id={styles.location}
          value={settings.booth_id}
          onChange={(e) => setSettings({ ...settings, booth_id: parseInt(e.target.value) })}
        >
          {allBooths.map((booth) => (
            <option key={booth.booth_id} value={booth.booth_id}>
              {booth.booth_name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.setting}>
        <p>Device Setting</p>
        <h3>Audio</h3>
        <select
          value={settings.audio}
          onChange={(e) => setSettings({ ...settings, audio: e.target.value })}
        >
          <option value="">오디오 기기를 선택하세요</option>
          {audioDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
        <h3>Video</h3>
        <select
          value={settings.video}
          onChange={(e) => setSettings({ ...settings, video: e.target.value })}
        >
          <option value="">비디오 장치를 선택하세요</option>
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.start}>
        <button onClick={() => nextScreen(1)}>Start!</button>
      </div>
    </div>
  )
}

export default A0ManagementScreen

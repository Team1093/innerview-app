import React, { useEffect, useState } from 'react';
import { useDevice } from '../lib/DeviceContext'; // DeviceContext 사용

interface Device {
  label: string;
  deviceId: string;
}

interface DeviceSelectModalProps {
  onClose: () => void;
}

const DeviceSelectModal: React.FC<DeviceSelectModalProps> = ({ onClose }) => {
  const [audioDevices, setAudioDevices] = useState<Device[]>([]);
  const [videoDevices, setVideoDevices] = useState<Device[]>([]);

  const { setSelectedAudio, setSelectedVideo } = useDevice();

  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  const [isLoaded, setIsLoaded] = useState(false); // 설정 로드 여부 추적

  // 설정과 기기 목록 불러오기
  useEffect(() => {
    const loadSettingsAndDevices = async () => {
      try {
        const settings = await window.require('electron').ipcRenderer.invoke('load-settings');
        console.log('Settings loaded:', settings);

        setCurrentAudio(settings.audio);
        setCurrentVideo(settings.video);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === 'audioinput');
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');

        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);

        if (!settings.audio && audioInputs.length > 0) {
          const initialAudio = audioInputs[0].deviceId;
          setCurrentAudio(initialAudio);
          setSelectedAudio(initialAudio); // Context에 저장
        }

        if (!settings.video && videoInputs.length > 0) {
          const initialVideo = videoInputs[0].deviceId;
          setCurrentVideo(initialVideo);
          setSelectedVideo(initialVideo); // Context에 저장
        }

        setIsLoaded(true); // 설정 로드 완료 표시
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettingsAndDevices();
  }, [setSelectedAudio, setSelectedVideo]);

  // 설정이 변경될 때만 저장
  useEffect(() => {
    if (isLoaded) {
      const saveSettings = async () => {
        try {
          console.log('Saving settings:', { audio: currentAudio, video: currentVideo });
          await window.require('electron').ipcRenderer.invoke('save-settings', {
            audio: currentAudio,
            video: currentVideo,
          });
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      };

      saveSettings();
    }
  }, [currentAudio, currentVideo, isLoaded]);

  const handleConfirm = () => {
    if (currentAudio!==null) {
      setSelectedAudio(currentAudio);
    }
    if (currentVideo!==null) {
      setSelectedVideo(currentVideo);
    }
    onClose(); // 모달 닫기
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'white',
        border: '1px solid black',
        position: 'absolute',
        right: '10px',
        bottom: '10px',
      }}
    >
      <div style={{ display: 'grid', gap: '5px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 1fr 1fr' }}>
          <h2>기기 설정</h2>
          <button onClick={handleConfirm}>확인</button>
          <button onClick={onClose}>닫기</button>
        </div>

        <h3>오디오 입력 장치</h3>
        <select
          value={currentAudio || ''}
          onChange={(e) => setCurrentAudio(e.target.value)}
        >
          <option value="">오디오 기기를 선택하세요</option>
          {audioDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>

        <h3>비디오 입력 장치</h3>
        <select
          value={currentVideo || ''}
          onChange={(e) => setCurrentVideo(e.target.value)}
        >
          <option value="">비디오 장치를 선택하세요</option>
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label.includes('OBS Virtual Camera')
                ? `${device.label} (가상 카메라)`
                : device.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DeviceSelectModal;

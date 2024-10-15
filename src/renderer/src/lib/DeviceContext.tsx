import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
const { ipcRenderer } = window.require('electron'); // Electron의 IPC 사용

interface DeviceContextType {
  selectedAudio: string | null;
  selectedVideo: string | null;
  setSelectedAudio: (deviceId: string) => void;
  setSelectedVideo: (deviceId: string) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const isLoaded = useRef(false); // 설정 로드 완료 여부 추적

  const saveSettingsToCache = async (audio: string | null, video: string | null) => {
    console.log('Saving settings:', { audio, video });
    await ipcRenderer.invoke('save-settings', { audio, video });
  };

  // 캐시 파일에서 설정 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await ipcRenderer.invoke('load-settings');
        console.log('Loaded settings:', settings);

        if (settings) {
          setSelectedAudio(settings.audio);
          setSelectedVideo(settings.video);
        }

        isLoaded.current = true; // 설정 로드 완료 표시
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // 설정이 변경될 때마다 저장 (설정 로드 완료 후에만)
  useEffect(() => {
    if (isLoaded.current) {
      saveSettingsToCache(selectedAudio, selectedVideo);
    }
  }, [selectedAudio, selectedVideo]);

  return (
    <DeviceContext.Provider
      value={{ selectedAudio, selectedVideo, setSelectedAudio, setSelectedVideo }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevice must be used within a DeviceProvider');
  return context;
};

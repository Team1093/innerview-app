import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  return (
    <DeviceContext.Provider value={{ selectedAudio, selectedVideo, setSelectedAudio, setSelectedVideo }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevice must be used within a DeviceProvider');
  return context;
};

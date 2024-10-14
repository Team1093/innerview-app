import React, { useEffect, useState, useRef } from 'react';
import { useDevice } from '../lib/DeviceContext';

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

    const { selectedAudio, selectedVideo, setSelectedAudio, setSelectedVideo } = useDevice();

    const [currentAudio, setCurrentAudio] = useState<string | null>(selectedAudio);
    const [currentVideo, setCurrentVideo] = useState<string | null>(selectedVideo);
    
    const defaultSettings = useRef<{ audio: string | null; video: string | null }>({audio: selectedAudio,video: selectedVideo,})

    
  // 기기 목록을 불러오는 함수
    useEffect(() => {

        const getDevices = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();

            const audioInputs = devices.filter(d => d.kind === 'audioinput');
            const videoInputs = devices.filter(d => d.kind === 'videoinput');

            setAudioDevices(audioInputs);
            setVideoDevices(videoInputs);

            if (!defaultSettings.current.audio && audioInputs.length > 0) {
                const initialAudio = audioInputs[0].deviceId;
                setCurrentAudio(initialAudio);
                defaultSettings.current.audio = initialAudio;
              }
      
              if (!defaultSettings.current.video && videoInputs.length > 0) {
                const initialVideo = videoInputs[0].deviceId;
                setCurrentVideo(initialVideo);
                defaultSettings.current.video = initialVideo;
              }

            
        }; // getDevices definition end

        getDevices();
    }, []);

    useEffect(() => {
        if (currentAudio && currentVideo) {
          defaultSettings.current = { audio: currentAudio, video: currentVideo, };
        }
      }, [currentAudio, currentVideo]);

    const handleConfirm = () => {
        if(currentAudio) setSelectedAudio(currentAudio);
        if(currentVideo) setSelectedVideo(currentVideo);
        onClose(); // 모달 닫기
      };

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid black' 
                    , position : 'absolute', right: '10px', bottom: '10px'}}>
            <div style={{display :'grid', gap:'5px'}}>

                <div style={{display : 'grid', gridTemplateColumns :'5fr 1fr 1fr'}}>
                    <h2>기기 설정</h2>
                    <button onClick={handleConfirm}>확인</button>
                    <button style={{}} onClick={onClose}>닫기</button>
                </div>
                    <h3>오디오 입력 장치</h3>
                    <select value={currentAudio || ''} onChange={(e) => setCurrentAudio(e.target.value)}>
                        <option value="">오디오 기기를 선택하세요</option>
                        {audioDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label}
                        </option>
                        ))}
                    </select>

                    <h3>비디오 입력 장치</h3>
                    <select value={currentVideo || ''}onChange={(e) => setCurrentVideo(e.target.value)}>
                        <option value="">비디오 기기를 선택하세요</option>
                        {videoDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label.includes('OBS Virtual Camera') ? `${device.label} (가상 카메라)` : device.label}
                        </option>
                        ))}
                    </select> 
                        

            </div>
        </div>
    );
};

export default DeviceSelectModal;
import React, { useEffect, useRef } from "react";
import { useDevice } from '../lib/DeviceContext';

interface WebcamStreamProps {
  width: string | number;
  height: string | number;
  ratio: string;
  filter: string;
}

const WebcamStream: React.FC<WebcamStreamProps> = ({ width, height, ratio, filter }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { selectedVideo } = useDevice();
  useEffect(() => {
    // 웹캠 스트림을 가져오기 위한 MediaDevices API 호출
    
    navigator.mediaDevices
      .getUserMedia({ 
        video : selectedVideo ? { deviceId: { exact: selectedVideo } } : true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing the camera: ", err);
      });

    return () => {
      // 컴포넌트가 언마운트될 때 스트림 정리
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div
      style={{
        width: width,
        height: height,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        style={{
          width: width,
          height: height,
          aspectRatio: ratio,
          objectFit: "cover",
          filter: filter ? filter : "none",
          transform: "rotateY(180deg)",
          WebkitTransform: "rotateY(180deg)",
          MozTransform: "rotateY(180deg)",
        }}
      />
    </div>
  );
};

export default WebcamStream;

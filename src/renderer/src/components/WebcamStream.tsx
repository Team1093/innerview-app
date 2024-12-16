import React, { useEffect, useRef, useState } from "react";
import { useDevice } from '../lib/DeviceContext';

interface WebcamStreamProps {
  width: string | number;
  height: string | number;
  ratio: string;
  filters: string[];
  videoMode: number;
  video: string | undefined;
}

const WebcamStream: React.FC<WebcamStreamProps> = ({ width, height, ratio, filters, videoMode, video }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const filter = filters[videoMode] ? filters[videoMode] : 'none'
  useEffect(() => {
    // 웹캠 스트림을 가져오기 위한 MediaDevices API 호출
    
    navigator.mediaDevices
      .getUserMedia({ 
        video : video ? { deviceId: { exact: video } } : true })
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

    const vignetteStyle: React.CSSProperties = 
    {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: 'radial-gradient(ellipse, transparent, black 150%)',
      pointerEvents: 'none', // 비디오와 상호작용 가능하게 함
      opacity: 0.7,
      display : (videoMode === 0 || videoMode === 1) ? 'none' : 'block'
      // 
    };


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
          filter: filter,
          transform: "rotateY(180deg)",
          WebkitTransform: "rotateY(180deg)",
          MozTransform: "rotateY(180deg)",
          display:'block'
          
        }}
      />
      {/* <video
        ref={videoRef}
        autoPlay
        style={{
          width: width,
          height: height,
          aspectRatio: ratio,
          objectFit: "cover",
          filter: 'sepia(40%) contrast(0.8) brightness(1.2) saturate(2)',
          transform: "rotateY(180deg)",
          WebkitTransform: "rotateY(180deg)",
          MozTransform: "rotateY(180deg)",
        }}
        // 'none',
// 'grayscale(100%)',
// vintage 1
// film vibe
// 'sepia(50%) contrast(1.0) brightness(0.9) saturate(0.8) blur(1px)',
// sepia(20%) contrast(130%) saturate(90%)
//sepia(30%) contrast(0.8) brightness(1) saturate(2) blur(1px)
// 'sepia(60%) contrast(1.0) brightness(1.1) saturate(0.9) hue-rotate(-10deg)'

        /> */}
      <div className="vignette" style={vignetteStyle}></div>
    </div>
  );
};

export default WebcamStream;

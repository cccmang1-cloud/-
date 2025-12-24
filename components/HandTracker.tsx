
import React, { useEffect, useRef } from 'react';
import { GestureType, HandPosition } from '../types';

interface HandTrackerProps {
  onGesture: (gesture: GestureType, position: HandPosition) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onGesture, videoRef }) => {
  useEffect(() => {
    const loadMediaPipe = async () => {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const Hands = (window as any).Hands;
        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        hands.onResults((results: any) => {
          if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            onGesture(GestureType.NONE, { x: 0.5, y: 0.5 });
            return;
          }

          const landmarks = results.multiHandLandmarks[0];
          
          // Use landmark 9 (middle finger base) as the stable center for position tracking
          const center = landmarks[9];
          const currentPos = { x: center.x, y: center.y };
          
          // Gesture Logic
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const distPinch = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
          );

          const middleTip = landmarks[12];
          const middleBase = landmarks[9];
          const isExtended = middleTip.y < middleBase.y;

          if (distPinch < 0.05) {
            onGesture(GestureType.PINCH, currentPos);
          } else if (isExtended) {
            onGesture(GestureType.OPEN, currentPos);
          } else {
            onGesture(GestureType.FIST, currentPos);
          }
        });

        const processVideo = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            await hands.send({ image: videoRef.current });
          }
          requestAnimationFrame(processVideo);
        };
        processVideo();
      };
    };

    loadMediaPipe();
  }, [onGesture, videoRef]);

  return null;
};

export default HandTracker;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
// Corrected import from 'this' to 'three'
import * as THREE from 'three';

import { AppState, GestureType, PhotoData, HandPosition } from './types';
import { audioService } from './services/AudioService';
import { COLORS } from './constants';

import ChristmasTree from './components/ChristmasTree';
import PhotoGallery from './components/PhotoGallery';
import Snow from './components/Snow';
import HandTracker from './components/HandTracker';
import UI from './components/UI';

// Perspective Wrapper to handle fist-control rotation
const SceneWrapper: React.FC<{ gesture: GestureType, handPos: HandPosition, children: React.ReactNode }> = ({ gesture, handPos, children }) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));

  useFrame(() => {
    if (groupRef.current) {
      if (gesture === GestureType.FIST) {
        const rotY = (handPos.x - 0.5) * Math.PI * 1.5;
        const rotX = (handPos.y - 0.5) * (Math.PI / 1.5);
        
        targetRotation.current.y = -rotY;
        targetRotation.current.x = rotX;
      } else {
        targetRotation.current.x *= 0.95;
      }
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation.current.y, 0.05);
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    gesture: GestureType.NONE,
    handPosition: { x: 0.5, y: 0.5 },
    isMusicPlaying: false,
    photos: [
      { id: '1', url: 'https://picsum.photos/400/600?random=1', position: [2, 1, 2], rotation: [0, 0, 0] },
      { id: '2', url: 'https://picsum.photos/400/600?random=2', position: [-2, 3, 1], rotation: [0, 0.5, 0] },
      { id: '3', url: 'https://picsum.photos/400/600?random=3', position: [1, 0, -3], rotation: [0, -0.5, 0] },
      { id: '4', url: 'https://picsum.photos/400/600?random=4', position: [-1.5, -2, 2], rotation: [0, 0.2, 0] },
    ],
    isLoading: true,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    startCamera();

    const timer = setTimeout(() => setState(prev => ({ ...prev, isLoading: false })), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleGesture = useCallback((gesture: GestureType, position: HandPosition) => {
    setState(prev => ({ ...prev, gesture, handPosition: position }));
  }, []);

  const toggleMusic = () => {
    if (state.isMusicPlaying) {
      audioService.stop();
    } else {
      audioService.start();
    }
    setState(prev => ({ ...prev, isMusicPlaying: !prev.isMusicPlaying }));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newPhoto: PhotoData = {
        id: Math.random().toString(),
        url,
        position: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6],
        rotation: [0, Math.random() * Math.PI, 0]
      };
      setState(prev => ({ ...prev, photos: [...prev.photos, newPhoto] }));
    }
  };

  useEffect(() => {
    const unlock = () => {
      if (!state.isMusicPlaying) {
        audioService.start();
        setState(prev => ({ ...prev, isMusicPlaying: true }));
      }
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, [state.isMusicPlaying]);

  return (
    <div className="w-full h-screen bg-black">
      {state.isLoading && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-1000">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-[#ffdae0] font-handwriting text-3xl animate-pulse">Loading AI Magic...</p>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.NoToneMapping }}>
        <color attach="background" args={['#000']} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={45} />
        
        <OrbitControls 
          enabled={state.gesture !== GestureType.FIST}
          enablePan={false} 
          minDistance={10} 
          maxDistance={28} 
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />

        {/* Environment provides necessary reflections for Gold materials */}
        <Environment preset="city" />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 20, 10]} angle={0.2} penumbra={1} intensity={5} color={COLORS.GOLD} castShadow />
        <pointLight position={[0, 10, 0]} intensity={3} color={COLORS.PINK} />

        <SceneWrapper gesture={state.gesture} handPos={state.handPosition}>
          <ChristmasTree gesture={state.gesture} />
          <PhotoGallery photos={state.photos} gesture={state.gesture} />
          <Snow />
        </SceneWrapper>

        {/* Changed 'disableNormalPass' to 'enableNormalPass={false}' based on type error recommendation */}
        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={1.0} 
            mipmapBlur 
            intensity={2.5} 
            radius={0.4}
          />
        </EffectComposer>
      </Canvas>

      <HandTracker onGesture={handleGesture} videoRef={videoRef} />
      
      <UI 
        gesture={state.gesture} 
        isMusicPlaying={state.isMusicPlaying} 
        onToggleMusic={toggleMusic} 
        onUpload={handleUpload}
        videoRef={videoRef}
      />
    </div>
  );
};

export default App;

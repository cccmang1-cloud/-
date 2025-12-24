
import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PhotoData, GestureType } from '../types';

interface PhotoGalleryProps {
  photos: PhotoData[];
  gesture: GestureType;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, gesture }) => {
  const { camera } = useThree();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const meshRefs = useRef<{ [key: string]: THREE.Mesh }>({});

  useFrame((state) => {
    const isPinch = gesture === GestureType.PINCH;
    const isScatter = gesture === GestureType.OPEN;
    const time = state.clock.getElapsedTime();

    // Focus logic
    if (isPinch) {
      if (!focusedId) {
        // Find nearest to center
        let minDistance = Infinity;
        let nearestId = null;
        Object.keys(meshRefs.current).forEach(id => {
          const m = meshRefs.current[id];
          const screenPos = m.position.clone().project(camera);
          const dist = Math.sqrt(screenPos.x ** 2 + screenPos.y ** 2);
          if (dist < minDistance) {
            minDistance = dist;
            nearestId = id;
          }
        });
        setFocusedId(nearestId);
      }
    } else {
      setFocusedId(null);
    }

    photos.forEach((photo) => {
      const mesh = meshRefs.current[photo.id];
      if (!mesh) return;

      const isFocused = focusedId === photo.id;
      let targetPos = new THREE.Vector3(...photo.position);
      let targetScale = 0.8;

      if (isFocused) {
        // Absolute Center Magnetic Effect
        const center = new THREE.Vector3(0, 0, 5); // Relative to camera target
        camera.getWorldDirection(center);
        center.multiplyScalar(5).add(camera.position);
        targetPos.copy(center);
        targetScale = 3.5;
        mesh.lookAt(camera.position); // Billboard mode
      } else if (isScatter) {
        // Full screen scatter range
        targetPos.set(
          photo.position[0] * 8 + Math.sin(time + photo.id.length) * 3,
          photo.position[1] * 6 + Math.cos(time + photo.id.length) * 3,
          photo.position[2] * 4
        );
      } else {
        // Regular ornament mode
        mesh.rotation.y += 0.01;
      }

      mesh.position.lerp(targetPos, 0.1);
      const s = mesh.scale.x;
      const lerpedScale = THREE.MathUtils.lerp(s, targetScale, 0.1);
      mesh.scale.setScalar(lerpedScale);
    });
  });

  return (
    <>
      {photos.map((photo) => (
        <PhotoItem 
          key={photo.id} 
          photo={photo} 
          setRef={(ref) => { if(ref) meshRefs.current[photo.id] = ref; }} 
        />
      ))}
    </>
  );
};

const PhotoItem: React.FC<{ photo: PhotoData, setRef: (ref: THREE.Mesh | null) => void }> = ({ photo, setRef }) => {
  const texture = useMemo(() => new THREE.TextureLoader().load(photo.url), [photo.url]);
  
  return (
    <mesh 
      ref={setRef} 
      position={photo.position} 
      rotation={photo.rotation}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        side={THREE.DoubleSide}
        color={0xffffff} // Ensure brightness is high but below bloom threshold
      />
    </mesh>
  );
};

export default PhotoGallery;

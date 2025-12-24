
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SNOW_COUNT = 1500;

const Snow: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const pos = new Float32Array(SNOW_COUNT * 3);
    const vel = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = -0.05 - Math.random() * 0.05;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { pos, vel };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < SNOW_COUNT; i++) {
      // Gravity + Wind
      positions[i * 3 + 1] += particles.vel[i * 3 + 1];
      positions[i * 3] += Math.sin(time + i) * 0.01;
      
      // Reset if below floor
      if (positions[i * 3 + 1] < -10) {
        positions[i * 3 + 1] = 30;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={SNOW_COUNT}
          array={particles.pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Snow;

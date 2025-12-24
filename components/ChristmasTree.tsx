
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, COLORS } from '../constants';
import { GestureType } from '../types';

interface TreeProps {
  gesture: GestureType;
}

// 1. Enhanced High-fidelity Rotating Star Topper
const Star: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.5; 
    const innerRadius = 0.22;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 5
  }), []);

  const tinyStars = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      radius: 0.7 + Math.random() * 0.5,
      yOffset: (Math.random() - 0.5) * 0.6,
      scale: 0.03 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 1.5;
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.15;
      const s = 1.2 + Math.sin(time * 3) * 0.05;
      meshRef.current.scale.set(s, s, s);
    }

    if (glowRef.current) {
      glowRef.current.rotation.y = -time * 2.5;
      glowRef.current.scale.setScalar(0.9 + Math.sin(time * 5) * 0.3);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group position={[0, TREE_CONFIG.HEIGHT / 2 + 0.4, 0]}>
      {/* Main Golden Star - Added Emissive to prevent black appearance */}
      <mesh ref={meshRef} castShadow>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
          color={COLORS.GOLD}
          emissive={COLORS.GOLD}
          emissiveIntensity={1.5}
          metalness={1}
          roughness={0.05}
          toneMapped={false}
        />
      </mesh>
      
      {/* Sparkle Core */}
      <mesh ref={glowRef}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial 
          color={COLORS.WHITE} 
          emissive={COLORS.GOLD} 
          emissiveIntensity={4} 
          transparent 
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Point light to illuminate the star area */}
      <pointLight intensity={5} color={COLORS.GOLD} distance={3} />

      <group ref={groupRef}>
        {tinyStars.map((s, i) => (
          <mesh 
            key={i} 
            position={[
              Math.cos(s.angle) * s.radius, 
              s.yOffset, 
              Math.sin(s.angle) * s.radius
            ]}
            scale={s.scale}
          >
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial 
              color={COLORS.CHAMPAGNE} 
              emissive={COLORS.CHAMPAGNE}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Ornaments: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const ornamentData = useMemo(() => {
    return Array.from({ length: TREE_CONFIG.ORNAMENT_COUNT }).map((_, i) => {
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const radius = (1 - t) * TREE_CONFIG.RADIUS * 0.98;
      const y = t * TREE_CONFIG.HEIGHT - TREE_CONFIG.HEIGHT / 2;
      return {
        pos: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
        type: i % 2 === 0 ? 'bell' : 'stocking',
        rotation: [0, Math.random() * Math.PI, 0] as [number, number, number],
        scale: 0.15 + Math.random() * 0.1
      };
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {ornamentData.map((d, i) => (
        <group key={i} position={d.pos} rotation={d.rotation} scale={d.scale}>
          {d.type === 'bell' ? (
            <group>
              <mesh position={[0, 0, 0]}>
                <coneGeometry args={[0.4, 0.6, 12]} />
                <meshStandardMaterial color={COLORS.GOLD} metalness={1} roughness={0.1} emissive={COLORS.GOLD} emissiveIntensity={0.2} />
              </mesh>
            </group>
          ) : (
            <group>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.3, 0.5, 0.1]} />
                <meshStandardMaterial color={COLORS.RED} />
              </mesh>
              <mesh position={[0.1, -0.2, 0]}>
                <boxGeometry args={[0.3, 0.2, 0.1]} />
                <meshStandardMaterial color={COLORS.RED} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
};

const ChristmasTree: React.FC<TreeProps> = ({ gesture }) => {
  const mainRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particleData = useMemo(() => {
    return Array.from({ length: TREE_CONFIG.PARTICLE_COUNT }).map((_, i) => {
      const t = i / TREE_CONFIG.PARTICLE_COUNT;
      const angle = t * Math.PI * 2 * TREE_CONFIG.SPIRAL_LOOPS;
      const radiusJitter = (Math.random() - 0.5) * 0.5;
      const heightJitter = (Math.random() - 0.5) * 0.3;
      const radius = (1 - t) * TREE_CONFIG.RADIUS + radiusJitter;
      const y = t * TREE_CONFIG.HEIGHT - TREE_CONFIG.HEIGHT / 2 + heightJitter;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      return {
        targetPos: new THREE.Vector3(x, y, z),
        currentPos: new THREE.Vector3(
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 50
        ),
        scatterPos: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20
        ),
        color: i % 5 === 0 ? COLORS.GOLD : COLORS.CHAMPAGNE,
        scale: 0.008 + Math.random() * 0.025, // Significantly finer particles
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1
      };
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isScatter = gesture === GestureType.OPEN;

    particleData.forEach((p, i) => {
      const target = isScatter ? p.scatterPos : p.targetPos;
      if (isScatter) {
        target.x += Math.sin(time * 0.5 + i) * 0.01;
        target.y += Math.cos(time * 0.5 + i) * 0.01;
      }
      p.currentPos.lerp(target, 0.06);
      dummy.position.copy(p.currentPos);
      dummy.rotation.x += p.rotSpeed;
      dummy.rotation.y += p.rotSpeed;
      const twinkle = 0.7 + Math.sin(time * 5 + p.phase) * 0.3;
      dummy.scale.setScalar(p.scale * twinkle);
      dummy.updateMatrix();
      if (mainRef.current) {
        mainRef.current.setMatrixAt(i, dummy.matrix);
        mainRef.current.setColorAt(i, new THREE.Color(p.color));
      }
    });

    if (mainRef.current) {
      mainRef.current.instanceMatrix.needsUpdate = true;
      if (mainRef.current.instanceColor) mainRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      <Star />
      <Ornaments />
      <instancedMesh ref={mainRef} args={[undefined, undefined, TREE_CONFIG.PARTICLE_COUNT]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshStandardMaterial 
          emissive={COLORS.CHAMPAGNE} 
          emissiveIntensity={2}
          toneMapped={false}
          metalness={0.9}
          roughness={0.1}
        />
      </instancedMesh>
    </group>
  );
};

export default ChristmasTree;

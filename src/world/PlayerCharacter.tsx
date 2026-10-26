/**
 * DAMVERSE - Third-Person Hydroelectric Chief Engineer Character
 * 3D procedural character with hardhat, hi-vis vest, walk/run/jump kinematics.
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerState } from '../types/game';

interface PlayerCharacterProps {
  player: PlayerState;
}

export const PlayerCharacter: React.FC<PlayerCharacterProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  const materials = useMemo(() => {
    return {
      pants: new THREE.MeshStandardMaterial({
        color: '#1e293b', // Navy utility trousers
        roughness: 0.8,
        metalness: 0.1,
      }),
      hiVisVest: new THREE.MeshStandardMaterial({
        color: '#ff6600', // Neon safety orange
        roughness: 0.5,
        metalness: 0.2,
      }),
      reflectiveStripe: new THREE.MeshBasicMaterial({
        color: '#e2e8f0', // Silver retroreflective stripes
      }),
      hardHat: new THREE.MeshStandardMaterial({
        color: '#facc15', // Yellow engineer safety helmet
        roughness: 0.35,
        metalness: 0.3,
      }),
      skin: new THREE.MeshStandardMaterial({
        color: '#d4a373',
        roughness: 0.7,
        metalness: 0.05,
      }),
      boots: new THREE.MeshStandardMaterial({
        color: '#3e2723',
        roughness: 0.85,
        metalness: 0.1,
      }),
    };
  }, []);

  // Limb swinging animation while walking or running
  useFrame((state) => {
    if (player.inVehicle) return;

    if (groupRef.current) {
      groupRef.current.position.set(player.position[0], player.position[1], player.position[2]);
      groupRef.current.rotation.y = player.rotationY;
    }

    if (player.isMoving) {
      const freq = player.isRunning ? 14 : 9;
      const angle = Math.sin(state.clock.getElapsedTime() * freq) * (player.isRunning ? 0.6 : 0.4);

      if (leftLegRef.current) leftLegRef.current.rotation.x = angle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -angle;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -angle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = angle;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
  });

  if (player.inVehicle) {
    return null; // Hidden while inside vehicle
  }

  return (
    <group ref={groupRef} name="PlayerCharacter">
      {/* 1. Boots & Legs */}
      <mesh
        ref={leftLegRef}
        position={[-0.22, 0.45, 0]}
        material={materials.pants}
        castShadow
      >
        <boxGeometry args={[0.22, 0.9, 0.24]} />
      </mesh>
      <mesh
        ref={rightLegRef}
        position={[0.22, 0.45, 0]}
        material={materials.pants}
        castShadow
      >
        <boxGeometry args={[0.22, 0.9, 0.24]} />
      </mesh>

      {/* 2. Torso with Hi-Vis Safety Vest */}
      <group position={[0, 1.25, 0]}>
        <mesh material={materials.hiVisVest} castShadow>
          <boxGeometry args={[0.62, 0.75, 0.36]} />
        </mesh>
        {/* Reflective silver stripes */}
        <mesh position={[0, 0.1, 0.19]} material={materials.reflectiveStripe}>
          <boxGeometry args={[0.63, 0.08, 0.01]} />
        </mesh>
        <mesh position={[0, -0.15, 0.19]} material={materials.reflectiveStripe}>
          <boxGeometry args={[0.63, 0.08, 0.01]} />
        </mesh>
      </group>

      {/* 3. Arms */}
      <mesh
        ref={leftArmRef}
        position={[-0.42, 1.25, 0]}
        material={materials.hiVisVest}
        castShadow
      >
        <boxGeometry args={[0.18, 0.65, 0.2]} />
      </mesh>
      <mesh
        ref={rightArmRef}
        position={[0.42, 1.25, 0]}
        material={materials.hiVisVest}
        castShadow
      >
        <boxGeometry args={[0.18, 0.65, 0.2]} />
      </mesh>

      {/* 4. Head & Yellow Safety Helmet */}
      <group position={[0, 1.82, 0]}>
        {/* Face */}
        <mesh material={materials.skin} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
        </mesh>
        {/* Hardhat Dome */}
        <mesh position={[0, 0.12, 0]} material={materials.hardHat} castShadow>
          <sphereGeometry args={[0.28, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {/* Helmet Rim Visor */}
        <mesh position={[0, 0.1, 0.06]} material={materials.hardHat} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.04, 16]} />
        </mesh>
      </group>
    </group>
  );
};

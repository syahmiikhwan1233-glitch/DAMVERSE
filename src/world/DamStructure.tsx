/**
 * DAMVERSE - Massive Concrete Gravity-Arch Dam Structure
 * 3D procedural engineering assembly with controllable radial spillway gates, penstocks,
 * crest roadway, intake towers, and optional eco-tourism glass skybridge.
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SpillwayGate } from '../types/game';

interface DamStructureProps {
  spillwayGates: SpillwayGate[];
  hasEcoTourism: boolean;
  hasReinforcedSpillway: boolean;
}

export const DamStructure: React.FC<DamStructureProps> = ({
  spillwayGates,
  hasEcoTourism,
  hasReinforcedSpillway,
}) => {
  const gate1Ref = useRef<THREE.Group>(null);
  const gate2Ref = useRef<THREE.Group>(null);
  const gate3Ref = useRef<THREE.Group>(null);

  // Materials with varied roughness & metalness per Three.js directives
  const materials = useMemo(() => {
    return {
      concreteDam: new THREE.MeshStandardMaterial({
        color: '#6e7681',
        roughness: 0.85,
        metalness: 0.08,
      }),
      concreteChute: new THREE.MeshStandardMaterial({
        color: '#5b636d',
        roughness: 0.72,
        metalness: 0.12,
      }),
      roadAsphalt: new THREE.MeshStandardMaterial({
        color: '#282c34',
        roughness: 0.9,
        metalness: 0.05,
      }),
      roadParapet: new THREE.MeshStandardMaterial({
        color: '#8b949e',
        roughness: 0.65,
        metalness: 0.15,
      }),
      steelGate: new THREE.MeshStandardMaterial({
        color: '#d32f2f', // Classic industrial safety red radial gates
        roughness: 0.35,
        metalness: 0.75,
      }),
      steelPenstock: new THREE.MeshStandardMaterial({
        color: '#1f242d', // Dark forged steel penstocks
        roughness: 0.4,
        metalness: 0.82,
      }),
      brassPipes: new THREE.MeshStandardMaterial({
        color: '#b0883b',
        roughness: 0.3,
        metalness: 0.85,
      }),
      glassDeck: new THREE.MeshPhysicalMaterial({
        color: '#88c0d0',
        transparent: true,
        opacity: 0.65,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1.0,
      }),
      lampLight: new THREE.MeshBasicMaterial({
        color: '#ffea79',
      }),
    };
  }, []);

  // Smooth radial gate arm rotations on every frame
  useFrame((_, delta) => {
    const rotSpeed = Math.min(1, delta * 4);
    if (gate1Ref.current && spillwayGates[0]) {
      const targetRot = (spillwayGates[0].openingPercent / 100) * (Math.PI * 0.28);
      gate1Ref.current.rotation.x = THREE.MathUtils.lerp(gate1Ref.current.rotation.x, -targetRot, rotSpeed);
    }
    if (gate2Ref.current && spillwayGates[1]) {
      const targetRot = (spillwayGates[1].openingPercent / 100) * (Math.PI * 0.28);
      gate2Ref.current.rotation.x = THREE.MathUtils.lerp(gate2Ref.current.rotation.x, -targetRot, rotSpeed);
    }
    if (gate3Ref.current && spillwayGates[2]) {
      const targetRot = (spillwayGates[2].openingPercent / 100) * (Math.PI * 0.28);
      gate3Ref.current.rotation.x = THREE.MathUtils.lerp(gate3Ref.current.rotation.x, -targetRot, rotSpeed);
    }
  });

  return (
    <group name="DamStructure">
      {/* 1. Main Curved Dam Abutments & Monoliths */}
      {/* Left Wing (X: -55 to -18) */}
      <mesh
        position={[-35, 15, 0]}
        material={materials.concreteDam}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[34, 30, 16]} />
      </mesh>

      {/* Right Wing (X: 18 to 55) */}
      <mesh
        position={[35, 15, 0]}
        material={materials.concreteDam}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[34, 30, 16]} />
      </mesh>

      {/* Central Spillway Monolith Base (X: -18 to 18, Y: 0 to 20) */}
      <mesh
        position={[0, 10, 0]}
        material={materials.concreteDam}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[36, 20, 20]} />
      </mesh>

      {/* Spillway Piers dividing the 3 gate bays */}
      {[-12, -4, 4, 12].map((x, i) => (
        <group key={`pier-${i}`} position={[x, 24.5, 0]}>
          <mesh material={materials.concreteDam} castShadow receiveShadow>
            <boxGeometry args={[1.6, 11, 14]} />
          </mesh>
          {/* Pier bullnose streamlining upstream */}
          <mesh position={[0, 0, 7.5]} material={materials.concreteDam} castShadow>
            <cylinderGeometry args={[0.8, 0.8, 11, 16]} />
          </mesh>
        </group>
      ))}

      {/* 2. Radial Tainter Spillway Gates (Pintu Alur Limpah 1, 2, 3) */}
      {/* Gate 1 (Bay -8) */}
      <group position={[-8, 23, 1]} ref={gate1Ref}>
        {/* Curved face skin plate */}
        <mesh position={[0, -2.5, 0]} rotation={[0.2, 0, 0]} material={materials.steelGate} castShadow>
          <cylinderGeometry args={[5, 5, 6.2, 16, 1, false, Math.PI * 0.7, Math.PI * 0.6]} />
        </mesh>
        {/* Radial structural arms */}
        <mesh position={[-2.8, -1.2, -2.5]} rotation={[0.4, 0, 0]} material={materials.steelPenstock}>
          <boxGeometry args={[0.3, 0.3, 5.2]} />
        </mesh>
        <mesh position={[2.8, -1.2, -2.5]} rotation={[0.4, 0, 0]} material={materials.steelPenstock}>
          <boxGeometry args={[0.3, 0.3, 5.2]} />
        </mesh>
      </group>

      {/* Gate 2 (Bay 0) */}
      <group position={[0, 23, 1]} ref={gate2Ref}>
        <mesh position={[0, -2.5, 0]} rotation={[0.2, 0, 0]} material={materials.steelGate} castShadow>
          <cylinderGeometry args={[5, 5, 6.2, 16, 1, false, Math.PI * 0.7, Math.PI * 0.6]} />
        </mesh>
        <mesh position={[-2.8, -1.2, -2.5]} rotation={[0.4, 0, 0]} material={materials.steelPenstock}>
          <boxGeometry args={[0.3, 0.3, 5.2]} />
        </mesh>
        <mesh position={[2.8, -1.2, -2.5]} rotation={[0.4, 0, 0]} material={materials.steelPenstock}>
          <boxGeometry args={[0.3, 0.3, 5.2]} />
        </mesh>
      </group>

      {/* Gate 3 (Bay +8) */}
      <group position={[8, 23, 1]} ref={gate3Ref}>
        <mesh position={[0, -2.5, 0]} rotation={[0.2, 0, 0]} material={materials.steelGate} castShadow>
          <cylinderGeometry args={[5, 5, 6.2, 16, 1, false, Math.PI * 0.7, Math.PI * 0.6]} />
        </mesh>
        <mesh position={[-2.8, -1.2, -2.5]} rotation={[0.4, 0, 0]} material={materials.steelPenstock}>
          <boxGeometry args={[0.3, 0.3, 5.2]} />
        </mesh>
        <mesh position={[2.8, -1.2, -2.5]} rotation={[0.4, 0, 0]} material={materials.steelPenstock}>
          <boxGeometry args={[0.3, 0.3, 5.2]} />
        </mesh>
      </group>

      {/* 3. Spillway Discharge Chute (Sloping downstream) */}
      <group position={[0, 10, -11]}>
        <mesh
          rotation={[Math.PI * 0.22, 0, 0]}
          material={materials.concreteChute}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[26, 26, hasReinforcedSpillway ? 4.5 : 3.0]} />
        </mesh>
        {/* Ski-jump Flip Bucket at chute toe */}
        <mesh
          position={[0, -8, -10]}
          rotation={[-Math.PI * 0.15, 0, 0]}
          material={materials.concreteChute}
          castShadow
        >
          <boxGeometry args={[28, 4, 5]} />
        </mesh>
      </group>

      {/* 4. Crest Roadway (Jalan Raya Puncak Empangan) */}
      <group position={[0, 30.1, 0]}>
        {/* Asphalt road deck */}
        <mesh material={materials.roadAsphalt} receiveShadow>
          <boxGeometry args={[106, 0.3, 7.2]} />
        </mesh>

        {/* Center line road marking */}
        <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[104, 0.25]} />
          <meshBasicMaterial color="#f0a500" />
        </mesh>

        {/* Upstream & Downstream Guardrail Parapets */}
        <mesh position={[0, 0.7, 3.6]} material={materials.roadParapet} castShadow>
          <boxGeometry args={[106, 1.2, 0.4]} />
        </mesh>
        <mesh position={[0, 0.7, -3.6]} material={materials.roadParapet} castShadow>
          <boxGeometry args={[106, 1.2, 0.4]} />
        </mesh>

        {/* Lamp Posts along the dam crest */}
        {[-48, -36, -24, 24, 36, 48].map((lx, idx) => (
          <group key={`dam-lamp-${idx}`} position={[lx, 0, 3.4]}>
            <mesh material={materials.roadParapet} castShadow>
              <cylinderGeometry args={[0.08, 0.12, 4.2]} />
            </mesh>
            <mesh position={[0, 2.1, -0.4]} material={materials.lampLight}>
              <sphereGeometry args={[0.22, 12, 12]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. Intake Towers (Upstream side, Z = 12) */}
      {[-16, -6, 6, 16].map((tx, idx) => (
        <group key={`intake-${idx}`} position={[tx, 14, 11]}>
          <mesh material={materials.concreteDam} castShadow receiveShadow>
            <cylinderGeometry args={[2.8, 3.2, 28, 16]} />
          </mesh>
          {/* Trashrack intake screen */}
          <mesh position={[0, -8, 2.8]} material={materials.steelPenstock}>
            <boxGeometry args={[3.6, 8, 0.8]} />
          </mesh>
          {/* Gantry crane tower on top */}
          <mesh position={[0, 15, 0]} material={materials.brassPipes} castShadow>
            <boxGeometry args={[3.2, 2.5, 3.2]} />
          </mesh>
        </group>
      ))}

      {/* 6. Four Heavy Steel Penstocks running from Intake to Powerhouse */}
      {[-16, -6, 6, 16].map((px, idx) => (
        <group key={`penstock-${idx}`}>
          <mesh
            position={[px, 14, -14]}
            rotation={[Math.PI * 0.28, 0, 0]}
            material={materials.steelPenstock}
            castShadow
          >
            <cylinderGeometry args={[1.5, 1.5, 32, 24]} />
          </mesh>
          {/* Support saddles anchoring penstock to bedrock */}
          <mesh position={[px, 6, -18]} material={materials.concreteDam}>
            <boxGeometry args={[4.2, 4.0, 3.0]} />
          </mesh>
        </group>
      ))}

      {/* 7. Elevator & SCADA Control Tower at Left Abutment */}
      <group position={[-51, 33, 0]}>
        <mesh material={materials.concreteDam} castShadow receiveShadow>
          <boxGeometry args={[7, 10, 7]} />
        </mesh>
        {/* Glass observation windows */}
        <mesh position={[0, 3.0, -3.55]} material={materials.glassDeck}>
          <planeGeometry args={[5, 2.4]} />
        </mesh>
        {/* SCADA Communication Antenna */}
        <mesh position={[0, 7, 0]} material={materials.brassPipes}>
          <cylinderGeometry args={[0.06, 0.1, 5, 8]} />
        </mesh>
      </group>

      {/* 8. Optional Eco-Tourism Glass Skybridge */}
      {hasEcoTourism && (
        <group position={[-38, 30.2, -6.5]}>
          {/* Cantilever steel beams */}
          <mesh position={[-2.5, -0.6, 3]} material={materials.steelPenstock}>
            <boxGeometry args={[0.5, 1.2, 7.5]} />
          </mesh>
          <mesh position={[2.5, -0.6, 3]} material={materials.steelPenstock}>
            <boxGeometry args={[0.5, 1.2, 7.5]} />
          </mesh>
          {/* Glass walking floor */}
          <mesh position={[0, 0.1, 3]} material={materials.glassDeck} receiveShadow>
            <boxGeometry args={[5.2, 0.15, 6.5]} />
          </mesh>
          {/* Glass Railing */}
          <mesh position={[0, 0.8, 6.2]} material={materials.glassDeck}>
            <boxGeometry args={[5.2, 1.3, 0.1]} />
          </mesh>
          {/* Tourist Observation Telescope */}
          <group position={[0, 0.8, 5.8]}>
            <mesh material={materials.brassPipes} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 1.1, 12]} />
            </mesh>
            <mesh position={[0, 0.6, 0]} rotation={[0.2, 0, 0]} material={materials.brassPipes}>
              <cylinderGeometry args={[0.07, 0.05, 0.8, 12]} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

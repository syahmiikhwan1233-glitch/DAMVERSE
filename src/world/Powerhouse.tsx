/**
 * DAMVERSE - Hydroelectric Powerhouse & Turbine Generator Hall
 * 3D modeled powerhouse containing 4 Francis turbine generator units,
 * overhead gantry, tailrace channel, step-up transformers, and BESS battery banks.
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TurbineUnit } from '../types/game';

interface PowerhouseProps {
  turbines: TurbineUnit[];
  hasBessBattery: boolean;
  batteryStorageMWh: number;
}

export const Powerhouse: React.FC<PowerhouseProps> = ({
  turbines,
  hasBessBattery,
  batteryStorageMWh,
}) => {
  const rotorRefs = useRef<(THREE.Group | null)[]>([]);

  const materials = useMemo(() => {
    return {
      concreteFloor: new THREE.MeshStandardMaterial({
        color: '#495057',
        roughness: 0.8,
        metalness: 0.1,
      }),
      buildingWall: new THREE.MeshStandardMaterial({
        color: '#d0d7de',
        roughness: 0.75,
        metalness: 0.1,
      }),
      generatorHousing: new THREE.MeshStandardMaterial({
        color: '#1f6feb', // Hydro blue generator casings
        roughness: 0.35,
        metalness: 0.7,
      }),
      generatorRotor: new THREE.MeshStandardMaterial({
        color: '#ffc107',
        roughness: 0.25,
        metalness: 0.85,
      }),
      transformerSteel: new THREE.MeshStandardMaterial({
        color: '#343a40',
        roughness: 0.5,
        metalness: 0.6,
      }),
      porcelainBushing: new THREE.MeshStandardMaterial({
        color: '#8c502b',
        roughness: 0.2,
        metalness: 0.1,
      }),
      bessCasing: new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.3,
        metalness: 0.4,
      }),
      windowGlass: new THREE.MeshPhysicalMaterial({
        color: '#90caf9',
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
        metalness: 0.1,
      }),
      ledGreen: new THREE.MeshBasicMaterial({ color: '#28a745' }),
      ledRed: new THREE.MeshBasicMaterial({ color: '#dc3545' }),
      craneYellow: new THREE.MeshStandardMaterial({
        color: '#f1c40f',
        roughness: 0.5,
        metalness: 0.4,
      }),
    };
  }, []);

  // Spin active turbine generator rotors
  useFrame((_, delta) => {
    turbines.forEach((t, i) => {
      const ref = rotorRefs.current[i];
      if (ref && t.active) {
        const speed = (t.powerMW / 60) * 14;
        ref.rotation.y += speed * delta;
      }
    });
  });

  return (
    <group name="Powerhouse" position={[0, 4.0, -28]}>
      {/* 1. Powerhouse Building Foundation & Concrete Deck */}
      <mesh position={[0, 0, 0]} material={materials.concreteFloor} receiveShadow>
        <boxGeometry args={[44, 0.8, 18]} />
      </mesh>

      {/* Main Machine Hall Enclosure */}
      {/* End Walls */}
      <mesh position={[-21.5, 6, 0]} material={materials.buildingWall} castShadow receiveShadow>
        <boxGeometry args={[1, 12, 18]} />
      </mesh>
      <mesh position={[21.5, 6, 0]} material={materials.buildingWall} castShadow receiveShadow>
        <boxGeometry args={[1, 12, 18]} />
      </mesh>
      {/* North Wall facing dam with penstock penetrations */}
      <mesh position={[0, 6, 8.5]} material={materials.buildingWall} castShadow receiveShadow>
        <boxGeometry args={[42, 12, 1]} />
      </mesh>
      {/* South Wall with glass clerestory windows */}
      <group position={[0, 6, -8.5]}>
        <mesh position={[0, -2.5, 0]} material={materials.buildingWall} castShadow receiveShadow>
          <boxGeometry args={[42, 7, 1]} />
        </mesh>
        <mesh position={[0, 3.5, 0]} material={materials.windowGlass}>
          <boxGeometry args={[40, 5, 0.4]} />
        </mesh>
      </group>
      {/* Powerhouse Roof Truss */}
      <mesh position={[0, 12.2, 0]} material={materials.transformerSteel} castShadow>
        <boxGeometry args={[44, 0.6, 19]} />
      </mesh>

      {/* Overhead Bridge Crane */}
      <mesh position={[0, 10.5, 0]} material={materials.craneYellow} castShadow>
        <boxGeometry args={[42, 0.9, 2.2]} />
      </mesh>

      {/* 2. Four Francis Turbine Generator Units (Unit 1 to 4) */}
      {turbines.map((t, idx) => {
        const xPos = -15 + idx * 10;
        return (
          <group key={`turbine-${t.id}`} position={[xPos, 0.4, 0]}>
            {/* Concrete Turbine Pit Pedestal */}
            <mesh material={materials.concreteFloor} castShadow receiveShadow>
              <cylinderGeometry args={[3.2, 3.4, 1.2, 24]} />
            </mesh>

            {/* Stator Shell / Generator Housing */}
            <mesh position={[0, 1.6, 0]} material={materials.generatorHousing} castShadow>
              <cylinderGeometry args={[2.7, 2.7, 2.0, 24]} />
            </mesh>

            {/* Upper Bearing & Exciter Ring */}
            <mesh position={[0, 2.9, 0]} material={materials.transformerSteel} castShadow>
              <cylinderGeometry args={[1.6, 1.6, 0.6, 20]} />
            </mesh>

            {/* Rotating Exciter Shaft / Inspection Rotor Indicator */}
            <group
              position={[0, 3.5, 0]}
              ref={(el) => {
                rotorRefs.current[idx] = el;
              }}
            >
              <mesh material={materials.generatorRotor} castShadow>
                <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
              </mesh>
              {/* Rotor Cross Arm Indicator */}
              <mesh material={materials.generatorRotor}>
                <boxGeometry args={[2.0, 0.2, 0.3]} />
              </mesh>
              <mesh material={materials.generatorRotor}>
                <boxGeometry args={[0.3, 0.2, 2.0]} />
              </mesh>
            </group>

            {/* Unit Indicator LED */}
            <mesh position={[0, 2.2, 2.75]} material={t.active ? materials.ledGreen : materials.ledRed}>
              <sphereGeometry args={[0.2, 12, 12]} />
            </mesh>

            {/* Unit ID Signpost */}
            <mesh position={[0, 0.8, 3.3]} material={materials.transformerSteel}>
              <boxGeometry args={[1.2, 0.6, 0.1]} />
            </mesh>
          </group>
        );
      })}

      {/* 3. Tailrace Channel under Powerhouse south face */}
      <mesh position={[0, -1.8, -14]} material={materials.concreteFloor}>
        <boxGeometry args={[38, 3.0, 10]} />
      </mesh>

      {/* 4. High-Voltage Step-Up Transformer Switchyard (X: 30 to 50) */}
      <group position={[32, 0.4, 0]}>
        {/* Switchyard Gravel Pad */}
        <mesh material={materials.concreteFloor} receiveShadow>
          <boxGeometry args={[20, 0.3, 16]} />
        </mesh>
        {/* Step-Up Transformers (3 large units) */}
        {[-5, 0, 5].map((tx, i) => (
          <group key={`trans-${i}`} position={[tx, 1.4, 0]}>
            {/* Main Tank */}
            <mesh material={materials.transformerSteel} castShadow>
              <boxGeometry args={[3.2, 2.8, 3.2]} />
            </mesh>
            {/* Radiator Cooling Fins */}
            <mesh position={[1.8, 0, 0]} material={materials.transformerSteel}>
              <boxGeometry args={[0.5, 2.4, 2.8]} />
            </mesh>
            <mesh position={[-1.8, 0, 0]} material={materials.transformerSteel}>
              <boxGeometry args={[0.5, 2.4, 2.8]} />
            </mesh>
            {/* High Voltage Bushings */}
            {[-0.8, 0, 0.8].map((bx, bi) => (
              <mesh key={`bushing-${bi}`} position={[bx, 2.2, 0]} material={materials.porcelainBushing}>
                <cylinderGeometry args={[0.12, 0.2, 1.4, 10]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Busbar Support Steel Towers */}
        <mesh position={[0, 4.5, -5]} material={materials.transformerSteel} castShadow>
          <boxGeometry args={[18, 0.4, 0.4]} />
        </mesh>
        <mesh position={[-8, 2.2, -5]} material={materials.transformerSteel}>
          <boxGeometry args={[0.4, 4.4, 0.4]} />
        </mesh>
        <mesh position={[8, 2.2, -5]} material={materials.transformerSteel}>
          <boxGeometry args={[0.4, 4.4, 0.4]} />
        </mesh>
      </group>

      {/* 5. Utility BESS Battery Storage Bank (When upgrade built) */}
      {hasBessBattery && (
        <group position={[32, 0.4, -14]}>
          {/* Concrete Pad */}
          <mesh material={materials.concreteFloor} receiveShadow>
            <boxGeometry args={[18, 0.3, 8]} />
          </mesh>
          {/* White Modular Battery Enclosures (4 shipping containers) */}
          {[-6, -2, 2, 6].map((bx, i) => (
            <group key={`bess-${i}`} position={[bx, 1.4, 0]}>
              <mesh material={materials.bessCasing} castShadow>
                <boxGeometry args={[3.2, 2.6, 6.0]} />
              </mesh>
              {/* HVAC Cooling Units on roof */}
              <mesh position={[0, 1.4, 0]} material={materials.transformerSteel}>
                <boxGeometry args={[1.5, 0.4, 2.0]} />
              </mesh>
              {/* Green status light */}
              <mesh position={[0, 0.8, 3.05]} material={materials.ledGreen}>
                <sphereGeometry args={[0.1, 8, 8]} />
              </mesh>
            </group>
          ))}
          {/* Storage Capacity Gauge sign */}
          <mesh position={[0, 3.2, -3.8]} material={materials.transformerSteel}>
            <boxGeometry args={[6.0, 0.8, 0.2]} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/**
 * DAMVERSE - Dynamic Water System & Hydro Flow Visuals
 * Realistic reservoir water volume, animated surface ripples, spillway cascades,
 * and downstream river with dynamic flood expansion.
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SpillwayGate } from '../types/game';

interface WaterSystemProps {
  reservoirLevel: number;
  spillwayGates: SpillwayGate[];
  downstreamLevel: number;
  isFlooding: boolean;
  hasSolarFarm: boolean;
  solarGenerationMW: number;
}

export const WaterSystem: React.FC<WaterSystemProps> = ({
  reservoirLevel,
  spillwayGates,
  downstreamLevel,
  isFlooding,
  hasSolarFarm,
}) => {
  const lakeMeshRef = useRef<THREE.Mesh>(null);
  const riverMeshRef = useRef<THREE.Mesh>(null);
  const cascadeRefs = useRef<(THREE.Mesh | null)[]>([]);

  const materials = useMemo(() => {
    return {
      lakeWater: new THREE.MeshPhysicalMaterial({
        color: '#1a5f7a',
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88,
        reflectivity: 0.8,
        clearcoat: 0.9,
      }),
      riverWater: new THREE.MeshStandardMaterial({
        color: '#15616d',
        roughness: 0.2,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85,
      }),
      floodWater: new THREE.MeshStandardMaterial({
        color: '#705335', // Muddy brown flood runoff
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
      }),
      cascadeFoam: new THREE.MeshBasicMaterial({
        color: '#e0fbfc',
        transparent: true,
        opacity: 0.85,
        wireframe: false,
      }),
      solarPontoon: new THREE.MeshStandardMaterial({
        color: '#2b2d42',
        roughness: 0.8,
        metalness: 0.2,
      }),
      solarCell: new THREE.MeshPhysicalMaterial({
        color: '#0d1b2a',
        roughness: 0.15,
        metalness: 0.9,
        reflectivity: 0.9,
      }),
    };
  }, []);

  // Animate water flow & cascade pulsing
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Subtle reservoir surface breathing
    if (lakeMeshRef.current) {
      lakeMeshRef.current.position.y = THREE.MathUtils.lerp(
        lakeMeshRef.current.position.y,
        reservoirLevel + Math.sin(time * 0.8) * 0.05,
        Math.min(1, delta * 3)
      );
    }

    // River flow motion
    if (riverMeshRef.current) {
      riverMeshRef.current.position.y = THREE.MathUtils.lerp(
        riverMeshRef.current.position.y,
        downstreamLevel + Math.sin(time * 1.5) * 0.04,
        Math.min(1, delta * 3)
      );
    }

    // Spillway cascade visibility and turbulence
    spillwayGates.forEach((gate, i) => {
      const mesh = cascadeRefs.current[i];
      if (mesh) {
        const openingFrac = gate.openingPercent / 100;
        mesh.visible = openingFrac > 0.01;
        if (mesh.visible) {
          mesh.scale.set(1.0, 1.0, openingFrac);
          mesh.position.y = 10 + Math.sin(time * 12 + i) * 0.15;
        }
      }
    });
  });

  return (
    <group name="WaterSystem">
      {/* 1. Upstream Reservoir Lake Water Surface (Z: 2 to 240, X: -60 to 60) */}
      <mesh
        ref={lakeMeshRef}
        position={[0, reservoirLevel, 120]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.lakeWater}
        receiveShadow
      >
        <planeGeometry args={[115, 236, 16, 16]} />
      </mesh>

      {/* Floating Solar Farm on the reservoir (when built) */}
      {hasSolarFarm && (
        <group position={[-25, reservoirLevel + 0.35, 65]}>
          {/* Pontoon float grid with PV panels (6 rows x 4 cols) */}
          {[-12, -4, 4, 12].map((gx, col) =>
            [-18, -10, -2, 6, 14, 22].map((gz, row) => (
              <group key={`solar-${col}-${row}`} position={[gx, 0, gz]}>
                {/* Floating HDPE Pontoon Floater */}
                <mesh material={materials.solarPontoon} castShadow>
                  <boxGeometry args={[6.5, 0.4, 6.5]} />
                </mesh>
                {/* Tilted Blue PV Panel */}
                <mesh position={[0, 0.45, 0]} rotation={[0.22, 0, 0]} material={materials.solarCell} castShadow>
                  <boxGeometry args={[6.0, 0.1, 5.8]} />
                </mesh>
              </group>
            ))
          )}
          {/* Floating warning buoys */}
          {[-18, 18].map((bx, bi) => (
            <mesh key={`buoy-${bi}`} position={[bx, 0.6, 0]} material={materials.solarPontoon}>
              <sphereGeometry args={[0.6, 12, 12]} />
            </mesh>
          ))}
        </group>
      )}

      {/* 2. Three Spillway Water Cascades (When gates are open) */}
      {spillwayGates.map((gate, i) => {
        const xPos = -8 + i * 8;
        return (
          <group key={`cascade-group-${i}`} position={[xPos, 14, -8]}>
            <mesh
              ref={(el) => {
                cascadeRefs.current[i] = el;
              }}
              rotation={[Math.PI * 0.22, 0, 0]}
              material={materials.cascadeFoam}
            >
              <boxGeometry args={[5.8, 22, 1.2]} />
            </mesh>

            {/* Plunge pool impact spray and foam at chute toe */}
            {gate.openingPercent > 10 && (
              <mesh position={[0, -11, -12]} material={materials.cascadeFoam}>
                <sphereGeometry args={[3.2, 12, 12]} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 3. Downstream River Channel (Z: -35 to -310) */}
      <mesh
        ref={riverMeshRef}
        position={[0, downstreamLevel, -170]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={isFlooding ? materials.floodWater : materials.riverWater}
        receiveShadow
      >
        <planeGeometry args={[isFlooding ? 55 : 32, 275, 12, 12]} />
      </mesh>
    </group>
  );
};

/**
 * DAMVERSE - 4x4 Off-Road Maintenance Pickup Truck
 * Realistic 8-part procedural vehicle with steerable wheels, cargo bed,
 * flashing emergency beacon, headlights, and driveable physics.
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PlayerState } from '../types/game';

interface VehicleProps {
  player: PlayerState;
}

export const Vehicle: React.FC<VehicleProps> = ({ player }) => {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const beaconRef = useRef<THREE.Mesh>(null);

  const materials = useMemo(() => {
    return {
      bodyworkWhite: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.35,
        metalness: 0.6,
      }),
      chassisDark: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.7,
        metalness: 0.3,
      }),
      tireRubber: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.9,
        metalness: 0.1,
      }),
      wheelRim: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        roughness: 0.25,
        metalness: 0.85,
      }),
      tintedGlass: new THREE.MeshPhysicalMaterial({
        color: '#0f172a',
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.7,
      }),
      headlights: new THREE.MeshBasicMaterial({
        color: '#fef08a',
      }),
      taillights: new THREE.MeshBasicMaterial({
        color: '#ef4444',
      }),
      amberBeacon: new THREE.MeshBasicMaterial({
        color: '#f59e0b',
      }),
    };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.set(
        player.vehiclePosition[0],
        player.vehiclePosition[1],
        player.vehiclePosition[2]
      );
      groupRef.current.rotation.y = player.vehicleRotationY;
    }

    // Spin wheels when moving
    if (Math.abs(player.vehicleSpeed) > 0.1) {
      const rotAngle = (player.vehicleSpeed / 1.5) * delta;
      wheelRefs.current.forEach((w) => {
        if (w) w.rotation.x += rotAngle;
      });
    }

    // Flash amber hazard beacon on roof
    if (beaconRef.current) {
      const flash = Math.sin(state.clock.getElapsedTime() * 12) > 0;
      beaconRef.current.visible = player.inVehicle ? flash : true;
    }
  });

  return (
    <group ref={groupRef} name="MaintenancePickupTruck">
      {/* 1. Main Truck Cabin & Engine Hood */}
      <mesh position={[0, 0.95, -0.2]} material={materials.bodyworkWhite} castShadow receiveShadow>
        <boxGeometry args={[2.0, 1.1, 4.4]} />
      </mesh>

      {/* 2. Elevated Passenger Cab Roof & Tinted Windshield */}
      <group position={[0, 1.75, -0.4]}>
        <mesh material={materials.bodyworkWhite} castShadow>
          <boxGeometry args={[1.9, 0.75, 2.2]} />
        </mesh>
        {/* Front windshield */}
        <mesh position={[0, 0.05, 1.12]} rotation={[-0.35, 0, 0]} material={materials.tintedGlass}>
          <planeGeometry args={[1.7, 0.7]} />
        </mesh>
        {/* Side windows */}
        <mesh position={[0.96, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.tintedGlass}>
          <planeGeometry args={[1.8, 0.55]} />
        </mesh>
        <mesh position={[-0.96, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={materials.tintedGlass}>
          <planeGeometry args={[1.8, 0.55]} />
        </mesh>
      </group>

      {/* 3. Open Rear Cargo Bed & Tailgate */}
      <mesh position={[0, 1.05, -1.5]} material={materials.chassisDark} castShadow>
        <boxGeometry args={[1.85, 0.6, 1.6]} />
      </mesh>

      {/* 4. Heavy Off-Road Tires & Rims (4 wheels) */}
      {[
        { x: -1.05, z: 1.2 },
        { x: 1.05, z: 1.2 },
        { x: -1.05, z: -1.3 },
        { x: 1.05, z: -1.3 },
      ].map((w, idx) => (
        <group key={`wheel-${idx}`} position={[w.x, 0.5, w.z]}>
          <mesh
            ref={(el) => {
              wheelRefs.current[idx] = el;
            }}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.tireRubber}
            castShadow
          >
            <cylinderGeometry args={[0.48, 0.48, 0.38, 18]} />
          </mesh>
          {/* Wheel rim */}
          <mesh position={[w.x > 0 ? 0.05 : -0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.wheelRim}>
            <cylinderGeometry args={[0.26, 0.26, 0.4, 12]} />
          </mesh>
        </group>
      ))}

      {/* 5. Front Heavy Duty Bullbar & Headlights */}
      <group position={[0, 0.8, 2.05]}>
        <mesh material={materials.chassisDark} castShadow>
          <boxGeometry args={[1.9, 0.4, 0.25]} />
        </mesh>
        {/* Headlamps */}
        <mesh position={[-0.7, 0.2, 0.14]} material={materials.headlights}>
          <sphereGeometry args={[0.15, 10, 10]} />
        </mesh>
        <mesh position={[0.7, 0.2, 0.14]} material={materials.headlights}>
          <sphereGeometry args={[0.15, 10, 10]} />
        </mesh>
      </group>

      {/* 6. Rear Tail Lights */}
      <mesh position={[-0.75, 0.9, -2.42]} material={materials.taillights}>
        <boxGeometry args={[0.28, 0.18, 0.05]} />
      </mesh>
      <mesh position={[0.75, 0.9, -2.42]} material={materials.taillights}>
        <boxGeometry args={[0.28, 0.18, 0.05]} />
      </mesh>

      {/* 7. Amber Flashing Emergency Roof Lightbar */}
      <mesh ref={beaconRef} position={[0, 2.2, -0.4]} material={materials.amberBeacon}>
        <boxGeometry args={[1.1, 0.15, 0.28]} />
      </mesh>

      {/* 8. Proximity indicator for entering */}
      {player.nearVehicle && !player.inVehicle && (
        <group position={[0, 3.0, 0]}>
          <mesh material={materials.amberBeacon}>
            <coneGeometry args={[0.25, 0.5, 4]} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/**
 * DAMVERSE - Dynamic Environment Lighting, Sun/Moon Arc, Sky & Rain Particles
 * Adheres strictly to Three.js PBR lighting rules (warm key, cool hemisphere fill, horizon fog).
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { WeatherType } from '../types/game';

interface EnvironmentLightingProps {
  timeOfDay: number;
  weather: WeatherType;
  rainIntensity: number;
  shadowsEnabled: boolean;
}

export const EnvironmentLighting: React.FC<EnvironmentLightingProps> = ({
  timeOfDay,
  weather,
  rainIntensity,
  shadowsEnabled,
}) => {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const rainPointsRef = useRef<THREE.Points>(null);

  // Compute sun/moon angle from timeOfDay (0 to 24 hours)
  const { sunPosition, sunColor, sunIntensity, hemiSky, hemiGround, fogColor, isNight } =
    useMemo(() => {
      const hour = timeOfDay % 24;
      const angle = ((hour - 6) / 24) * Math.PI * 2;
      const sunHeight = Math.sin(angle);
      const sunHorizontal = Math.cos(angle);

      const night = sunHeight < -0.05;

      // Sun position
      const pos: [number, number, number] = [
        sunHorizontal * 180,
        Math.max(15, Math.abs(sunHeight) * 160),
        night ? -80 : 80,
      ];

      // Storm darkening factor
      const stormDarkness = weather === 'ribut_tengkujuh' ? 0.35 : weather === 'hujan' ? 0.65 : 1.0;

      if (night) {
        // Moonlit night
        return {
          sunPosition: pos,
          sunColor: '#90caf9',
          sunIntensity: 0.35 * stormDarkness,
          hemiSky: '#1e293b',
          hemiGround: '#0f172a',
          fogColor: '#0b1320',
          isNight: true,
        };
      } else if (sunHeight < 0.25) {
        // Golden hour sunrise/sunset
        return {
          sunPosition: pos,
          sunColor: '#ff9e58',
          sunIntensity: 1.4 * stormDarkness,
          hemiSky: '#fda4af',
          hemiGround: '#374151',
          fogColor: '#2b2333',
          isNight: false,
        };
      } else {
        // Full daylight
        return {
          sunPosition: pos,
          sunColor: '#fff8e7',
          sunIntensity: 1.8 * stormDarkness,
          hemiSky: '#7dd3fc',
          hemiGround: '#2d4739',
          fogColor: weather === 'ribut_tengkujuh' ? '#334155' : '#8dc6e6',
          isNight: false,
        };
      }
    }, [timeOfDay, weather]);

  // Rain particle system (pooled 800 raindrops falling downward)
  const rainGeometry = useMemo(() => {
    const count = 750;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  const rainMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#cbd5e1',
      size: 0.25,
      transparent: true,
      opacity: 0.7,
    });
  }, []);

  // Animate rain falling down
  useFrame((_, delta) => {
    if (rainPointsRef.current && rainIntensity > 0.05) {
      const pos = rainPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const speed = 45 * delta;

      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] -= speed;
        if (arr[i + 1] < 0) {
          arr[i + 1] = 50;
        }
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Horizon Fog matched to sky atmosphere */}
      <fogExp2 attach="fog" args={[fogColor, 0.0035]} />

      {/* Cool Sky / Warm Ground Hemisphere Fill Light */}
      <hemisphereLight args={[hemiSky, hemiGround, 0.85]} />

      {/* Directional Key Sun/Moon Light */}
      <directionalLight
        ref={dirLightRef}
        position={sunPosition}
        color={sunColor}
        intensity={sunIntensity}
        castShadow={shadowsEnabled}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={10}
        shadow-camera-far={350}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0005}
      />

      {/* Subtle Ambient Bedrock Light */}
      <ambientLight intensity={isNight ? 0.08 : 0.2} color="#cad2c5" />

      {/* Rain Particle Mesh */}
      {rainIntensity > 0.05 && (
        <points
          ref={rainPointsRef}
          geometry={rainGeometry}
          material={rainMaterial}
          position={[0, 0, 0]}
        />
      )}
    </>
  );
};

/**
 * DAMVERSE - Downstream Civilization, Municipalities & Industrial Complex
 * Kampung Hilir (village & water pumping station), Bandar Mahameru (city),
 * and Zon Perindustrian (heavy factories & silos).
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface DownstreamCityProps {
  isBlackout: boolean;
  isFlooding: boolean;
  timeOfDay: number;
  hasWaterFiltration: boolean;
}

export const DownstreamCity: React.FC<DownstreamCityProps> = ({
  isBlackout,
  isFlooding,
  timeOfDay,
  hasWaterFiltration,
}) => {
  const isNight = timeOfDay < 6.5 || timeOfDay > 19.0;

  const materials = useMemo(() => {
    return {
      roadAsphalt: new THREE.MeshStandardMaterial({
        color: '#26292d',
        roughness: 0.9,
        metalness: 0.1,
      }),
      concreteBase: new THREE.MeshStandardMaterial({
        color: '#5a626a',
        roughness: 0.8,
        metalness: 0.1,
      }),
      woodStilt: new THREE.MeshStandardMaterial({
        color: '#8d5b4c',
        roughness: 0.7,
        metalness: 0.05,
      }),
      villageRoof: new THREE.MeshStandardMaterial({
        color: '#a04000',
        roughness: 0.6,
        metalness: 0.15,
      }),
      cityTowerWhite: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.4,
        metalness: 0.3,
      }),
      cityTowerBlue: new THREE.MeshStandardMaterial({
        color: '#3b82f6',
        roughness: 0.35,
        metalness: 0.4,
      }),
      cityTowerDark: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.45,
        metalness: 0.5,
      }),
      windowLit: new THREE.MeshBasicMaterial({
        color: isBlackout ? '#1c1c1c' : isNight ? '#fffae0' : '#88b5dd',
      }),
      industrialSteel: new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.5,
        metalness: 0.65,
      }),
      industrialRed: new THREE.MeshStandardMaterial({
        color: '#dc2626',
        roughness: 0.4,
        metalness: 0.5,
      }),
      siloSteel: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        roughness: 0.3,
        metalness: 0.8,
      }),
      palmFrond: new THREE.MeshStandardMaterial({
        color: '#2d6a4f',
        roughness: 0.85,
        metalness: 0.05,
      }),
      waterPipe: new THREE.MeshStandardMaterial({
        color: '#0284c7',
        roughness: 0.4,
        metalness: 0.7,
      }),
      streetLight: new THREE.MeshBasicMaterial({
        color: isBlackout || !isNight ? '#333333' : '#fef08a',
      }),
    };
  }, [isBlackout, isNight]);

  return (
    <group name="DownstreamCivilization">
      {/* =========================================================================
          1. KAMPUNG HILIR (Village on East Riverbank: X: 25 to 55, Z: -120 to -170)
         ========================================================================= */}
      <group name="KampungHilir" position={[35, 3.2, -145]}>
        {/* Village pier jutting into river */}
        <group position={[-16, -0.4, 0]}>
          <mesh material={materials.woodStilt} castShadow>
            <boxGeometry args={[10, 0.4, 3.2]} />
          </mesh>
          {[-4, 0, 4].map((px, i) => (
            <mesh key={`pier-pile-${i}`} position={[px, -1.2, 0]} material={materials.woodStilt}>
              <cylinderGeometry args={[0.15, 0.15, 2.2, 8]} />
            </mesh>
          ))}
          {/* Small sampan wooden boat */}
          <mesh position={[-3, -0.8, 2.5]} rotation={[0, 0.3, 0]} material={materials.woodStilt}>
            <boxGeometry args={[3.2, 0.6, 1.4]} />
          </mesh>
        </group>

        {/* Traditional Wooden Stilt Houses (4 distinct village homes) */}
        {[
          { x: -5, z: -12, rot: 0.1 },
          { x: 10, z: -15, rot: -0.2 },
          { x: -2, z: 12, rot: 0.3 },
          { x: 14, z: 10, rot: -0.1 },
        ].map((h, i) => (
          <group key={`village-house-${i}`} position={[h.x, 0, h.z]} rotation={[0, h.rot, 0]}>
            {/* Wooden Stilts / Tiang Kayu */}
            {[-2.2, 2.2].map((sx, si) =>
              [-2.2, 2.2].map((sz, szi) => (
                <mesh key={`stilt-${si}-${szi}`} position={[sx, 0.8, sz]} material={materials.woodStilt}>
                  <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
                </mesh>
              ))
            )}
            {/* Wooden Floor Deck */}
            <mesh position={[0, 1.7, 0]} material={materials.woodStilt} castShadow receiveShadow>
              <boxGeometry args={[5.2, 0.3, 5.2]} />
            </mesh>
            {/* House Body (Timber Walls) */}
            <mesh position={[0, 3.1, 0]} material={materials.woodStilt} castShadow>
              <boxGeometry args={[4.6, 2.5, 4.6]} />
            </mesh>
            {/* Pitched Malay Vernacular Roof (Bumbung Limas) */}
            <mesh position={[0, 5.0, 0]} rotation={[0, Math.PI / 4, 0]} material={materials.villageRoof} castShadow>
              <coneGeometry args={[4.2, 2.2, 4]} />
            </mesh>
            {/* Windows with soft night glow */}
            <mesh position={[0, 3.2, 2.32]} material={materials.windowLit}>
              <planeGeometry args={[1.6, 0.9]} />
            </mesh>
          </group>
        ))}

        {/* Municipal Water Pumping Station (Stesen Pam Air Bersih) */}
        <group position={[-14, 0, 18]}>
          <mesh material={materials.concreteBase} castShadow receiveShadow>
            <boxGeometry args={[8, 3.6, 6]} />
          </mesh>
          {/* Water Intake Suction Pipes going into river */}
          <mesh position={[-4.5, 0.8, 0]} rotation={[0, 0, Math.PI * 0.45]} material={materials.waterPipe}>
            <cylinderGeometry args={[0.4, 0.4, 7, 12]} />
          </mesh>
          {/* Filtration Tanks (if upgraded) */}
          {hasWaterFiltration && (
            <group position={[5.5, 1.2, 0]}>
              {[-1.5, 1.5].map((fx, fi) => (
                <mesh key={`filter-${fi}`} position={[fx, 0, 0]} material={materials.siloSteel} castShadow>
                  <cylinderGeometry args={[1.2, 1.2, 3.2, 16]} />
                </mesh>
              ))}
            </group>
          )}
        </group>

        {/* Tropical Coconut Palms */}
        {[
          { x: -8, z: -4 },
          { x: 18, z: -2 },
          { x: 5, z: 22 },
          { x: -12, z: 8 },
        ].map((tree, ti) => (
          <group key={`palm-${ti}`} position={[tree.x, 0, tree.z]}>
            <mesh position={[0, 3.5, 0]} rotation={[0.08, 0, 0.05]} material={materials.woodStilt}>
              <cylinderGeometry args={[0.2, 0.35, 7.0, 8]} />
            </mesh>
            <mesh position={[0, 7.0, 0]} material={materials.palmFrond} castShadow>
              <sphereGeometry args={[1.8, 8, 8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* =========================================================================
          2. BANDAR MAHAMERU (Downstream Modern City: X: -60 to -130, Z: -160 to -260)
         ========================================================================= */}
      <group name="BandarMahameru" position={[-90, 3.5, -210]}>
        {/* Main Paved Boulevard */}
        <mesh position={[0, 0.05, 0]} material={materials.roadAsphalt} receiveShadow>
          <boxGeometry args={[75, 0.1, 85]} />
        </mesh>

        {/* City Skylines & Skyscrapers */}
        {[
          // Civic City Hall Tower
          { x: 0, z: -15, w: 14, d: 14, h: 38, mat: materials.cityTowerBlue },
          // Financial Tower 1
          { x: -22, z: -20, w: 12, d: 12, h: 48, mat: materials.cityTowerWhite },
          // Financial Tower 2
          { x: 22, z: -22, w: 12, d: 12, h: 42, mat: materials.cityTowerDark },
          // Apartment Complex A
          { x: -20, z: 18, w: 16, d: 10, h: 28, mat: materials.cityTowerWhite },
          // Apartment Complex B
          { x: 20, z: 18, w: 16, d: 10, h: 26, mat: materials.cityTowerWhite },
          // Central Hospital with Rooftop Helipad
          { x: 0, z: 25, w: 18, d: 12, h: 22, mat: materials.cityTowerWhite },
        ].map((b, bi) => (
          <group key={`bldg-${bi}`} position={[b.x, b.h / 2, b.z]}>
            {/* Primary silhouette */}
            <mesh material={b.mat} castShadow receiveShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
            </mesh>
            {/* Glowing window arrays */}
            {[-0.35, 0, 0.35].map((offZ, zi) =>
              [-0.35, 0, 0.35].map((offY, yi) => (
                <mesh
                  key={`win-${zi}-${yi}`}
                  position={[b.w / 2 + 0.05, offY * (b.h * 0.7), offZ * (b.d * 0.7)]}
                  material={materials.windowLit}
                >
                  <planeGeometry args={[0.8, 1.6]} />
                </mesh>
              ))
            )}
            {/* Rooftop mechanical penthouse & antenna */}
            <mesh position={[0, b.h / 2 + 1.5, 0]} material={materials.concreteBase}>
              <boxGeometry args={[b.w * 0.4, 3, b.d * 0.4]} />
            </mesh>
            <mesh position={[0, b.h / 2 + 4.5, 0]} material={materials.industrialSteel}>
              <cylinderGeometry args={[0.08, 0.12, 4.0, 8]} />
            </mesh>
          </group>
        ))}

        {/* City Substation & Transformer Yard (Pencawang Masuk Utama Bandar) */}
        <group position={[28, 0.5, 32]}>
          <mesh material={materials.concreteBase} receiveShadow>
            <boxGeometry args={[14, 0.4, 12]} />
          </mesh>
          {[-3.5, 3.5].map((tx, ti) => (
            <mesh key={`sub-trans-${ti}`} position={[tx, 1.2, 0]} material={materials.industrialSteel} castShadow>
              <boxGeometry args={[3.2, 2.4, 2.8]} />
            </mesh>
          ))}
        </group>

        {/* Streetlight Avenues */}
        {[-30, -10, 10, 30].map((lx, li) => (
          <group key={`city-light-${li}`} position={[lx, 0, -38]}>
            <mesh position={[0, 3.5, 0]} material={materials.industrialSteel}>
              <cylinderGeometry args={[0.1, 0.15, 7.0, 8]} />
            </mesh>
            <mesh position={[0, 7.0, 0]} material={materials.streetLight}>
              <sphereGeometry args={[0.3, 10, 10]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* =========================================================================
          3. ZON PERINDUSTRIAN (Industrial Park: X: 60 to 120, Z: -210 to -280)
         ========================================================================= */}
      <group name="ZonPerindustrian" position={[85, 3.2, -240]}>
        {/* Concrete industrial apron */}
        <mesh position={[0, 0.05, 0]} material={materials.roadAsphalt} receiveShadow>
          <boxGeometry args={[65, 0.1, 75]} />
        </mesh>

        {/* Heavy Steel Rolling Mill / Factory 1 */}
        <group position={[-14, 6, -15]}>
          <mesh material={materials.industrialSteel} castShadow receiveShadow>
            <boxGeometry args={[26, 12, 18]} />
          </mesh>
          {/* Saw-tooth roof skylights */}
          {[-8, 0, 8].map((sx, si) => (
            <mesh key={`saw-${si}`} position={[sx, 7.0, 0]} rotation={[0, 0, 0.35]} material={materials.industrialRed}>
              <boxGeometry args={[6, 2.0, 17]} />
            </mesh>
          ))}
          {/* Tall Chimney Exhaust Stacks */}
          <mesh position={[10, 11, -6]} material={materials.industrialRed} castShadow>
            <cylinderGeometry args={[0.9, 1.3, 16, 16]} />
          </mesh>
          <mesh position={[10, 11, 4]} material={materials.industrialRed} castShadow>
            <cylinderGeometry args={[0.9, 1.3, 16, 16]} />
          </mesh>
        </group>

        {/* Chemical Processing & Water Silo Storage Facility */}
        <group position={[18, 0, -12]}>
          {[-6, 0, 6].map((sx, si) => (
            <group key={`silo-${si}`} position={[sx, 6.5, 0]}>
              <mesh material={materials.siloSteel} castShadow>
                <cylinderGeometry args={[2.5, 2.5, 13, 20]} />
              </mesh>
              {/* Domed Silo Top */}
              <mesh position={[0, 6.5, 0]} material={materials.siloSteel}>
                <sphereGeometry args={[2.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Warehouse Depot & Shipping Containers */}
        <group position={[0, 2.5, 18]}>
          <mesh material={materials.industrialSteel} castShadow receiveShadow>
            <boxGeometry args={[32, 5, 14]} />
          </mesh>
          {/* Stapped freight containers */}
          {[-12, -4, 4, 12].map((cx, ci) => (
            <mesh key={`cont-${ci}`} position={[cx, -0.8, 10]} material={materials.industrialRed} castShadow>
              <boxGeometry args={[4.5, 2.4, 2.4]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

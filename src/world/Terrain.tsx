/**
 * DAMVERSE - Procedural Terrain, Canyon Ridge & Forest Canopy
 * Mountain gorges flanking the dam, canyon slopes, valley riverbed, and evergreen pine forests.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { sampleElevation } from './terrainHeight';

export const Terrain: React.FC = () => {
  // Generate mountain terrain geometry with elevation function
  const { terrainGeometry, treePositions } = useMemo(() => {
    const width = 360;
    const depth = 580;
    const segmentsX = 72;
    const segmentsZ = 116;

    const geom = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    const trees: [number, number, number][] = [];

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);

      // Offset Z so center is near dam (Z=0), extending to Z=+250 upstream and Z=-330 downstream
      const worldZ = vz - 40;
      pos.setZ(i, worldZ);

      // Compute elevation
      const elevation = sampleElevation(vx, worldZ);
      pos.setY(i, elevation);

      // Place procedural trees along mountain slopes away from roads and water
      if (
        Math.random() < 0.08 &&
        elevation > 12.0 &&
        elevation < 65.0 &&
        Math.abs(vx) > 30 &&
        !(Math.abs(worldZ) < 8 && Math.abs(vx) < 55)
      ) {
        trees.push([vx, elevation, worldZ]);
      }
    }

    geom.computeVertexNormals();
    return { terrainGeometry: geom, treePositions: trees.slice(0, 180) };
  }, []);

  const materials = useMemo(() => {
    return {
      mountainGrass: new THREE.MeshStandardMaterial({
        color: '#2d4739', // Rich alpine forest green
        roughness: 0.9,
        metalness: 0.05,
        flatShading: true,
      }),
      rockGranite: new THREE.MeshStandardMaterial({
        color: '#4a5568',
        roughness: 0.95,
        metalness: 0.1,
      }),
      treeTrunk: new THREE.MeshStandardMaterial({
        color: '#4a3525',
        roughness: 0.85,
        metalness: 0.05,
      }),
      treeFoliage: new THREE.MeshStandardMaterial({
        color: '#1b4332',
        roughness: 0.8,
        metalness: 0.05,
      }),
    };
  }, []);

  return (
    <group name="Terrain">
      {/* 1. Main Continuous Mountain & Canyon Terrain */}
      <mesh geometry={terrainGeometry} material={materials.mountainGrass} receiveShadow />

      {/* 2. Procedural Mountain Forest Pine Trees */}
      {treePositions.map((tp, idx) => (
        <group key={`tree-${idx}`} position={tp}>
          {/* Trunk */}
          <mesh position={[0, 1.8, 0]} material={materials.treeTrunk} castShadow>
            <cylinderGeometry args={[0.2, 0.35, 3.6, 6]} />
          </mesh>
          {/* Conical Pine Canopy Tiers */}
          <mesh position={[0, 4.2, 0]} material={materials.treeFoliage} castShadow>
            <coneGeometry args={[2.2, 3.2, 6]} />
          </mesh>
          <mesh position={[0, 6.2, 0]} material={materials.treeFoliage} castShadow>
            <coneGeometry args={[1.6, 2.8, 6]} />
          </mesh>
          <mesh position={[0, 7.8, 0]} material={materials.treeFoliage} castShadow>
            <coneGeometry args={[1.0, 2.2, 6]} />
          </mesh>
        </group>
      ))}

      {/* 3. Canyon Rock Outcrops on Dam Abutments */}
      {[-56, 56].map((rx, ri) => (
        <group key={`rock-abutment-${ri}`} position={[rx, 22, 0]}>
          <mesh material={materials.rockGranite} castShadow receiveShadow>
            <dodecahedronGeometry args={[10, 1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

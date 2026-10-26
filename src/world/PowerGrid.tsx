/**
 * DAMVERSE - High-Voltage Electrical Power Grid & Transmission Towers
 * Steel lattice pylons and 3-phase catenary power lines connecting the dam powerhouse
 * to Bandar Mahameru and the Industrial Complex.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TowerConfig {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

const TOWER_COORDS: TowerConfig[] = [
  { x: 35, y: 4.0, z: -35, rotY: 0.1 },
  { x: 42, y: 16.0, z: -80, rotY: 0.2 },
  { x: 48, y: 18.0, z: -135, rotY: 0.15 },
  { x: 10, y: 10.0, z: -175, rotY: -0.4 },
  { x: -62, y: 4.0, z: -208, rotY: -0.6 }, // To Bandar Mahameru
  { x: 75, y: 4.0, z: -225, rotY: 0.3 }, // To Industrial Park
];

export const PowerGrid: React.FC = () => {
  const materials = useMemo(() => {
    return {
      galvanizedSteel: new THREE.MeshStandardMaterial({
        color: '#64748b',
        roughness: 0.45,
        metalness: 0.8,
      }),
      insulatorGlass: new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        roughness: 0.2,
        metalness: 0.1,
      }),
      cableLine: new THREE.LineBasicMaterial({
        color: '#1e293b',
        linewidth: 2,
      }),
    };
  }, []);

  // Generate catenary wire lines between towers
  const cableGeometries = useMemo(() => {
    const lines: THREE.BufferGeometry[] = [];
    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4], // Path to city
      [2, 5], // Path to industrial
    ];

    connections.forEach(([fromIdx, toIdx]) => {
      const from = TOWER_COORDS[fromIdx];
      const to = TOWER_COORDS[toIdx];

      // 3 phases (left, center, right phase wires)
      [-1.8, 0, 1.8].forEach((phaseOffset) => {
        const points: THREE.Vector3[] = [];
        const segments = 12;
        const startY = from.y + 19.5;
        const endY = to.y + 19.5;

        for (let s = 0; s <= segments; s++) {
          const t = s / segments;
          const x = THREE.MathUtils.lerp(from.x + phaseOffset, to.x + phaseOffset, t);
          const z = THREE.MathUtils.lerp(from.z, to.z, t);
          // Catenary sag equation: 4 * sag * t * (1 - t)
          const baseH = THREE.MathUtils.lerp(startY, endY, t);
          const sag = Math.sin(t * Math.PI) * 2.5;
          points.push(new THREE.Vector3(x, baseH - sag, z));
        }

        const geom = new THREE.BufferGeometry().setFromPoints(points);
        lines.push(geom);
      });
    });

    return lines;
  }, []);

  return (
    <group name="PowerGrid">
      {/* 1. Steel Lattice Transmission Pylons */}
      {TOWER_COORDS.map((tower, idx) => (
        <group key={`pylon-${idx}`} position={[tower.x, tower.y, tower.z]} rotation={[0, tower.rotY, 0]}>
          {/* Base Lattice Mast (4 corner tapered posts) */}
          {[-1.2, 1.2].map((lx, lxi) =>
            [-1.2, 1.2].map((lz, lzi) => (
              <mesh key={`post-${lxi}-${lzi}`} position={[lx, 8, lz]} material={materials.galvanizedSteel}>
                <cylinderGeometry args={[0.08, 0.14, 16, 6]} />
              </mesh>
            ))
          )}

          {/* Diagonal Bracing Struts */}
          {[3, 7, 11, 14].map((by, bi) => (
            <mesh key={`brace-${bi}`} position={[0, by, 0]} material={materials.galvanizedSteel}>
              <boxGeometry args={[2.2, 0.12, 2.2]} />
            </mesh>
          ))}

          {/* Upper Crossarm (Holding 3 high-voltage conductor strings) */}
          <group position={[0, 18.5, 0]}>
            <mesh material={materials.galvanizedSteel} castShadow>
              <boxGeometry args={[6.8, 0.4, 0.8]} />
            </mesh>
            {/* Hanging Ceramic/Glass Insulator Strings */}
            {[-2.8, 0, 2.8].map((ix, ii) => (
              <mesh key={`insulator-${ii}`} position={[ix, -1.0, 0]} material={materials.insulatorGlass}>
                <cylinderGeometry args={[0.12, 0.12, 1.6, 8]} />
              </mesh>
            ))}
          </group>

          {/* Tower Top Shield Wire Peak */}
          <mesh position={[0, 21.0, 0]} material={materials.galvanizedSteel}>
            <cylinderGeometry args={[0.04, 0.1, 4.0, 6]} />
          </mesh>
        </group>
      ))}

      {/* 2. Catenary Conductor Power Lines */}
      {cableGeometries.map((geom, gi) => (
        // eslint-disable-next-line react/no-unknown-property
        <primitive key={`cable-${gi}`} object={new THREE.Line(geom, materials.cableLine)} />
      ))}
    </group>
  );
};

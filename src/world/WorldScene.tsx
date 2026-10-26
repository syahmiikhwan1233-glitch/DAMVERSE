/**
 * DAMVERSE - Master 3D World Scene Container
 * Integrates procedural terrain, dam structure, powerhouse, dynamic water,
 * downstream city, power grid, player kinematics, and environment lighting.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { DamSimulationState, PlayerState, GameSettings } from '../types/game';
import { EnvironmentLighting } from './EnvironmentLighting';
import { Terrain } from './Terrain';
import { DamStructure } from './DamStructure';
import { Powerhouse } from './Powerhouse';
import { WaterSystem } from './WaterSystem';
import { DownstreamCity } from './DownstreamCity';
import { PowerGrid } from './PowerGrid';
import { PlayerCharacter } from './PlayerCharacter';
import { Vehicle } from './Vehicle';
import { CameraController } from './CameraController';

interface WorldSceneProps {
  sim: DamSimulationState;
  player: PlayerState;
  settings: GameSettings;
  updatePlayerMovement: (deltaPos: [number, number, number], rotY: number, moving: boolean, running: boolean) => void;
  enterOrExitVehicle: () => void;
  mobileInputRef: React.MutableRefObject<{
    moveX: number;
    moveY: number;
    lookX: number;
    lookY: number;
    isSprint: boolean;
    isJump: boolean;
    isAction: boolean;
  }>;
}

export const WorldScene: React.FC<WorldSceneProps> = ({
  sim,
  player,
  settings,
  updatePlayerMovement,
  enterOrExitVehicle,
  mobileInputRef,
}) => {
  // Software WebGL check
  const isSoftwareGl = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return false;
    }
  }, []);

  const hasSolarFarm = sim.upgrades.solarFarm?.built ?? false;
  const hasBessBattery = sim.upgrades.bessBattery?.built ?? false;
  const hasReinforcedSpillway = sim.upgrades.reinforcedSpillway?.built ?? false;
  const hasEcoTourism = sim.upgrades.ecoTourismDeck?.built ?? false;
  const hasWaterFiltration = sim.upgrades.waterFiltrationPlant?.built ?? false;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
      <Canvas
        shadows={settings.shadows && !isSoftwareGl}
        gl={{
          antialias: !isSoftwareGl && settings.graphicsQuality !== 'rendah',
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ position: [0, 36, 16], fov: 60, near: 0.2, far: 800 }}
      >
        {/* Dynamic Sky, Sun, Fog & Rain */}
        <EnvironmentLighting
          timeOfDay={sim.timeOfDay}
          weather={sim.weather}
          rainIntensity={sim.rainIntensity}
          shadowsEnabled={settings.shadows && !isSoftwareGl}
        />

        {/* Third-Person Camera & Kinematic Controller */}
        <CameraController
          player={player}
          updatePlayerMovement={updatePlayerMovement}
          enterOrExitVehicle={enterOrExitVehicle}
          mobileInputRef={mobileInputRef}
        />

        {/* Procedural Terrain & Mountain Ranges */}
        <Terrain />

        {/* Hydroelectric Dam & Radial Gates */}
        <DamStructure
          spillwayGates={sim.spillwayGates}
          hasEcoTourism={hasEcoTourism}
          hasReinforcedSpillway={hasReinforcedSpillway}
        />

        {/* Powerhouse & 4 Francis Turbines */}
        <Powerhouse
          turbines={sim.turbines}
          hasBessBattery={hasBessBattery}
          batteryStorageMWh={sim.batteryStorageMWh}
        />

        {/* Dynamic Water Reservoir, River & Flood Plain */}
        <WaterSystem
          reservoirLevel={sim.reservoirLevel}
          spillwayGates={sim.spillwayGates}
          downstreamLevel={sim.downstreamLevel}
          isFlooding={sim.isFloodingDownstream}
          hasSolarFarm={hasSolarFarm}
          solarGenerationMW={sim.solarGenerationMW}
        />

        {/* Downstream Village, City & Industrial Park */}
        <DownstreamCity
          isBlackout={sim.isBlackout}
          isFlooding={sim.isFloodingDownstream}
          timeOfDay={sim.timeOfDay}
          hasWaterFiltration={hasWaterFiltration}
        />

        {/* High-Voltage Grid & Transmission Lines */}
        <PowerGrid />

        {/* 3D Character & Off-Road Vehicle */}
        <PlayerCharacter player={player} />
        <Vehicle player={player} />
      </Canvas>
    </div>
  );
};

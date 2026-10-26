/**
 * DAMVERSE - Unified Game Store & Simulation Engine Hook
 * Coordinates all hydrodynamic, electrical, economic, and player states.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DamSimulationState,
  PlayerState,
  GameSettings,
  UpgradeItem,
  ResearchNode,
} from '../types/game';
import {
  DEFAULT_INITIAL_STATE,
  DEFAULT_SETTINGS,
  loadGameState,
  saveGameState,
  resetGameState,
  loadSettings,
  saveSettings,
} from '../storage/saveSystem';
import { stepWaterSimulation } from '../simulation/waterSimulation';
import { stepPowerSimulation } from '../simulation/powerSimulation';
import { stepEconomySimulation } from '../simulation/economySimulation';
import { stepWeatherSystem } from '../simulation/weatherSystem';
import { sound } from '../audio/soundEngine';

export interface UseGameReturn {
  sim: DamSimulationState;
  player: PlayerState;
  settings: GameSettings;
  isPaused: boolean;
  activeModal: string | null;
  // Controls
  setSpillwayOpening: (gateId: number, percent: number) => void;
  toggleTurbine: (turbineId: number) => void;
  setTurbineThrottle: (turbineId: number, percent: number) => void;
  repairTurbine: (turbineId: number) => void;
  toggleScadaAuto: () => void;
  buildUpgrade: (upgradeId: string) => void;
  startResearch: (techId: string) => void;
  toggleContract: (contractId: string) => void;
  claimMission: (missionId: string) => void;
  setTimeSpeed: (speed: number) => void;
  setWeather: (weather: DamSimulationState['weather']) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  togglePause: () => void;
  openModal: (modal: string | null) => void;
  enterOrExitVehicle: () => void;
  saveGameNow: () => boolean;
  resetGameNow: () => void;
  updatePlayerMovement: (deltaPos: [number, number, number], rotY: number, moving: boolean, running: boolean) => void;
}

export function useGameStore(): UseGameReturn {
  const [sim, setSim] = useState<DamSimulationState>(() => loadGameState());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Player & Vehicle state
  const [player, setPlayer] = useState<PlayerState>({
    position: [0, 31.0, 4.0], // On top of dam crest roadway
    rotationY: 0,
    isMoving: false,
    isRunning: false,
    isJumping: false,
    inVehicle: false,
    vehiclePosition: [12, 31.0, 5.0], // Parked pickup truck on dam road
    vehicleRotationY: Math.PI / 2,
    vehicleSpeed: 0,
    nearVehicle: false,
    nearControlRoom: false,
    nearTurbineFloor: false,
  });

  const simRef = useRef<DamSimulationState>(sim);
  simRef.current = sim;

  const playerRef = useRef<PlayerState>(player);
  playerRef.current = player;

  const isPausedRef = useRef<boolean>(isPaused);
  isPausedRef.current = isPaused;

  // Auto-save interval (every 30 seconds)
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      saveGameState(simRef.current);
    }, 30000);
    return () => clearInterval(autoSaveTimer);
  }, []);

  // Main simulation tick loop (independent of React renders)
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent physics explosion

      if (!isPausedRef.current && dt > 0) {
        const cur = simRef.current;
        const hasSolarFarm = cur.upgrades.solarFarm?.built ?? false;
        const hasBessBattery = cur.upgrades.bessBattery?.built ?? false;
        const hasReinforcedSpillway = cur.upgrades.reinforcedSpillway?.built ?? false;
        const hasEcoTourism = cur.upgrades.ecoTourismDeck?.built ?? false;
        const hasWaterFiltration = cur.upgrades.waterFiltrationPlant?.built ?? false;
        const hasCeramicBlades = cur.research.ceramicCoating?.completed ?? false;

        // Step 1: Weather & Inflow
        const weatherUpdates = stepWeatherSystem(cur, dt);
        const intermediate1 = { ...cur, ...weatherUpdates };

        // Step 2: Hydrodynamics & Reservoir
        const waterUpdates = stepWaterSimulation(intermediate1, dt, hasReinforcedSpillway);
        const intermediate2 = { ...intermediate1, ...waterUpdates };

        // Step 3: Power Generation & Grid
        const powerUpdates = stepPowerSimulation(
          intermediate2,
          dt,
          hasSolarFarm,
          hasBessBattery,
          hasCeramicBlades
        );
        const intermediate3 = { ...intermediate2, ...powerUpdates };

        // Step 4: Economy & Civilization
        const economyUpdates = stepEconomySimulation(
          intermediate3,
          dt,
          hasEcoTourism,
          hasWaterFiltration
        );

        // Step 5: Research advancement
        let updatedResearch = { ...cur.research };
        let researchCompletedAlert: string | null = null;
        Object.entries(updatedResearch).forEach(([key, node]) => {
          if (node.isResearching && !node.completed) {
            const addedProgress = (dt / node.researchTimeSeconds) * 100;
            const newProgress = Math.min(100, node.progressPercent + addedProgress);
            const isFinished = newProgress >= 100;
            if (isFinished) {
              researchCompletedAlert = `Penyelidikan Selesai: ${node.name}!`;
              sound.playSuccess();
            }
            updatedResearch[key] = {
              ...node,
              progressPercent: Math.round(newProgress * 10) / 10,
              completed: isFinished,
              isResearching: !isFinished,
            };
          }
        });

        // Step 6: Missions progress check
        const updatedMissions = cur.missions.map((m) => {
          if (m.completed) return m;
          let val = m.currentValue;
          let done = false;
          if (m.targetType === 'power') {
            val = intermediate3.totalGenerationMW;
            done = val >= m.targetValue;
          } else if (m.targetType === 'water_level') {
            val = intermediate2.reservoirLevel;
            done = val < m.targetValue;
          } else if (m.targetType === 'funds') {
            val = economyUpdates.funds ?? cur.funds;
            done = val >= m.targetValue;
          } else if (m.targetType === 'upgrade') {
            val = hasSolarFarm ? 1 : 0;
            done = val >= m.targetValue;
          } else if (m.targetType === 'contract') {
            const contract = cur.contracts.find((c) => c.id === 'tnb_main');
            val = contract ? Math.round(contract.fulfilledSeconds) : 0;
            done = val >= m.targetValue;
          }
          if (done && !m.completed) {
            sound.playSuccess();
          }
          return { ...m, currentValue: val, completed: done };
        });

        // Update sound engine parameters
        sound.updateWaterSound(intermediate2.totalSpillwayFlow);
        const activeTurbineCount = intermediate3.turbines.filter((t) => t.active).length;
        sound.updateTurbineSound(activeTurbineCount, intermediate3.totalGenerationMW);
        sound.updateVehicleSound(playerRef.current.inVehicle, playerRef.current.vehicleSpeed);

        // Update state
        const nextState: DamSimulationState = {
          ...intermediate3,
          ...economyUpdates,
          research: updatedResearch,
          missions: updatedMissions,
        };

        if (researchCompletedAlert) {
          nextState.alerts = [
            {
              id: String(Date.now()),
              timestamp: `${Math.floor(nextState.timeOfDay)}:${Math.floor((nextState.timeOfDay % 1) * 60).toString().padStart(2, '0')}`,
              severity: 'info',
              message: researchCompletedAlert,
            },
            ...nextState.alerts.slice(0, 15),
          ];
        }

        // Trigger alarm if flood or overtopping occurs
        if (nextState.isFloodingDownstream && !cur.isFloodingDownstream) {
          sound.playAlarm();
        }

        simRef.current = nextState;
        setSim(nextState);
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Controls API
  const setSpillwayOpening = useCallback((gateId: number, percent: number) => {
    sound.playGateAdjust();
    setSim((prev) => {
      const updated = prev.spillwayGates.map((g) =>
        g.id === gateId ? { ...g, openingPercent: Math.max(0, Math.min(100, percent)) } : g
      );
      return { ...prev, spillwayGates: updated };
    });
  }, []);

  const toggleTurbine = useCallback((turbineId: number) => {
    sound.playClick();
    setSim((prev) => {
      const updated = prev.turbines.map((t) =>
        t.id === turbineId ? { ...t, active: !t.active, throttlePercent: !t.active ? 85 : 0 } : t
      );
      return { ...prev, turbines: updated };
    });
  }, []);

  const setTurbineThrottle = useCallback((turbineId: number, percent: number) => {
    sound.playClick();
    setSim((prev) => {
      const updated = prev.turbines.map((t) =>
        t.id === turbineId ? { ...t, throttlePercent: Math.max(0, Math.min(100, percent)) } : t
      );
      return { ...prev, turbines: updated };
    });
  }, []);

  const repairTurbine = useCallback((turbineId: number) => {
    sound.playSuccess();
    setSim((prev) => {
      const repairCost = 15000;
      if (prev.funds < repairCost) return prev;
      const updated = prev.turbines.map((t) =>
        t.id === turbineId ? { ...t, wearPercent: 0 } : t
      );
      return { ...prev, funds: prev.funds - repairCost, turbines: updated };
    });
  }, []);

  const toggleScadaAuto = useCallback(() => {
    sound.playClick();
    setSim((prev) => ({ ...prev, scadaAutoBalancing: !prev.scadaAutoBalancing }));
  }, []);

  const buildUpgrade = useCallback((upgradeId: string) => {
    sound.playClick();
    setSim((prev) => {
      const item: UpgradeItem | undefined = prev.upgrades[upgradeId];
      if (!item || item.built || prev.funds < item.cost) return prev;
      sound.playSuccess();
      const updatedUpgrades = {
        ...prev.upgrades,
        [upgradeId]: { ...item, built: true },
      };
      let batteryCap = prev.batteryCapacityMWh;
      if (upgradeId === 'bessBattery') {
        batteryCap = 50;
      }
      return {
        ...prev,
        funds: prev.funds - item.cost,
        batteryCapacityMWh: batteryCap,
        upgrades: updatedUpgrades,
      };
    });
  }, []);

  const startResearch = useCallback((techId: string) => {
    sound.playClick();
    setSim((prev) => {
      const node: ResearchNode | undefined = prev.research[techId];
      if (!node || node.completed || node.isResearching || prev.funds < node.cost) return prev;
      // Check requirement
      if (node.requiredTechId && !prev.research[node.requiredTechId]?.completed) {
        return prev;
      }
      const updatedResearch = {
        ...prev.research,
        [techId]: { ...node, isResearching: true },
      };
      return {
        ...prev,
        funds: prev.funds - node.cost,
        research: updatedResearch,
      };
    });
  }, []);

  const toggleContract = useCallback((contractId: string) => {
    sound.playClick();
    setSim((prev) => {
      const updated = prev.contracts.map((c) =>
        c.id === contractId ? { ...c, active: !c.active } : c
      );
      return { ...prev, contracts: updated };
    });
  }, []);

  const claimMission = useCallback((missionId: string) => {
    sound.playSuccess();
    setSim((prev) => {
      const m = prev.missions.find((item) => item.id === missionId);
      if (!m || !m.completed || m.claimed) return prev;
      const updatedMissions = prev.missions.map((item) =>
        item.id === missionId ? { ...item, claimed: true } : item
      );
      return {
        ...prev,
        funds: prev.funds + m.rewardRM,
        missions: updatedMissions,
      };
    });
  }, []);

  const setTimeSpeed = useCallback((speed: number) => {
    sound.playClick();
    setSim((prev) => ({ ...prev, timeSpeed: speed }));
  }, []);

  const setWeather = useCallback((weather: DamSimulationState['weather']) => {
    sound.playClick();
    setSim((prev) => ({ ...prev, weather, weatherDuration: 180 }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    sound.playClick();
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      saveSettings(next);
      if (newSettings.soundEnabled !== undefined) {
        if (!newSettings.soundEnabled) sound.toggleMute();
      }
      if (newSettings.masterVolume !== undefined) {
        sound.setVolume(newSettings.masterVolume);
      }
      return next;
    });
  }, []);

  const togglePause = useCallback(() => {
    sound.playClick();
    setIsPaused((prev) => !prev);
  }, []);

  const openModal = useCallback((modal: string | null) => {
    sound.playClick();
    setActiveModal(modal);
  }, []);

  const enterOrExitVehicle = useCallback(() => {
    sound.playClick();
    setPlayer((prev) => {
      const nextInVehicle = !prev.inVehicle;
      if (nextInVehicle) {
        // Player enters vehicle
        return {
          ...prev,
          inVehicle: true,
          position: [prev.vehiclePosition[0], prev.vehiclePosition[1] + 1, prev.vehiclePosition[2]],
        };
      } else {
        // Player exits vehicle next to it
        return {
          ...prev,
          inVehicle: false,
          vehicleSpeed: 0,
          position: [prev.vehiclePosition[0] + 2.5, prev.vehiclePosition[1], prev.vehiclePosition[2]],
        };
      }
    });
  }, []);

  const saveGameNow = useCallback((): boolean => {
    sound.playSuccess();
    return saveGameState(simRef.current);
  }, []);

  const resetGameNow = useCallback(() => {
    sound.playClick();
    const fresh = resetGameState();
    simRef.current = fresh;
    setSim(fresh);
    setPlayer({
      position: [0, 31.0, 4.0],
      rotationY: 0,
      isMoving: false,
      isRunning: false,
      isJumping: false,
      inVehicle: false,
      vehiclePosition: [12, 31.0, 5.0],
      vehicleRotationY: Math.PI / 2,
      vehicleSpeed: 0,
      nearVehicle: false,
      nearControlRoom: false,
      nearTurbineFloor: false,
    });
    setIsPaused(false);
    setActiveModal(null);
  }, []);

  const updatePlayerMovement = useCallback(
    (deltaPos: [number, number, number], rotY: number, moving: boolean, running: boolean) => {
      setPlayer((prev) => {
        if (prev.inVehicle) {
          // Update vehicle coordinates
          const newVehPos: [number, number, number] = [
            prev.vehiclePosition[0] + deltaPos[0],
            prev.vehiclePosition[1] + deltaPos[1],
            prev.vehiclePosition[2] + deltaPos[2],
          ];
          const speed = Math.sqrt(deltaPos[0] * deltaPos[0] + deltaPos[2] * deltaPos[2]) * 60;
          return {
            ...prev,
            vehiclePosition: newVehPos,
            vehicleRotationY: rotY,
            vehicleSpeed: speed,
            position: newVehPos,
            rotationY: rotY,
            isMoving: moving,
            isRunning: running,
          };
        } else {
          const newPos: [number, number, number] = [
            prev.position[0] + deltaPos[0],
            prev.position[1] + deltaPos[1],
            prev.position[2] + deltaPos[2],
          ];
          // Check proximity to vehicle
          const distToVeh = Math.hypot(
            newPos[0] - prev.vehiclePosition[0],
            newPos[2] - prev.vehiclePosition[2]
          );
          const nearVehicle = distToVeh < 4.0;
          const nearControlRoom = Math.hypot(newPos[0] - (-18), newPos[2] - 4) < 6.0;
          const nearTurbineFloor = Math.hypot(newPos[0] - 0, newPos[2] - (-25)) < 12.0;

          return {
            ...prev,
            position: newPos,
            rotationY: rotY,
            isMoving: moving,
            isRunning: running,
            nearVehicle,
            nearControlRoom,
            nearTurbineFloor,
          };
        }
      });
    },
    []
  );

  return {
    sim,
    player,
    settings,
    isPaused,
    activeModal,
    setSpillwayOpening,
    toggleTurbine,
    setTurbineThrottle,
    repairTurbine,
    toggleScadaAuto,
    buildUpgrade,
    startResearch,
    toggleContract,
    claimMission,
    setTimeSpeed,
    setWeather,
    updateSettings,
    togglePause,
    openModal,
    enterOrExitVehicle,
    saveGameNow,
    resetGameNow,
    updatePlayerMovement,
  };
}

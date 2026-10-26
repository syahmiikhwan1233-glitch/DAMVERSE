/**
 * DAMVERSE - Water Reservoir & Hydrodynamic Simulation
 * Calculates reservoir volume, hydraulic head, spillway discharge, and downstream river levels.
 */

import { DamSimulationState } from '../types/game';

// Realistic parameters for an 80m high concrete gravity-arch dam
const MIN_WATER_LEVEL = 12.0; // meters (dead storage level)
const MAX_WATER_LEVEL = 30.0; // meters (dam crest height)
const DANGER_WATER_LEVEL = 28.5; // spillway critical threshold
const MAX_STORAGE_VOLUME = 120_000_000; // 120 million m³
const SAFE_DOWNSTREAM_FLOW = 850; // m³/s (river banks safe limit)
const FLOOD_DISASTER_FLOW = 1200; // m³/s (floods downstream villages)

/**
 * Calculates current hydraulic head from reservoir water level relative to powerhouse tailrace.
 */
export function calculateHead(reservoirLevel: number): number {
  return Math.max(0, reservoirLevel - 4.0); // Powerhouse tailrace is at Y=4m
}

/**
 * Converts water volume to reservoir level height (approximating a V-shaped mountain valley).
 */
export function volumeToLevel(volumeM3: number): number {
  const fraction = Math.max(0, Math.min(1.2, volumeM3 / MAX_STORAGE_VOLUME));
  // V = k * H^2.2 => H = H_max * (V / V_max)^(1 / 2.2)
  const normalizedLevel = Math.pow(fraction, 1 / 2.2);
  return MIN_WATER_LEVEL + normalizedLevel * (MAX_WATER_LEVEL - MIN_WATER_LEVEL);
}

/**
 * Converts level back to volume.
 */
export function levelToVolume(level: number): number {
  const fraction = Math.max(0, Math.min(1.2, (level - MIN_WATER_LEVEL) / (MAX_WATER_LEVEL - MIN_WATER_LEVEL)));
  return Math.pow(fraction, 2.2) * MAX_STORAGE_VOLUME;
}

/**
 * Calculates spillway discharge flow through radial gates.
 * Q = C * L * H^(3/2) * (opening / 100)
 */
export function calculateGateFlow(openingPercent: number, reservoirLevel: number, isReinforced: boolean): number {
  if (openingPercent <= 0) return 0;
  // Spillway crest is at 20.0 meters
  const spillwayCrest = 20.0;
  if (reservoirLevel < spillwayCrest) {
    // Submerged low-level sluice flow
    return (openingPercent / 100) * 15 * Math.sqrt(Math.max(0.1, reservoirLevel - MIN_WATER_LEVEL));
  }
  const headOverCrest = Math.max(0, reservoirLevel - spillwayCrest);
  const dischargeCoeff = isReinforced ? 18.5 : 15.0; // Reinforced spillway chute increases throughput
  const maxFlowForGate = dischargeCoeff * Math.pow(headOverCrest + 0.5, 1.5);
  return (openingPercent / 100) * maxFlowForGate;
}

/**
 * Runs one time step of the water balance simulation.
 */
export function stepWaterSimulation(
  state: DamSimulationState,
  dt: number,
  isReinforcedSpillway: boolean
): Partial<DamSimulationState> {
  const head = calculateHead(state.reservoirLevel);

  // 1. Calculate spillway outflow
  let totalSpillwayFlow = 0;
  const updatedGates = state.spillwayGates.map((gate) => {
    let opening = gate.openingPercent;
    // SCADA Auto-Balancing AI feature
    if (state.scadaAutoBalancing) {
      if (state.reservoirLevel > DANGER_WATER_LEVEL) {
        // Increment opening to prevent overtopping
        opening = Math.min(100, opening + 5 * dt);
      } else if (state.reservoirLevel < 22.0 && opening > 0) {
        // Close gates to conserve water for generation
        opening = Math.max(0, opening - 5 * dt);
      }
    }
    const flow = calculateGateFlow(opening, state.reservoirLevel, isReinforcedSpillway);
    totalSpillwayFlow += flow;
    return { ...gate, openingPercent: opening, flowRate: flow };
  });

  // 2. Calculate turbine water consumption
  // Each Francis turbine consumes up to ~45 m³/s at rated 26m head
  let totalTurbineFlow = 0;
  const updatedTurbines = state.turbines.map((t) => {
    if (!t.active || state.reservoirLevel <= MIN_WATER_LEVEL + 0.5) {
      return { ...t, flowRate: 0, powerMW: 0 };
    }
    const maxFlow = t.upgraded ? 52 : 44; // m³/s
    const headRatio = Math.sqrt(Math.max(0.1, head / 24.0));
    const flow = (t.throttlePercent / 100) * maxFlow * headRatio;
    totalTurbineFlow += flow;
    return { ...t, flowRate: flow };
  });

  // 3. Water Balance Update
  const totalOutflow = totalSpillwayFlow + totalTurbineFlow;
  const netFlow = state.inflowRate - totalOutflow; // m³/s
  const newVolume = Math.max(10_000_000, Math.min(MAX_STORAGE_VOLUME * 1.15, state.reservoirVolumeM3 + netFlow * dt * 10)); // Time compressed factor
  const newLevel = volumeToLevel(newVolume);

  // 4. Overtopping Risk & Structural Stress
  const isOvertoppingRisk = newLevel >= DANGER_WATER_LEVEL;
  let structuralIntegrity = state.structuralIntegrity;
  if (newLevel >= MAX_WATER_LEVEL) {
    // Water spilling over dam crest! Concrete degradation
    structuralIntegrity = Math.max(10, structuralIntegrity - 0.4 * dt);
  } else if (structuralIntegrity < 100) {
    // Routine maintenance slowly restores
    structuralIntegrity = Math.min(100, structuralIntegrity + 0.05 * dt);
  }

  // 5. Downstream River Level & Flooding
  // Baseline river depth is 2.5m at 200 m³/s
  const downstreamLevel = 2.0 + Math.pow(totalOutflow / 150, 0.65);
  const isFloodingDownstream = totalOutflow > SAFE_DOWNSTREAM_FLOW;

  return {
    reservoirVolumeM3: newVolume,
    reservoirLevel: newLevel,
    spillwayGates: updatedGates,
    turbines: updatedTurbines,
    totalSpillwayFlow,
    totalTurbineFlow,
    totalOutflow,
    downstreamLevel,
    isFloodingDownstream,
    isOvertoppingRisk,
    structuralIntegrity,
  };
}

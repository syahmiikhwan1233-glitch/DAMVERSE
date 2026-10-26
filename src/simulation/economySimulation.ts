/**
 * DAMVERSE - Economy, Contracts, Civilization & Operating Expenses Simulation
 * Calculates financial revenue, power export contracts, municipal water supply, and city growth.
 */

import { DamSimulationState, WaterSupplyStatus } from '../types/game';

export function stepEconomySimulation(
  state: DamSimulationState,
  dt: number,
  hasEcoTourism: boolean,
  hasWaterFiltration: boolean
): Partial<DamSimulationState> {
  // 1. Electricity Sales Revenue
  // Delivered MW converted to MWh per second * price
  const deliveredMW = state.isBlackout
    ? 0
    : Math.min(state.totalAvailablePowerMW, state.gridDemandMW);
  const mwhPerSecond = deliveredMW / 3600;
  let grossRevenuePerSecond = mwhPerSecond * state.electricityPricePerMWh;

  // 2. Eco-Tourism Deck revenue
  if (hasEcoTourism) {
    const isDaytime = state.timeOfDay >= 8 && state.timeOfDay <= 19;
    const weatherMult = state.weather === 'cerah' ? 1.5 : state.weather === 'mendung' ? 1.0 : 0.4;
    if (isDaytime) {
      grossRevenuePerSecond += 65 * weatherMult;
    }
  }

  // 3. Power Contracts Handling
  let contractPenalties = 0;
  const updatedContracts = state.contracts.map((c) => {
    if (!c.active) return c;
    const rem = Math.max(0, c.remainingSeconds - dt);
    const isMeetingDemand = state.totalAvailablePowerMW >= c.requiredMW;

    let fulfilledSec = c.fulfilledSeconds;
    if (isMeetingDemand) {
      fulfilledSec += dt;
      // Bonus contract price
      const contractMWhSec = c.requiredMW / 3600;
      grossRevenuePerSecond += contractMWhSec * (c.pricePerMWh - state.electricityPricePerMWh);
    } else {
      contractPenalties += c.penaltyPerSecond;
    }

    const isDone = rem <= 0;
    return {
      ...c,
      remainingSeconds: rem,
      fulfilledSeconds: fulfilledSec,
      active: !isDone,
    };
  });

  // 4. Operating Expenses
  // Fixed plant overhead
  let operatingExpenses = 30.0; // RM/s base plant operations & engineers
  // Variable cost per active turbine
  state.turbines.forEach((t) => {
    if (t.active) {
      operatingExpenses += 12.0 * (t.throttlePercent / 100);
    }
  });

  // Flood disaster emergency compensation
  if (state.isFloodingDownstream) {
    operatingExpenses += 140.0; // Flood relief & damage mitigation
  }

  // Add contract penalties
  operatingExpenses += contractPenalties;

  // Net profit
  const netProfitPerSecond = grossRevenuePerSecond - operatingExpenses;
  const newFunds = Math.max(0, state.funds + netProfitPerSecond * dt);

  // 5. Municipal Clean Water Supply Evaluation
  // Village and city pump station requires continuous river flow
  let waterSupplyStatus: WaterSupplyStatus = 'Mencukupi';
  if (state.totalOutflow < 60) {
    waterSupplyStatus = 'Terputus';
  } else if (state.totalOutflow < 140) {
    waterSupplyStatus = 'Kritikal';
  } else if (state.totalOutflow <= 850) {
    waterSupplyStatus = 'Cemerlang';
  } else {
    // During heavy flood, water is muddy and turbulent
    waterSupplyStatus = hasWaterFiltration ? 'Mencukupi' : 'Kritikal';
  }

  // 6. City Happiness & Population
  let happiness = state.cityHappiness;
  if (state.isBlackout) {
    happiness = Math.max(10, happiness - 0.5 * dt);
  } else if (state.gridStability > 85) {
    happiness = Math.min(100, happiness + 0.15 * dt);
  }

  if (waterSupplyStatus === 'Terputus') {
    happiness = Math.max(5, happiness - 0.8 * dt);
  } else if (waterSupplyStatus === 'Cemerlang') {
    happiness = Math.min(100, happiness + 0.1 * dt);
  }

  if (state.isFloodingDownstream) {
    happiness = Math.max(5, happiness - 1.2 * dt);
  }

  // Population drift based on happiness
  let population = state.cityPopulation;
  if (happiness > 75) {
    population += Math.round(1.5 * dt);
  } else if (happiness < 40) {
    population = Math.max(15000, population - Math.round(2.0 * dt));
  }

  return {
    funds: Math.round(newFunds * 100) / 100,
    grossRevenuePerSecond: Math.round(grossRevenuePerSecond * 10) / 10,
    operatingExpensesPerSecond: Math.round(operatingExpenses * 10) / 10,
    netProfitPerSecond: Math.round(netProfitPerSecond * 10) / 10,
    contracts: updatedContracts,
    waterSupplyStatus,
    cityHappiness: Math.round(happiness),
    cityPopulation: population,
  };
}

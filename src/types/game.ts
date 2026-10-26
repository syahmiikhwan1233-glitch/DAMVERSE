/**
 * DAMVERSE - Core Game Types & Simulation Constants
 * Bahasa Melayu domain terms and full mechanical-economic state definitions.
 */

export type WeatherType = 'cerah' | 'mendung' | 'hujan' | 'ribut_tengkujuh' | 'kemarau';

export type WaterSupplyStatus = 'Cemerlang' | 'Mencukupi' | 'Kritikal' | 'Terputus';

export type GraphicsQuality = 'rendah' | 'sederhana' | 'tinggi';

export type CameraMode = 'thirdPerson' | 'firstPerson' | 'freeOrbit' | 'damView';

export interface SpillwayGate {
  id: number;
  name: string;
  openingPercent: number; // 0 to 100
  flowRate: number; // m³/s
  status: 'ok' | 'jammed' | 'maintenance';
}

export interface TurbineUnit {
  id: number;
  name: string;
  active: boolean;
  throttlePercent: number; // 0 to 100
  flowRate: number; // m³/s consumed
  powerMW: number; // MW produced
  wearPercent: number; // 0 to 100% wear
  upgraded: boolean;
}

export interface PowerContract {
  id: string;
  clientName: string;
  requiredMW: number;
  pricePerMWh: number; // RM
  penaltyPerSecond: number; // RM if unfulfilled
  durationSeconds: number;
  remainingSeconds: number;
  active: boolean;
  fulfilledSeconds: number;
}

export interface UpgradeItem {
  id: string;
  name: string;
  category: 'infrastruktur' | 'tenaga' | 'keselamatan' | 'pelancongan';
  description: string;
  cost: number; // RM
  unlocked: boolean;
  built: boolean;
  effectDescription: string;
}

export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  cost: number; // RM
  researchTimeSeconds: number;
  progressPercent: number;
  isResearching: boolean;
  completed: boolean;
  requiredTechId?: string;
  perkDescription: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetType: 'power' | 'water_level' | 'grid_stability' | 'funds' | 'contract' | 'upgrade';
  targetValue: number;
  currentValue: number;
  unit: string;
  rewardRM: number;
  completed: boolean;
  claimed: boolean;
}

export interface DamAlert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
}

export interface GameSettings {
  graphicsQuality: GraphicsQuality;
  soundEnabled: boolean;
  masterVolume: number;
  sfxVolume: number;
  waterDetail: boolean;
  shadows: boolean;
  showMinimap: boolean;
  showFps: boolean;
  invertY: boolean;
}

export interface DamSimulationState {
  // Water reservoir
  reservoirLevel: number; // Current height in meters (e.g. 10m min, 30m max)
  minReservoirLevel: number; // 12m
  maxReservoirLevel: number; // 30m
  dangerReservoirLevel: number; // 28.5m
  reservoirVolumeM3: number; // Current water in m³
  maxCapacityM3: number; // 120,000,000 m³
  inflowRate: number; // Current inflow m³/s
  baseInflowRate: number; // Baseline inflow m³/s
  spillwayGates: SpillwayGate[];
  turbines: TurbineUnit[];
  totalSpillwayFlow: number; // m³/s
  totalTurbineFlow: number; // m³/s
  totalOutflow: number; // m³/s
  downstreamLevel: number; // River water level downstream in meters
  downstreamSafeFlow: number; // e.g. 900 m³/s safe threshold
  isFloodingDownstream: boolean;
  isOvertoppingRisk: boolean;
  structuralIntegrity: number; // 0 to 100%
  scadaAutoBalancing: boolean; // Auto-regulates gates

  // Grid & Electricity
  totalGenerationMW: number;
  solarGenerationMW: number;
  batteryDischargeMW: number;
  totalAvailablePowerMW: number;
  gridDemandMW: number;
  baseCityDemandMW: number;
  industrialDemandMW: number;
  ruralDemandMW: number;
  gridFrequencyHz: number; // 50.00 Hz
  gridStability: number; // 0 to 100%
  isBlackout: boolean;
  electricityPricePerMWh: number; // RM
  batteryStorageMWh: number;
  batteryCapacityMWh: number;

  // Economy & Civilization
  funds: number; // RM
  grossRevenuePerSecond: number; // RM/s
  operatingExpensesPerSecond: number; // RM/s
  netProfitPerSecond: number; // RM/s
  totalEnergyDeliveredMWh: number;
  cityPopulation: number;
  cityHappiness: number; // 0 to 100%
  waterSupplyStatus: WaterSupplyStatus;

  // Weather & Time
  timeOfDay: number; // 0 to 24 hours
  timeSpeed: number; // 1x, 2x, 5x
  weather: WeatherType;
  weatherDuration: number;
  rainIntensity: number; // 0 to 1

  // Contracts & Systems
  contracts: PowerContract[];
  upgrades: Record<string, UpgradeItem>;
  research: Record<string, ResearchNode>;
  missions: Mission[];
  alerts: DamAlert[];
}

export interface PlayerState {
  position: [number, number, number];
  rotationY: number;
  isMoving: boolean;
  isRunning: boolean;
  isJumping: boolean;
  inVehicle: boolean;
  vehiclePosition: [number, number, number];
  vehicleRotationY: number;
  vehicleSpeed: number;
  nearVehicle: boolean;
  nearControlRoom: boolean;
  nearTurbineFloor: boolean;
}

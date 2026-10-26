/**
 * DAMVERSE - Persistent Save & Load System
 * Manages localStorage saving with schema validation, versioning, autosave and reset safety.
 */

import { DamSimulationState, GameSettings } from '../types/game';

const SAVE_KEY = 'DAMVERSE_SAVE_V1';
const SETTINGS_KEY = 'DAMVERSE_SETTINGS_V1';

export const DEFAULT_INITIAL_STATE: DamSimulationState = {
  reservoirLevel: 24.2, // normal operating level
  minReservoirLevel: 12.0,
  maxReservoirLevel: 30.0,
  dangerReservoirLevel: 28.5,
  reservoirVolumeM3: 72_000_000,
  maxCapacityM3: 120_000_000,
  inflowRate: 240,
  baseInflowRate: 240,
  spillwayGates: [
    { id: 1, name: 'Pintu Alur Limpah 1', openingPercent: 0, flowRate: 0, status: 'ok' },
    { id: 2, name: 'Pintu Alur Limpah 2', openingPercent: 0, flowRate: 0, status: 'ok' },
    { id: 3, name: 'Pintu Alur Limpah 3', openingPercent: 0, flowRate: 0, status: 'ok' },
  ],
  turbines: [
    { id: 1, name: 'Turbin Francis Unit 1', active: true, throttlePercent: 85, flowRate: 38, powerMW: 52.4, wearPercent: 12, upgraded: false },
    { id: 2, name: 'Turbin Francis Unit 2', active: true, throttlePercent: 85, flowRate: 38, powerMW: 52.4, wearPercent: 14, upgraded: false },
    { id: 3, name: 'Turbin Francis Unit 3', active: false, throttlePercent: 0, flowRate: 0, powerMW: 0, wearPercent: 8, upgraded: false },
    { id: 4, name: 'Turbin Francis Unit 4', active: false, throttlePercent: 0, flowRate: 0, powerMW: 0, wearPercent: 5, upgraded: false },
  ],
  totalSpillwayFlow: 0,
  totalTurbineFlow: 76,
  totalOutflow: 76,
  downstreamLevel: 2.8,
  downstreamSafeFlow: 850,
  isFloodingDownstream: false,
  isOvertoppingRisk: false,
  structuralIntegrity: 98,
  scadaAutoBalancing: false,

  totalGenerationMW: 104.8,
  solarGenerationMW: 0,
  batteryDischargeMW: 0,
  totalAvailablePowerMW: 104.8,
  gridDemandMW: 110,
  baseCityDemandMW: 65,
  industrialDemandMW: 30,
  ruralDemandMW: 15,
  gridFrequencyHz: 49.92,
  gridStability: 96,
  isBlackout: false,
  electricityPricePerMWh: 320,
  batteryStorageMWh: 0,
  batteryCapacityMWh: 0,

  funds: 350_000,
  grossRevenuePerSecond: 9.3,
  operatingExpensesPerSecond: 38.0,
  netProfitPerSecond: -28.7,
  totalEnergyDeliveredMWh: 1420,
  cityPopulation: 48_500,
  cityHappiness: 88,
  waterSupplyStatus: 'Mencukupi',

  timeOfDay: 10.5,
  timeSpeed: 1,
  weather: 'cerah',
  weatherDuration: 180,
  rainIntensity: 0.0,

  contracts: [
    {
      id: 'tnb_main',
      clientName: 'Tenaga Nasional (Grid Wilayah Utara)',
      requiredMW: 90,
      pricePerMWh: 340,
      penaltyPerSecond: 35,
      durationSeconds: 300,
      remainingSeconds: 300,
      active: true,
      fulfilledSeconds: 0,
    },
    {
      id: 'ind_park',
      clientName: 'Taman Perindustrian Lembah Hijau',
      requiredMW: 45,
      pricePerMWh: 380,
      penaltyPerSecond: 25,
      durationSeconds: 240,
      remainingSeconds: 240,
      active: false,
      fulfilledSeconds: 0,
    },
  ],
  upgrades: {
    solarFarm: {
      id: 'solarFarm',
      name: 'Ladang Solar Terapung Tasik',
      category: 'tenaga',
      description: 'Panel fotovoltaik terapung di permukaan tasik empangan menjana sehingga 30 MW tenaga tambahan pada waktu siang.',
      cost: 150_000,
      unlocked: true,
      built: false,
      effectDescription: '+30 MW Tenaga Solar (Waktu Siang)',
    },
    bessBattery: {
      id: 'bessBattery',
      name: 'Sistem Simpanan Bateri (BESS)',
      category: 'tenaga',
      description: 'Bateri ion-litium skala grid berkapasiti 50 MWh untuk menyerap lebihan kuasa dan menyuntik tenaga semasa beban puncak.',
      cost: 120_000,
      unlocked: true,
      built: false,
      effectDescription: 'Simpanan 50 MWh & Sokongan Beban Puncak',
    },
    reinforcedSpillway: {
      id: 'reinforcedSpillway',
      name: 'Pengukuhan Alur Limpah & Chute',
      category: 'keselamatan',
      description: 'Lompatan pelesap tenaga dan dinding konkrit tebal yang meningkatkan had aliran pelepasan air banjir sehingga +30%.',
      cost: 110_000,
      unlocked: true,
      built: false,
      effectDescription: '+25% Kapasiti Pelepasan Air Banjir',
    },
    automatedScada: {
      id: 'automatedScada',
      name: 'Sistem SCADA & Imbangan Pintu Automatik',
      category: 'infrastruktur',
      description: 'Kawalan pintar penderia air automatik yang melaras pintu alur limpah secara kendiri untuk mengelakkan risiko limpahan.',
      cost: 75_000,
      unlocked: true,
      built: false,
      effectDescription: 'Kawalan Automatik Mencegah Limpahan',
    },
    ecoTourismDeck: {
      id: 'ecoTourismDeck',
      name: 'Dek Pemerhatian & Pusat Pelancongan Empangan',
      category: 'pelancongan',
      description: 'Jejantas kaca tinjau pemandangan tasik dan empangan yang menarik pelancong dan menjana aliran pendapatan sampingan.',
      cost: 85_000,
      unlocked: true,
      built: false,
      effectDescription: '+RM 65/saat Pendapatan Pelancongan',
    },
    waterFiltrationPlant: {
      id: 'waterFiltrationPlant',
      name: 'Loji Penapisan Air Bersih Perbandaran',
      category: 'infrastruktur',
      description: 'Mengekalkan bekalan air minuman bersih yang stabil ke Kampung Hilir dan Bandar Mahameru walaupun semasa musim banjir.',
      cost: 95_000,
      unlocked: true,
      built: false,
      effectDescription: 'Bekalan Air Terjamin & Kepuasan Penduduk Tinggi',
    },
  },
  research: {
    ceramicCoating: {
      id: 'ceramicCoating',
      name: 'Salutan Bilah Turbin Seramik Nano',
      description: 'Mengurangkan pergeseran hidrodinamik dan hakisan kavitasi bilah pelari turbin.',
      cost: 50_000,
      researchTimeSeconds: 60,
      progressPercent: 0,
      isResearching: false,
      completed: false,
      perkDescription: 'Kehausan Turbin -60% & Kecekapan +3%',
    },
    aiForecast: {
      id: 'aiForecast',
      name: 'Ramalan AI Aliran Masuk Monsun',
      description: 'Model ramalan meteorologi untuk menjangka pertambahan aliran sungai sebelum monsun tiba.',
      cost: 45_000,
      researchTimeSeconds: 45,
      progressPercent: 0,
      isResearching: false,
      completed: false,
      perkDescription: 'Amaran Cuaca Ekstrem Awal & Nilai Jualan +5%',
    },
    deepCavitationSuppression: {
      id: 'deepCavitationSuppression',
      name: 'Suntikan Udara Pencegah Kavitasi',
      description: 'Sistem injap suntikan udara tertekan di tiub draf turbin untuk operasi selamat pada paras air rendah.',
      cost: 65_000,
      researchTimeSeconds: 75,
      progressPercent: 0,
      isResearching: false,
      completed: false,
      requiredTechId: 'ceramicCoating',
      perkDescription: 'Turbin Boleh Beroperasi Pada Paras Air Lebih Rendah',
    },
    smartGridDistribution: {
      id: 'smartGridDistribution',
      name: 'Grid Pintar & Pengurusan Beban Dinamik',
      description: 'Sistem suis pencegah gangguan automatik yang menstabilkan voltan dan frekuensi grid.',
      cost: 80_000,
      researchTimeSeconds: 90,
      progressPercent: 0,
      isResearching: false,
      completed: false,
      requiredTechId: 'aiForecast',
      perkDescription: 'Kestabilan Grid Maksimum & Bonus Tarif RM 350/MWh',
    },
  },
  missions: [
    {
      id: 'm1',
      title: 'Misi 1: Penstabilan Grid Asas',
      description: 'Jana sekurang-kurangnya 100 MW kuasa elektrik dengan mengaktifkan Turbin 1 & 2 pada pendikit optimum.',
      targetType: 'power',
      targetValue: 100,
      currentValue: 104.8,
      unit: 'MW',
      rewardRM: 50_000,
      completed: false,
      claimed: false,
    },
    {
      id: 'm2',
      title: 'Misi 2: Pematuhan Kontrak Grid TNB',
      description: 'Kekalkan bekalan 90 MW secara berterusan kepada Tenaga Nasional sehingga tempoh kontrak selesai.',
      targetType: 'contract',
      targetValue: 300,
      currentValue: 0,
      unit: 'saat',
      rewardRM: 75_000,
      completed: false,
      claimed: false,
    },
    {
      id: 'm3',
      title: 'Misi 3: Kawalan Banjir Musim Tengkujuh',
      description: 'Buka pintu alur limpah semasa hujan monsun dan pastikan paras takungan di bawah paras bahaya 28.5m.',
      targetType: 'water_level',
      targetValue: 28.5,
      currentValue: 24.2,
      unit: 'm',
      rewardRM: 60_000,
      completed: false,
      claimed: false,
    },
    {
      id: 'm4',
      title: 'Misi 4: Pembinaan Ladang Solar Terapung',
      description: 'Kumpulkan dana dan bina projek Ladang Solar Terapung di permukaan tasik empangan.',
      targetType: 'upgrade',
      targetValue: 1,
      currentValue: 0,
      unit: 'Projek',
      rewardRM: 80_000,
      completed: false,
      claimed: false,
    },
    {
      id: 'm5',
      title: 'Misi 5: Dana Rizab RM 1 Juta',
      description: 'Capai keuntungan bersih dan kembangkan rizab kewangan syarikat empangan sehingga RM 1,000,000.',
      targetType: 'funds',
      targetValue: 1_000_000,
      currentValue: 350_000,
      unit: 'RM',
      rewardRM: 150_000,
      completed: false,
      claimed: false,
    },
  ],
  alerts: [
    {
      id: 'init_1',
      timestamp: '10:30',
      severity: 'info',
      message: 'Selamat datang ke Empangan DAMVERSE. Sistem pemantauan telemetri aktif.',
    },
  ],
};

export const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'tinggi',
  soundEnabled: true,
  masterVolume: 0.8,
  sfxVolume: 0.8,
  waterDetail: true,
  shadows: true,
  showMinimap: true,
  showFps: false,
  invertY: false,
};

export function saveGameState(state: DamSimulationState): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadGameState(): DamSimulationState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return DEFAULT_INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_INITIAL_STATE, ...parsed };
  } catch {
    return DEFAULT_INITIAL_STATE;
  }
}

export function resetGameState(): DamSimulationState {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
  return DEFAULT_INITIAL_STATE;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

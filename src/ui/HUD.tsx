/**
 * DAMVERSE - Low-Occlusion Perimeter Status HUD
 * Real-time telemetry: Reservoir percentage, Generation MW vs Demand,
 * Weather, City happiness, and Emergency alert banners.
 */

import React from 'react';
import {
  DamSimulationState,
  PlayerState,
  WeatherType,
} from '../types/game';
import {
  Zap,
  Droplets,
  DollarSign,
  AlertTriangle,
  Clock,
  Sun,
  CloudRain,
  CloudLightning,
  Flame,
  Cloud,
  Car,
  ShieldAlert,
  Smartphone,
  Maximize2,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface HUDProps {
  sim: DamSimulationState;
  player: PlayerState;
  enterOrExitVehicle: () => void;
  openModal: (modal: string | null) => void;
}

const WEATHER_LABELS: Record<WeatherType, { label: string; icon: React.ReactNode; color: string }> = {
  cerah: { label: 'Cerah', icon: <Sun className="w-4 h-4 text-amber-400" />, color: 'text-amber-400' },
  mendung: { label: 'Mendung', icon: <Cloud className="w-4 h-4 text-slate-300" />, color: 'text-slate-300' },
  hujan: { label: 'Hujan', icon: <CloudRain className="w-4 h-4 text-sky-400" />, color: 'text-sky-400' },
  ribut_tengkujuh: { label: 'Ribut Tengkujuh', icon: <CloudLightning className="w-4 h-4 text-purple-400" />, color: 'text-purple-400' },
  kemarau: { label: 'Kemarau El Nino', icon: <Flame className="w-4 h-4 text-red-400" />, color: 'text-red-400' },
};

export const HUD: React.FC<HUDProps> = ({
  sim,
  player,
  enterOrExitVehicle,
  openModal,
}) => {
  const hour = Math.floor(sim.timeOfDay);
  const minute = Math.floor((sim.timeOfDay % 1) * 60);
  const timeFormatted = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  const reservoirPercent = Math.min(
    100,
    Math.round(((sim.reservoirLevel - sim.minReservoirLevel) / (sim.maxReservoirLevel - sim.minReservoirLevel)) * 100)
  );

  const weatherInfo = WEATHER_LABELS[sim.weather];

  return (
    <div className="absolute inset-0 pointer-events-none select-none p-3 sm:p-5 flex flex-col justify-between z-20">
      {/* 1. TOP TELEMETRY CLUSTER */}
      <div className="flex flex-wrap items-start justify-between gap-3 w-full max-w-7xl mx-auto">
        {/* Left: Financial & Dam Reservoir telemetry */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Funds Badge */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Dana Syarikat</div>
              <div className="text-base font-bold text-emerald-400 tabular-nums">
                RM {sim.funds.toLocaleString('ms-MY', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded ${sim.netProfitPerSecond >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
              {sim.netProfitPerSecond >= 0 ? '+' : ''}{sim.netProfitPerSecond.toFixed(1)}/s
            </div>
          </div>

          {/* Reservoir Water Level Badge */}
          <div
            onClick={() => openModal('dam')}
            className={`cursor-pointer transition hover:border-sky-500 bg-slate-900/90 border ${sim.isOvertoppingRisk ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-700/80'} rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-2.5`}
          >
            <div className={`w-8 h-8 rounded-lg ${sim.isOvertoppingRisk ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-sky-500/20 border-sky-500/40 text-sky-400'} border flex items-center justify-center`}>
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1.5">
                Paras Takungan
                {sim.isOvertoppingRisk && <span className="text-red-400 font-bold">BAHAYA!</span>}
              </div>
              <div className="text-base font-bold text-slate-100 tabular-nums">
                {sim.reservoirLevel.toFixed(1)}m <span className="text-xs font-normal text-slate-400">({reservoirPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Emergency Notification Bar */}
        {(sim.isFloodingDownstream || sim.isBlackout || sim.isOvertoppingRisk) && (
          <div className="pointer-events-auto bg-red-950/90 border border-red-500 text-red-100 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-md animate-bounce">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="text-xs font-medium leading-snug">
              {sim.isBlackout && 'AMARAN: Grid elektrik terputus! Bekalan kuasa tidak mencukupi.'}
              {sim.isFloodingDownstream && 'AMARAN: Banjir hilir! Pelepasan air sungai melebihi paras selamat.'}
              {sim.isOvertoppingRisk && 'AMARAN KRITIKAL: Risiko limpahan air di atas puncak empangan!'}
            </div>
          </div>
        )}

        {/* Right: Grid Power & Weather Cluster */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto ml-auto">
          {/* Power Generation & Grid Demand */}
          <div
            onClick={() => openModal('grid')}
            className={`cursor-pointer transition hover:border-amber-500 bg-slate-900/90 border ${sim.isBlackout ? 'border-rose-500' : 'border-slate-700/80'} rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-2.5`}
          >
            <div className={`w-8 h-8 rounded-lg ${sim.isBlackout ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'} border flex items-center justify-center`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Janaan / Beban</div>
              <div className="text-base font-bold text-amber-300 tabular-nums">
                {sim.totalAvailablePowerMW.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ {sim.gridDemandMW} MW</span>
              </div>
            </div>
            <div className="text-xs font-semibold tabular-nums text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
              {sim.gridFrequencyHz.toFixed(2)} Hz
            </div>
          </div>

          {/* Clock & Weather Badge */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200 tabular-nums">{timeFormatted}</div>
              <div className={`text-[11px] font-semibold flex items-center gap-1 ${weatherInfo.color}`}>
                {weatherInfo.icon}
                {weatherInfo.label}
              </div>
            </div>
          </div>

          {/* Android App Install & Fullscreen Badges */}
          <button
            onClick={() => {
              triggerHaptic(20);
              openModal('android');
            }}
            title="Pasang Aplikasi Android"
            className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-lg transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Android</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.().catch(() => {});
              } else {
                document.exitFullscreen?.().catch(() => {});
              }
            }}
            title="Skrin Penuh (Fullscreen)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-lg transition active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CONTEXTUAL INTERACTION PROMPT */}
      <div className="flex justify-center w-full">
        {(player.nearVehicle || player.inVehicle) && (
          <button
            onClick={enterOrExitVehicle}
            className="pointer-events-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transition transform active:scale-95 animate-pulse"
          >
            <Car className="w-5 h-5" />
            <span>{player.inVehicle ? 'Keluar Kenderaan (Tekan E / Tap)' : 'Pandu Trak Penyelenggaraan (Tekan E / Tap)'}</span>
          </button>
        )}
      </div>

      {/* 3. LOWER PERIMETER: TELEMETRY SUMMARY */}
      <div className="flex flex-wrap items-end justify-between gap-3 w-full max-w-7xl mx-auto pb-16 sm:pb-20">
        {/* Stream Inflow vs Outflow */}
        <div className="bg-slate-900/85 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-3 backdrop-blur-none pointer-events-auto">
          <div>
            <span className="text-slate-500 font-medium mr-1.5">ALIRAN MASUK:</span>
            <span className="font-bold text-sky-400 tabular-nums">{sim.inflowRate} m³/s</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div>
            <span className="text-slate-500 font-medium mr-1.5">ALIRAN KELUAR:</span>
            <span className="font-bold text-slate-100 tabular-nums">{Math.round(sim.totalOutflow)} m³/s</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div>
            <span className="text-slate-500 font-medium mr-1.5">INTEGRITI EMPANGAN:</span>
            <span className="font-bold text-emerald-400 tabular-nums">{Math.round(sim.structuralIntegrity)}%</span>
          </div>
        </div>

        {/* Civilization & Water Status */}
        <div className="bg-slate-900/85 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-3 backdrop-blur-none pointer-events-auto">
          <div>
            <span className="text-slate-500 font-medium mr-1.5">BANDAR MAHAMERU:</span>
            <span className="font-bold text-slate-100 tabular-nums">{sim.cityPopulation.toLocaleString()} orang</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div>
            <span className="text-slate-500 font-medium mr-1.5">BEKALAN AIR:</span>
            <span className={`font-bold ${sim.waterSupplyStatus === 'Cemerlang' ? 'text-emerald-400' : sim.waterSupplyStatus === 'Mencukupi' ? 'text-sky-400' : 'text-red-400'}`}>
              {sim.waterSupplyStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

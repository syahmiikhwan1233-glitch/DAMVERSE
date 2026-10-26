/**
 * DAMVERSE - Dam SCADA Control Panel Modal
 * Precise controls for radial spillway gates, turbine governors, and automated balancing.
 */

import React from 'react';
import { DamSimulationState } from '../../types/game';
import { X, Sliders, Cpu, Wrench, ShieldCheck, AlertCircle } from 'lucide-react';

interface DamControlModalProps {
  sim: DamSimulationState;
  setSpillwayOpening: (gateId: number, percent: number) => void;
  toggleTurbine: (turbineId: number) => void;
  setTurbineThrottle: (turbineId: number, percent: number) => void;
  repairTurbine: (turbineId: number) => void;
  toggleScadaAuto: () => void;
  onClose: () => void;
}

export const DamControlModal: React.FC<DamControlModalProps> = ({
  sim,
  setSpillwayOpening,
  toggleTurbine,
  setTurbineThrottle,
  repairTurbine,
  toggleScadaAuto,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Pusat Kawalan Empangan & SCADA</h2>
              <p className="text-xs text-slate-400">Pengurusan Pintu Alur Limpah & Penjanaan Turbin Francis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Top Telemetry Summary & SCADA Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Paras Air Takungan</div>
              <div className="text-xl font-bold text-sky-400 mt-1 tabular-nums">
                {sim.reservoirLevel.toFixed(1)} m
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Had Maksimum: 30.0m · Bahaya: 28.5m
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Jumlah Pelepasan Air</div>
              <div className="text-xl font-bold text-slate-100 mt-1 tabular-nums">
                {Math.round(sim.totalOutflow)} m³/s
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Alur Limpah: {Math.round(sim.totalSpillwayFlow)} m³/s · Turbin: {Math.round(sim.totalTurbineFlow)} m³/s
              </div>
            </div>

            {/* SCADA Auto Toggle */}
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" /> SCADA Pintar
                </div>
                <div className="text-xs text-slate-300 mt-1">Imbangan Pintu Automatik</div>
              </div>
              <button
                onClick={toggleScadaAuto}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  sim.scadaAutoBalancing
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sim.scadaAutoBalancing ? 'AKTIF' : 'MANUAL'}
              </button>
            </div>
          </div>

          {/* 1. Spillway Radial Gates (Pintu Alur Limpah 1, 2, 3) */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" /> Kawalan Pintu Alur Limpah (Spillway Gates)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sim.spillwayGates.map((gate) => (
                <div key={gate.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">{gate.name}</span>
                    <span className="text-xs font-bold text-amber-400 tabular-nums">
                      {Math.round(gate.openingPercent)}% Terbuka
                    </span>
                  </div>

                  {/* Flow Rate Readout */}
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Kadar Pelepasan:</span>
                    <span className="font-bold text-slate-200 tabular-nums">{Math.round(gate.flowRate)} m³/s</span>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gate.openingPercent}
                    onChange={(e) => setSpillwayOpening(gate.id, Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 25, 50, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSpillwayOpening(gate.id, val)}
                        className={`text-[10px] font-bold py-1 rounded transition ${
                          Math.round(gate.openingPercent) === val
                            ? 'bg-sky-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {val === 0 ? 'Tutup' : `${val}%`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Francis Turbines (Stesen Janakuasa) */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" /> Unit Penjana Turbin Francis (4 x 60 MW)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sim.turbines.map((t) => (
                <div key={t.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-200">{t.name}</div>
                      <div className="text-xs text-slate-400">
                        {t.active ? (
                          <span className="text-emerald-400 font-semibold">● Beroperasi</span>
                        ) : (
                          <span className="text-slate-500">○ Dimatikan (Siap Sedia)</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTurbine(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        t.active
                          ? 'bg-rose-500 hover:bg-rose-400 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {t.active ? 'Matikan' : 'Aktifkan'}
                    </button>
                  </div>

                  {/* Telemetry output */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-lg">
                    <div>
                      <span className="text-slate-400">Kuasa Terjana:</span>
                      <div className="text-sm font-bold text-amber-300 tabular-nums">{t.powerMW.toFixed(1)} MW</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Penggunaan Air:</span>
                      <div className="text-sm font-bold text-sky-400 tabular-nums">{Math.round(t.flowRate)} m³/s</div>
                    </div>
                  </div>

                  {/* Throttle Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Injap Pendikit (Throttle):</span>
                      <span className="font-bold text-slate-200 tabular-nums">{t.throttlePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      disabled={!t.active}
                      value={t.throttlePercent}
                      onChange={(e) => setTurbineThrottle(t.id, Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
                    />
                  </div>

                  {/* Wear & Repair */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div className="text-xs text-slate-400">
                      Kehausan Bilah: <span className="font-bold text-slate-300">{Math.round(t.wearPercent)}%</span>
                    </div>
                    {t.wearPercent > 10 && (
                      <button
                        onClick={() => repairTurbine(t.id)}
                        disabled={sim.funds < 15000}
                        className="text-xs font-bold px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded-lg flex items-center gap-1 transition disabled:opacity-40"
                      >
                        <Wrench className="w-3.5 h-3.5" /> Baiki (RM 15k)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

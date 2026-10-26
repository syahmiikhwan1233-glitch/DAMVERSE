/**
 * DAMVERSE - Grid & Financial Management Modal
 * Real-time electrical demand curves, power export contracts, and financial balance sheet.
 */

import React from 'react';
import { DamSimulationState } from '../../types/game';
import { X, Activity, DollarSign, Zap, FileText, CheckCircle2 } from 'lucide-react';

interface GridFinanceModalProps {
  sim: DamSimulationState;
  toggleContract: (contractId: string) => void;
  onClose: () => void;
}

export const GridFinanceModal: React.FC<GridFinanceModalProps> = ({
  sim,
  toggleContract,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Grid Elektrik & Penyata Kewangan</h2>
              <p className="text-xs text-slate-400">Keseimbangan Bekalan Tenaga, Kontrak TNB & Keuntungan Bersih</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Grid Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Jumlah Bekalan Kuasa</div>
              <div className="text-xl font-bold text-amber-400 mt-1 tabular-nums">
                {sim.totalAvailablePowerMW.toFixed(1)} MW
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Hidro: {sim.totalGenerationMW}MW · Solar: {sim.solarGenerationMW}MW · BESS: {sim.batteryDischargeMW}MW
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Permintaan Grid Semasa</div>
              <div className="text-xl font-bold text-slate-100 mt-1 tabular-nums">
                {sim.gridDemandMW} MW
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Bandar: {sim.baseCityDemandMW}MW · Industri: {sim.industrialDemandMW}MW · Desa: 15MW
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Frekuensi & Kestabilan</div>
              <div className="text-xl font-bold text-sky-400 mt-1 tabular-nums">
                {sim.gridFrequencyHz.toFixed(2)} Hz
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Kestabilan Grid: {sim.gridStability}%
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Harga Pasaran MWh</div>
              <div className="text-xl font-bold text-emerald-400 mt-1 tabular-nums">
                RM {sim.electricityPricePerMWh}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Tarif Feed-in Kuasa Boleh Baharu
              </div>
            </div>
          </div>

          {/* Financial Balance Sheet */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Penyata Aliran Tunai & Keuntungan (RM/saat)
            </h3>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800">
                <span className="text-slate-300">Pendapatan Jualan Elektrik Grid:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  +RM {sim.grossRevenuePerSecond.toFixed(1)}/s
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800">
                <span className="text-slate-300">Kos Operasi & Penyelenggaraan Loji:</span>
                <span className="font-bold text-rose-400 tabular-nums">
                  -RM {sim.operatingExpensesPerSecond.toFixed(1)}/s
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 font-bold bg-slate-900 px-3 rounded-lg">
                <span className="text-slate-100">Keuntungan Bersih Semasa:</span>
                <span className={`text-base tabular-nums ${sim.netProfitPerSecond >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {sim.netProfitPerSecond >= 0 ? '+' : ''}RM {sim.netProfitPerSecond.toFixed(1)}/s
                </span>
              </div>
            </div>
          </div>

          {/* Power Export Contracts */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" /> Kontrak Pembekalan Tenaga
            </h3>
            <div className="space-y-3">
              {sim.contracts.map((c) => (
                <div key={c.id} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      {c.clientName}
                      {c.active && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                          KONTRAK AKTIF
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      Keperluan Minimum: <span className="text-amber-300 font-bold">{c.requiredMW} MW</span> · Tarif: <span className="text-emerald-400 font-bold">RM {c.pricePerMWh}/MWh</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Baki Tempoh: {Math.round(c.remainingSeconds)} saat · Penalti jika gagal: RM {c.penaltyPerSecond}/s
                    </div>
                  </div>

                  <button
                    onClick={() => toggleContract(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      c.active
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {c.active ? 'Batalkan Kontrak' : 'Tandatangani Kontrak'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

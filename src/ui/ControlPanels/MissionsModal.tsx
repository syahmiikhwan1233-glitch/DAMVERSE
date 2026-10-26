/**
 * DAMVERSE - Missions & Engineering Contracts Modal
 * Progressive engineering missions with real-time objective tracking and financial grants.
 */

import React from 'react';
import { DamSimulationState } from '../../types/game';
import { X, Target, Award, CheckCircle2 } from 'lucide-react';

interface MissionsModalProps {
  sim: DamSimulationState;
  claimMission: (missionId: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  sim,
  claimMission,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Misi Operasi & Anugerah Kejuruteraan</h2>
              <p className="text-xs text-slate-400">Objektif Strategik Pembangunan Tamadun & Ketahanan Tenaga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missions List */}
        <div className="p-5 overflow-y-auto space-y-4">
          {sim.missions.map((m) => {
            const progressRatio = Math.min(1, Math.max(0, m.currentValue / m.targetValue));
            const percent = Math.round(progressRatio * 100);

            return (
              <div
                key={m.id}
                className={`border rounded-xl p-4.5 flex flex-wrap items-center justify-between gap-4 transition ${
                  m.claimed
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : m.completed
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="space-y-1.5 max-w-xl flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-base">{m.title}</span>
                    {m.claimed ? (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
                        SELESAI & DITUNTUT
                      </span>
                    ) : m.completed ? (
                      <span className="text-[10px] bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                        Sedia Untuk Dituntut!
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Kemajuan:</span>
                      <span className="tabular-nums font-semibold text-slate-200">
                        {typeof m.currentValue === 'number' ? m.currentValue.toFixed(1) : m.currentValue} / {m.targetValue} {m.unit} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full transition-all duration-300 ${
                          m.completed ? 'bg-amber-400' : 'bg-sky-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Reward & Claim button */}
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Ganjaran Geran</div>
                    <div className="text-base font-bold text-emerald-400 tabular-nums">
                      +RM {m.rewardRM.toLocaleString('ms-MY')}
                    </div>
                  </div>

                  {m.completed && !m.claimed && (
                    <button
                      onClick={() => claimMission(m.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4" /> Tuntut Ganjaran
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * DAMVERSE - Construction & Upgrades Modal
 * Build mega-projects: Floating solar farm, BESS battery storage,
 * spillway reinforcement, and tourism facilities.
 */

import React from 'react';
import { DamSimulationState } from '../../types/game';
import { X, Hammer, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';

interface ConstructionModalProps {
  sim: DamSimulationState;
  buildUpgrade: (upgradeId: string) => void;
  onClose: () => void;
}

export const ConstructionModal: React.FC<ConstructionModalProps> = ({
  sim,
  buildUpgrade,
  onClose,
}) => {
  const upgradeList = Object.values(sim.upgrades);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Pusat Pembinaan & Penaiktarafan</h2>
              <p className="text-xs text-slate-400">Pembangunan Projek Mega Tenaga Boleh Baharu & Keselamatan Empangan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upgradeList.map((item) => {
              const canAfford = sim.funds >= item.cost;
              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4.5 flex flex-col justify-between transition ${
                    item.built
                      ? 'bg-slate-950/40 border-emerald-500/40'
                      : canAfford
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-100 text-base">{item.name}</h4>
                      {item.built ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" /> Telah Dibina
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-400 tabular-nums bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          RM {item.cost.toLocaleString('ms-MY')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold bg-sky-950/40 border border-sky-800/40 px-2.5 py-1.5 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{item.effectDescription}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-slate-500">{item.category}</span>
                    {!item.built && (
                      <button
                        onClick={() => buildUpgrade(item.id)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          canAfford
                            ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Hammer className="w-3.5 h-3.5" /> Bina Projek Ini
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

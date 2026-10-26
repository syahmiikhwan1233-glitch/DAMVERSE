/**
 * DAMVERSE - Engineering Research & Development Modal
 * Tech tree unlocking advanced hydraulic and electrical efficiency perks.
 */

import React from 'react';
import { DamSimulationState } from '../../types/game';
import { X, Microscope, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface ResearchModalProps {
  sim: DamSimulationState;
  startResearch: (techId: string) => void;
  onClose: () => void;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({
  sim,
  startResearch,
  onClose,
}) => {
  const researchList = Object.values(sim.research);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Makmal Penyelidikan Kejuruteraan</h2>
              <p className="text-xs text-slate-400">Penyelidikan Teknologi Bahan, SCADA & Grid Pintar</p>
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
            {researchList.map((node) => {
              const canAfford = sim.funds >= node.cost;
              const hasRequirement = !node.requiredTechId || (sim.research[node.requiredTechId]?.completed ?? false);

              return (
                <div
                  key={node.id}
                  className={`border rounded-xl p-4.5 flex flex-col justify-between transition ${
                    node.completed
                      ? 'bg-slate-950/40 border-emerald-500/40'
                      : node.isResearching
                      ? 'bg-purple-950/20 border-purple-500/50'
                      : canAfford && hasRequirement
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-100 text-base">{node.name}</h4>
                      {node.completed ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5" /> Selesai
                        </span>
                      ) : node.isResearching ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                          <Clock className="w-3.5 h-3.5" /> Sedang Dijalankan
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-400 tabular-nums bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          RM {node.cost.toLocaleString('ms-MY')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>
                    <div className="text-xs text-purple-300 font-semibold bg-purple-950/40 border border-purple-800/40 px-2.5 py-1.5 rounded-lg">
                      {node.perkDescription}
                    </div>

                    {/* Progress Bar when researching */}
                    {node.isResearching && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] text-purple-300 font-semibold">
                          <span>Kemajuan Penyelidikan</span>
                          <span className="tabular-nums">{Math.round(node.progressPercent)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${node.progressPercent}%` }}
                            className="h-full bg-purple-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {node.researchTimeSeconds} saat
                    </span>

                    {!node.completed && !node.isResearching && (
                      <button
                        onClick={() => startResearch(node.id)}
                        disabled={!canAfford || !hasRequirement}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          canAfford && hasRequirement
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Microscope className="w-3.5 h-3.5" /> Mula Penyelidikan
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

/**
 * DAMVERSE - Pause Menu Modal
 * Clean pause dialog with resume, manual save, settings, and menu options.
 */

import React from 'react';
import { Play, Save, Settings, Home, RotateCcw } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onSave: () => void;
  onOpenSettings: () => void;
  onReturnToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onSave,
  onOpenSettings,
  onReturnToTitle,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase">PERMAINAN DIJEDA</h2>
          <p className="text-xs text-slate-400 mt-1">Operasi empangan dihentikan seketika</p>
        </div>

        {/* Buttons List */}
        <div className="w-full space-y-2.5 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Sambung Operasi
          </button>

          <button
            onClick={onSave}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-emerald-400" /> Simpan Kemajuan
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4 text-sky-400" /> Tetapan & Grafik
          </button>

          <button
            onClick={onReturnToTitle}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Kembali ke Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};

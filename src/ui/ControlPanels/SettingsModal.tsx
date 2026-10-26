/**
 * DAMVERSE - Settings & Save/Load System Modal
 * Graphics quality presets, audio synthesis volumes, manual save, and tutorial reset.
 */

import React, { useState } from 'react';
import { GameSettings, GraphicsQuality, WeatherType } from '../../types/game';
import {
  X,
  Settings,
  Monitor,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  BookOpen,
  CloudSun,
  Check,
  Smartphone,
} from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  setWeather: (w: WeatherType) => void;
  saveGameNow: () => boolean;
  resetGameNow: () => void;
  openTutorial: () => void;
  openAndroidInstall: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  updateSettings,
  setWeather,
  saveGameNow,
  resetGameNow,
  openTutorial,
  openAndroidInstall,
  onClose,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    const ok = saveGameNow();
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleReset = () => {
    resetGameNow();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Tetapan Permainan DAMVERSE</h2>
              <p className="text-xs text-slate-400">Kualiti Grafik, Audio Prosedural, Cuaca & Simpanan Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* 1. Graphics Quality */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-sky-400" /> Kualiti Grafik WebGL
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['rendah', 'sederhana', 'tinggi'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => updateSettings({ graphicsQuality: q })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition ${
                    settings.graphicsQuality === q
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {q === 'rendah' ? 'Rendah (Pantas)' : q === 'sederhana' ? 'Sederhana' : 'Tinggi (Penuh)'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Audio Settings */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              Audio Prosedural Web Audio
            </h3>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Kesan Bunyi (Air, Turbin, Enjin, Ribut)</span>
                <button
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    settings.soundEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {settings.soundEnabled ? 'DIHIDUPKAN' : 'DIMATIKAN'}
                </button>
              </div>

              {settings.soundEnabled && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Kelantangan Utama</span>
                    <span>{Math.round(settings.masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.masterVolume}
                    onChange={(e) => updateSettings({ masterVolume: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Weather Simulation Override */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-amber-400" /> Uji Mod Cuaca Simulasi
            </h3>
            <div className="grid grid-cols-5 gap-1.5">
              {(
                [
                  { id: 'cerah', label: 'Cerah' },
                  { id: 'mendung', label: 'Mendung' },
                  { id: 'hujan', label: 'Hujan' },
                  { id: 'ribut_tengkujuh', label: 'Ribut' },
                  { id: 'kemarau', label: 'Kemarau' },
                ] as const
              ).map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWeather(w.id)}
                  className="py-2 px-1 text-[11px] font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-center"
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Manual Save, Tutorial & Reset */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Berjaya Disimpan!' : 'Simpan Kemajuan Sekarang'}</span>
              </button>

              <button
                onClick={() => {
                  openTutorial();
                  onClose();
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Panduan Kejuruteraan</span>
              </button>

              <button
                onClick={() => {
                  openAndroidInstall();
                  onClose();
                }}
                className="px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pasang Aplikasi Android</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition ml-auto flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Semula Asal</span>
              </button>
            </div>

            {/* Reset confirmation modal */}
            {showResetConfirm && (
              <div className="bg-red-950/60 border border-red-500/50 p-4 rounded-xl space-y-3">
                <div className="text-xs text-red-200 leading-relaxed font-medium">
                  Adakah anda pasti mahu memadam semua rekod kemajuan empangan dan kembali ke keadaan awal?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow"
                  >
                    Ya, Padam & Mula Semula
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

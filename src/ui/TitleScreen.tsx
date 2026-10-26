/**
 * DAMVERSE - Cinematic Title Screen & Game Shell
 * Bespoke inline SVG logo lockup, interactive start CTA, and control hint line.
 */

import React, { useEffect } from 'react';
import { Play, BookOpen, Settings, Zap, Droplets, Smartphone } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onOpenAndroidInstall: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenTutorial,
  onOpenSettings,
  onOpenAndroidInstall,
}) => {
  // Listen for Enter / Space keys to start immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between items-center p-6 sm:p-10 bg-slate-950/70 select-none">
      {/* Top Spec Badge */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-widest font-extrabold text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span>SIMULASI EMPANGAN & TAMADUN HIDROELEKTRIK 3D</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </span>
      </div>

      {/* Center Hero Lockup (Over negative space) */}
      <div className="flex flex-col items-center text-center max-w-xl mx-auto space-y-6">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="relative flex flex-col items-center">
          <svg
            viewBox="0 0 540 120"
            className="w-full max-w-[460px] h-auto drop-shadow-[0_10px_25px_rgba(2,132,199,0.45)]"
          >
            <defs>
              <linearGradient id="damverseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Stylized Arch Dam Silhouette behind letters */}
            <path
              d="M 50 90 Q 270 20 490 90 L 510 110 L 30 110 Z"
              fill="rgba(30, 41, 59, 0.7)"
              stroke="#475569"
              strokeWidth="2"
            />

            {/* Curved Water Spillway Chutes */}
            <path
              d="M 220 55 L 210 110 M 270 45 L 270 110 M 320 55 L 330 110"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeDasharray="4 3"
              opacity="0.8"
            />

            {/* Main Title Typography */}
            <text
              x="270"
              y="85"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="68"
              letterSpacing="6"
              fill="url(#damverseGradient)"
            >
              DAMVERSE
            </text>
          </svg>

          {/* Subtitle */}
          <div className="text-xs sm:text-sm font-semibold tracking-wider text-slate-300 uppercase mt-1">
            Kuasai Air, Jana Tamadun · Pengurusan Tenaga Skala Mega
          </div>
        </div>

        {/* Start CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 w-full max-w-md justify-center">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto px-8 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-[0_0_30px_rgba(56,189,248,0.4)] transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Mula Bertugas</span>
          </button>

          <button
            onClick={onOpenAndroidInstall}
            className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Pasang Android</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="w-full sm:w-auto px-4 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Panduan</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full sm:w-auto p-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center"
            title="Tetapan"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Single Flat Control-Hint Line */}
      <div className="text-[11px] sm:text-xs font-medium text-slate-400 bg-slate-950/80 border border-slate-800/80 px-4 py-2 rounded-full tracking-wide text-center shadow-lg">
        WASD Bergerak · Shift Lari · Angkasa Lompat · E Masuk Kenderaan · Esc Jeda · Enter Mula
      </div>
    </div>
  );
};

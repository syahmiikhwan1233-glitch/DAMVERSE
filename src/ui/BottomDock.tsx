/**
 * DAMVERSE - Unified Collapsible Bottom Dock
 * Sleek bottom-center docked navigation bar providing access to all engineering,
 * economic, construction, research, and mission panels. Zero viewport clutter.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Activity,
  Hammer,
  Microscope,
  Target,
  Settings,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
} from 'lucide-react';

interface BottomDockProps {
  activeModal: string | null;
  openModal: (modal: string | null) => void;
  timeSpeed: number;
  setTimeSpeed: (speed: number) => void;
  isPaused: boolean;
  togglePause: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeModal,
  openModal,
  timeSpeed,
  setTimeSpeed,
  isPaused,
  togglePause,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: 'dam', label: 'Kawalan Empangan', icon: <Sliders className="w-4 h-4" /> },
    { id: 'grid', label: 'Grid & Kewangan', icon: <Activity className="w-4 h-4" /> },
    { id: 'construction', label: 'Penaiktarafan', icon: <Hammer className="w-4 h-4" /> },
    { id: 'research', label: 'Penyelidikan', icon: <Microscope className="w-4 h-4" /> },
    { id: 'missions', label: 'Misi & Kontrak', icon: <Target className="w-4 h-4" /> },
    { id: 'settings', label: 'Tetapan', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-[920px] px-3 pointer-events-none transition-all duration-300">
      <div className="flex flex-col items-center">
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="pointer-events-auto mb-1.5 px-3.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-full text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 shadow-lg transition active:scale-95"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" /> Papar Panel Kawalan
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> Mod Pemandangan (Sembunyi)
            </>
          )}
        </button>

        {/* Main Dock Container */}
        {!isCollapsed && (
          <div className="pointer-events-auto w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-1.5 sm:p-2 shadow-2xl flex flex-wrap items-center justify-between gap-1 sm:gap-2">
            {/* Simulation Speed & Pause Controls */}
            <div className="flex items-center gap-1 border-r border-slate-700/60 pr-2">
              <button
                onClick={togglePause}
                title={isPaused ? 'Sambung Operasi' : 'Jeda Operasi'}
                className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  isPaused
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                <span className="hidden sm:inline">{isPaused ? 'Sambung' : 'Jeda'}</span>
              </button>

              <div className="flex items-center bg-slate-800 rounded-xl p-0.5">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={`speed-${spd}`}
                    onClick={() => setTimeSpeed(spd)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      timeSpeed === spd
                        ? 'bg-sky-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Category Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
              {tabs.map((tab) => {
                const isActive = activeModal === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => openModal(isActive ? null : tab.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap ${
                      isActive
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-lg'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

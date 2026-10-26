/**
 * DAMVERSE - Master Application Container
 * Full-viewport Game Shell orchestrating the 3D WebGL world,
 * reactive simulation engine, and low-occlusion HUD.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from './state/gameStore';
import { WorldScene } from './world/WorldScene';
import { TitleScreen } from './ui/TitleScreen';
import { HUD } from './ui/HUD';
import { Minimap } from './ui/Minimap';
import { MobileControls } from './ui/MobileControls';
import { BottomDock } from './ui/BottomDock';
import { DamControlModal } from './ui/ControlPanels/DamControlModal';
import { GridFinanceModal } from './ui/ControlPanels/GridFinanceModal';
import { ConstructionModal } from './ui/ControlPanels/ConstructionModal';
import { ResearchModal } from './ui/ControlPanels/ResearchModal';
import { MissionsModal } from './ui/ControlPanels/MissionsModal';
import { SettingsModal } from './ui/ControlPanels/SettingsModal';
import { TutorialModal } from './ui/TutorialModal';
import { PauseModal } from './ui/PauseModal';
import { AndroidInstallModal } from './ui/AndroidInstallModal';
import { sound } from './audio/soundEngine';

export default function App() {
  const [gameMode, setGameMode] = useState<'title' | 'playing'>('title');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  const {
    sim,
    player,
    settings,
    isPaused,
    activeModal,
    setSpillwayOpening,
    toggleTurbine,
    setTurbineThrottle,
    repairTurbine,
    toggleScadaAuto,
    buildUpgrade,
    startResearch,
    toggleContract,
    claimMission,
    setTimeSpeed,
    setWeather,
    updateSettings,
    togglePause,
    openModal,
    enterOrExitVehicle,
    saveGameNow,
    resetGameNow,
    updatePlayerMovement,
  } = useGameStore();

  // Mobile input state bridge
  const mobileInputRef = useRef<{
    moveX: number;
    moveY: number;
    lookX: number;
    lookY: number;
    isSprint: boolean;
    isJump: boolean;
    isAction: boolean;
  }>({
    moveX: 0,
    moveY: 0,
    lookX: 0,
    lookY: 0,
    isSprint: false,
    isJump: false,
    isAction: false,
  });

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (activeModal) {
          openModal(null);
        } else if (showTutorial) {
          setShowTutorial(false);
        } else if (gameMode === 'playing') {
          togglePause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, showTutorial, gameMode, openModal, togglePause]);

  const handleStartGame = useCallback(() => {
    sound.init();
    sound.resumeContext();
    sound.playClick();
    setGameMode('playing');

    // First run tutorial check
    const hasSeenTutorial = localStorage.getItem('DAMVERSE_SEEN_TUTORIAL');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('DAMVERSE_SEEN_TUTORIAL', 'true');
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 1. MASTER 3D WORLD SCENE (Mounted continuously for zero re-mount flicker) */}
      <WorldScene
        sim={sim}
        player={player}
        settings={settings}
        updatePlayerMovement={updatePlayerMovement}
        enterOrExitVehicle={enterOrExitVehicle}
        mobileInputRef={mobileInputRef}
      />

      {/* 2. GAME SHELL: TITLE SCREEN */}
      {gameMode === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenTutorial={() => setShowTutorial(true)}
          onOpenSettings={() => openModal('settings')}
          onOpenAndroidInstall={() => setShowAndroidModal(true)}
        />
      )}

      {/* 3. GAME SHELL: PLAYING STATE HUD & MINIMAP */}
      {gameMode === 'playing' && (
        <>
          <HUD
            sim={sim}
            player={player}
            enterOrExitVehicle={enterOrExitVehicle}
            openModal={openModal}
          />

          {settings.showMinimap && (
            <Minimap
              player={player}
              reservoirLevel={sim.reservoirLevel}
              isFlooding={sim.isFloodingDownstream}
            />
          )}

          <MobileControls
            mobileInputRef={mobileInputRef}
            nearVehicle={player.nearVehicle}
            inVehicle={player.inVehicle}
          />

          <BottomDock
            activeModal={activeModal}
            openModal={openModal}
            timeSpeed={sim.timeSpeed}
            setTimeSpeed={setTimeSpeed}
            isPaused={isPaused}
            togglePause={togglePause}
          />
        </>
      )}

      {/* 4. MODAL CONTROL PANELS */}
      {activeModal === 'dam' && (
        <DamControlModal
          sim={sim}
          setSpillwayOpening={setSpillwayOpening}
          toggleTurbine={toggleTurbine}
          setTurbineThrottle={setTurbineThrottle}
          repairTurbine={repairTurbine}
          toggleScadaAuto={toggleScadaAuto}
          onClose={() => openModal(null)}
        />
      )}

      {activeModal === 'grid' && (
        <GridFinanceModal
          sim={sim}
          toggleContract={toggleContract}
          onClose={() => openModal(null)}
        />
      )}

      {activeModal === 'construction' && (
        <ConstructionModal
          sim={sim}
          buildUpgrade={buildUpgrade}
          onClose={() => openModal(null)}
        />
      )}

      {activeModal === 'research' && (
        <ResearchModal
          sim={sim}
          startResearch={startResearch}
          onClose={() => openModal(null)}
        />
      )}

      {activeModal === 'missions' && (
        <MissionsModal
          sim={sim}
          claimMission={claimMission}
          onClose={() => openModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          updateSettings={updateSettings}
          setWeather={setWeather}
          saveGameNow={saveGameNow}
          resetGameNow={resetGameNow}
          openTutorial={() => setShowTutorial(true)}
          openAndroidInstall={() => setShowAndroidModal(true)}
          onClose={() => openModal(null)}
        />
      )}

      {/* 5. ANDROID INSTALL MODAL */}
      {(showAndroidModal || activeModal === 'android') && (
        <AndroidInstallModal
          onClose={() => {
            setShowAndroidModal(false);
            if (activeModal === 'android') openModal(null);
          }}
        />
      )}

      {/* 6. TUTORIAL MODAL */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}

      {/* 7. PAUSE MENU */}
      {isPaused && !activeModal && !showTutorial && !showAndroidModal && gameMode === 'playing' && (
        <PauseModal
          onResume={togglePause}
          onSave={saveGameNow}
          onOpenSettings={() => openModal('settings')}
          onReturnToTitle={() => {
            setGameMode('title');
            togglePause();
          }}
        />
      )}
    </div>
  );
}

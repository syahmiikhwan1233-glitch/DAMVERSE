/**
 * DAMVERSE - Mobile Virtual Joystick & Touch Controls
 * Low-latency thumbstick, look pad, sprint, jump, and action buttons for touchscreen devices.
 */

import React, { useRef, useState, useEffect } from 'react';
import { FastForward, ArrowUp, Hand, Car } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface MobileControlsProps {
  mobileInputRef: React.MutableRefObject<{
    moveX: number;
    moveY: number;
    lookX: number;
    lookY: number;
    isSprint: boolean;
    isJump: boolean;
    isAction: boolean;
  }>;
  nearVehicle: boolean;
  inVehicle: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  mobileInputRef,
  nearVehicle,
  inVehicle,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);
  const [isSprintActive, setIsSprintActive] = useState(false);

  // Look pad tracking
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  // Joystick touch handlers
  const handleJoystickStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingJoystick(true);
    updateJoystick(e.targetTouches[0]);
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!isDraggingJoystick) return;
    e.stopPropagation();
    updateJoystick(e.targetTouches[0]);
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingJoystick(false);
    setKnobPos({ x: 0, y: 0 });
    mobileInputRef.current.moveX = 0;
    mobileInputRef.current.moveY = 0;
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const maxRadius = rect.width / 2 - 10;
    const distance = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;
    if (distance > maxRadius) {
      clampedX = (dx / distance) * maxRadius;
      clampedY = (dy / distance) * maxRadius;
    }

    setKnobPos({ x: clampedX, y: clampedY });
    mobileInputRef.current.moveX = clampedX / maxRadius;
    mobileInputRef.current.moveY = clampedY / maxRadius;
  };

  // Right-side look pad handlers
  const handleLookStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    lookTouchId.current = touch.identifier;
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };

        mobileInputRef.current.lookX = dx;
        mobileInputRef.current.lookY = dy;
        break;
      }
    }
  };

  const handleLookEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  };

  if (!isTouchDevice) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none">
      {/* 1. Virtual Joystick on Bottom-Left */}
      <div className="absolute bottom-20 left-6 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          className="w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-700 flex items-center justify-center relative touch-none shadow-2xl"
        >
          <div
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
            className="w-12 h-12 rounded-full bg-sky-500/80 border border-white/60 shadow-lg"
          />
        </div>
      </div>

      {/* 2. Touch Look Pad Area on Right-Center */}
      <div
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        className="absolute top-28 right-0 bottom-36 left-1/2 pointer-events-auto touch-none"
      />

      {/* 3. Action Buttons on Bottom-Right */}
      <div className="absolute bottom-20 right-6 flex flex-col gap-3 pointer-events-auto">
        {/* Sprint Button */}
        <button
          onClick={() => {
            const next = !isSprintActive;
            setIsSprintActive(next);
            mobileInputRef.current.isSprint = next;
            triggerHaptic(next ? 25 : 15);
          }}
          className={`w-12 h-12 rounded-full border shadow-lg flex items-center justify-center text-xs font-bold transition active:scale-95 ${
            isSprintActive
              ? 'bg-amber-500 border-amber-300 text-slate-950'
              : 'bg-slate-900/70 border-slate-600 text-slate-200'
          }`}
        >
          <FastForward className="w-5 h-5" />
        </button>

        {/* Jump Button */}
        <button
          onClick={() => {
            triggerHaptic(20);
            mobileInputRef.current.isJump = true;
            setTimeout(() => {
              mobileInputRef.current.isJump = false;
            }, 100);
          }}
          className="w-12 h-12 rounded-full bg-slate-900/70 border border-slate-600 text-slate-200 shadow-lg flex items-center justify-center active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Interact / Vehicle Button */}
        {(nearVehicle || inVehicle) && (
          <button
            onClick={() => {
              triggerHaptic([30, 20, 30]);
              mobileInputRef.current.isAction = true;
            }}
            className="w-12 h-12 rounded-full bg-amber-500 border border-amber-300 text-slate-950 shadow-xl flex items-center justify-center active:scale-95"
          >
            {inVehicle ? <Hand className="w-5 h-5" /> : <Car className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

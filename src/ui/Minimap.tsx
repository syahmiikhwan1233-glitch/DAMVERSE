/**
 * DAMVERSE - Live Dynamic 2D Tactical Minimap
 * Renders the reservoir lake, dam wall, river canyon, city zones,
 * and real-time player/vehicle telemetry coordinates.
 */

import React, { useEffect, useRef } from 'react';
import { PlayerState } from '../types/game';
import { Navigation, Compass } from 'lucide-react';

interface MinimapProps {
  player: PlayerState;
  reservoirLevel: number;
  isFlooding: boolean;
}

export const Minimap: React.FC<MinimapProps> = ({
  player,
  isFlooding,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Map bounds:
    // World coordinates: X from -150 to +150, Z from -320 to +200
    // Center dam at Z=0
    const toCanvasX = (wx: number) => {
      return (wx + 150) * (width / 300);
    };

    const toCanvasY = (wz: number) => {
      // Invert Z because Z>0 is upstream (north/top of map)
      return height - (wz + 320) * (height / 520);
    };

    // 1. Upstream Reservoir Lake (Z: 0 to 200, X: -60 to 60)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(toCanvasX(-55), toCanvasY(0));
    ctx.lineTo(toCanvasX(-65), toCanvasY(180));
    ctx.lineTo(toCanvasX(65), toCanvasY(180));
    ctx.lineTo(toCanvasX(55), toCanvasY(0));
    ctx.closePath();
    ctx.fill();

    // 2. Downstream River (Z: 0 to -310)
    ctx.strokeStyle = isFlooding ? '#78350f' : '#0284c7';
    ctx.lineWidth = isFlooding ? 10 : 6;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(-20));
    ctx.bezierCurveTo(
      toCanvasX(10), toCanvasY(-90),
      toCanvasX(-5), toCanvasY(-180),
      toCanvasX(5), toCanvasY(-310)
    );
    ctx.stroke();

    // 3. Concrete Dam Monolith Wall (Z=0, X: -55 to 55)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(-55), toCanvasY(0));
    ctx.lineTo(toCanvasX(55), toCanvasY(0));
    ctx.stroke();

    // 4. Powerhouse Footprint (X: -20 to 20, Z: -25)
    ctx.fillStyle = '#334155';
    ctx.fillRect(toCanvasX(-20), toCanvasY(-20), 40 * (width / 300), 12);

    // 5. Kampung Hilir Zone
    ctx.fillStyle = '#15803d';
    ctx.fillRect(toCanvasX(25), toCanvasY(-130), 25, 20);
    ctx.fillStyle = '#86efac';
    ctx.font = '8px sans-serif';
    ctx.fillText('Kg Hilir', toCanvasX(26), toCanvasY(-125));

    // 6. Bandar Mahameru Zone
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(toCanvasX(-120), toCanvasY(-180), 45, 45);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Bdr Mahameru', toCanvasX(-120), toCanvasY(-175));

    // 7. Zon Perindustrian
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(toCanvasX(70), toCanvasY(-220), 35, 30);
    ctx.fillStyle = '#fca5a5';
    ctx.fillText('Industri', toCanvasX(72), toCanvasY(-215));

    // 8. Vehicle Marker
    const vx = toCanvasX(player.vehiclePosition[0]);
    const vy = toCanvasY(player.vehiclePosition[2]);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(vx, vy, 4, 0, Math.PI * 2);
    ctx.fill();

    // 9. Player Marker
    const px = toCanvasX(player.position[0]);
    const py = toCanvasY(player.position[2]);

    // Direction cone
    ctx.save();
    ctx.translate(px, py);
    // Adjust rotation for canvas
    ctx.rotate(-player.rotationY);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 5);
    ctx.lineTo(0, 3);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Player central dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Grid border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, width, height);
  }, [player.position, player.rotationY, player.vehiclePosition, isFlooding]);

  return (
    <div className="absolute top-20 right-4 sm:top-24 sm:right-6 pointer-events-auto z-20">
      <div className="relative bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 shadow-2xl backdrop-blur-none">
        {/* Compass Header */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 px-1">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-400" /> Peta Radar
          </span>
          <span className="text-amber-400 font-extrabold flex items-center gap-0.5">
            <Navigation className="w-3 h-3 rotate-45" /> U
          </span>
        </div>

        {/* 2D Canvas */}
        <canvas
          ref={canvasRef}
          width={150}
          height={160}
          className="rounded-lg bg-slate-950 block shadow-inner"
        />

        {/* Legend pills */}
        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5 px-0.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Anda
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Trak 4x4
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Empangan
          </span>
        </div>
      </div>
    </div>
  );
};

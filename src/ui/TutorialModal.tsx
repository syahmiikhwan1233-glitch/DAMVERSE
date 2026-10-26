/**
 * DAMVERSE - Interactive First-Run Engineering Tutorial Modal
 * 4-step onboarding guide in Bahasa Melayu for new dam chief engineers.
 */

import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Droplets, Zap, ShieldAlert, Car } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: 'Selamat Datang ke Empangan Hidroelektrik DAMVERSE',
      icon: <Droplets className="w-6 h-6 text-sky-400" />,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Anda telah dilantik sebagai <strong>Ketua Jurutera Kuasa Hidroelektrik</strong> untuk menguruskan empangan gergasi ini dan memacu tamadun di sekitarnya.
          </p>
          <p>
            Empangan ini membekalkan tenaga elektrik bersih kepada <strong>Bandar Mahameru</strong> dan <strong>Zon Perindustrian Lembah Hijau</strong>, di samping membekalkan air minuman kepada penduduk kampung hilir.
          </p>
        </div>
      ),
    },
    {
      title: 'Pengurusan Takungan & Alur Limpah (Spillway)',
      icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Perhatikan paras takungan empangan. Paras selamat ialah antara <strong>12.0m hingga 28.0m</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Jika paras melebihi <strong>28.5m</strong>, buka Pintu Alur Limpah untuk mengelakkan air melimpah di atas jambatan empangan!</li>
            <li>Namun awas! Jika jumlah pelepasan air melebihi <strong>850 m³/s</strong>, sungai akan melimpah dan menenggelamkan <strong>Kampung Hilir</strong>!</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Penjanaan Elektrik & Grid Kuasa',
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Stesen Janakuasa dilengkapi <strong>4 Unit Penjana Turbin Francis</strong> berkapasiti 60 MW setiap satu (Jumlah 240 MW).
          </p>
          <p>
            Pastikan jumlah kuasa jana sentiasa sepadan dengan permintaan grid (sekitar 110 MW siang / 70 MW malam) untuk memastikan frekuensi grid kekal stabil pada <strong>50.00 Hz</strong> dan mengelakkan gangguan bekalan elektrik (blackout).
          </p>
        </div>
      ),
    },
    {
      title: 'Kawalan Pergerakan & Trak Penyelenggaraan 4x4',
      icon: <Car className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Gunakan kekunci <strong>W, A, S, D</strong> atau kayu bedik maya di skrin sentuh untuk bergerak, dan <strong>Shift</strong> untuk berlari laju.
          </p>
          <p>
            Hampiri trak 4x4 di atas jalan empangan dan tekan <strong>E</strong> (atau butang Trak di skrin) untuk memandu menyusuri jalan curam gunung turun ke stesen jana kuasa, kampung hilir, dan bandar raya!
          </p>
        </div>
      ),
    },
  ];

  const current = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              {current.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                Langkah {step} daripada {steps.length}
              </span>
              <h3 className="text-base font-bold text-slate-100 leading-snug">{current.title}</h3>
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
        <div className="p-6">{current.content}</div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Sebelum
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === i + 1 ? 'w-6 bg-sky-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {step < steps.length ? (
            <button
              onClick={() => setStep((s) => Math.min(steps.length, s + 1))}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md flex items-center gap-1.5 transition"
            >
              Seterusnya <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md flex items-center gap-1.5 transition"
            >
              Faham & Mula Bertugas <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

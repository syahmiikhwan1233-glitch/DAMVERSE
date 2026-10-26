/**
 * DAMVERSE - Android App Install & Guide Modal
 * Guides users on installing DAMVERSE as a native Android app / PWA on their device.
 */

import React from 'react';
import { X, Smartphone, Download, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Pasang Aplikasi Android</h3>
              <p className="text-xs text-slate-400">Main di telefon tanpa sambungan bar carian</p>
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
        <div className="p-5 space-y-4">
          {/* App preview badge */}
          <div className="flex items-center gap-3.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <img
              src="/pwa-192x192.png"
              alt="DAMVERSE Icon"
              className="w-14 h-14 rounded-2xl shadow-md border border-slate-700 object-cover"
            />
            <div>
              <h4 className="font-extrabold text-sm text-slate-100">DAMVERSE 3D</h4>
              <p className="text-xs text-sky-400 font-semibold">Simulasi Hidroelektrik & Tamadun</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>PWA Rasmi Android · Luar Talian (Offline)</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Pengalaman skrin penuh 60 FPS tanpa bingkai pelayar.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Sokongan getaran haptik (*haptic feedback*) semasa pemanduan & amaran.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Boleh dimainkan walaupun semasa tiada capaian internet.</span>
            </div>
          </div>

          {/* Direct Install CTA or Manual Guide */}
          {isInstalled ? (
            <div className="bg-emerald-950/40 border border-emerald-500/50 p-3.5 rounded-xl text-center text-xs font-bold text-emerald-300">
              Aplikasi telah berjaya dipasang pada peranti anda!
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Pasang Sekarang ke Android
            </button>
          ) : isIOS ? (
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 text-slate-300">
              <div className="font-bold text-sky-400">Pemasangan di iOS Safari:</div>
              <div>1. Tekan butang <strong>Kongsi (Share)</strong> di bar Safari.</div>
              <div>2. Pilih <strong>Tambah ke Skrin Utama (Add to Home Screen)</strong>.</div>
            </div>
          ) : (
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 text-slate-300">
              <div className="font-bold text-amber-400">Cara Memasang di Google Chrome Android:</div>
              <div>1. Tekan menu tiga titik (⋮) di penjuru atas kanan pelayar.</div>
              <div>2. Tekan <strong>"Pasang aplikasi"</strong> atau <strong>"Tambah ke Skrin utama"</strong>.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import type { AppModule } from '../../types/math';
import { Percent, Sigma, Trophy, BookOpen, Download, HelpCircle, Menu, X, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeModule: AppModule;
  onSelectModule: (module: AppModule) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeModule, onSelectModule }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const navItems = [
    {
      id: 'prozent' as AppModule,
      label: 'Prozent-Explorer',
      sublabel: 'Grundwert, Satz & Dreisatz',
      icon: Percent,
      color: 'from-amber-500 to-rose-500'
    },
    {
      id: 'integral' as AppModule,
      label: 'Integral-Visualizer',
      sublabel: 'Graphen, Flächen & HDI',
      icon: Sigma,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'quiz' as AppModule,
      label: 'Mathe-Challenge',
      sublabel: 'Interaktiver Wissenstrainer',
      icon: Trophy,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'formeln' as AppModule,
      label: 'Formelsammlung',
      sublabel: 'Spickzettel & Regeln',
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => onSelectModule('prozent')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-cyan-300 text-xl font-mono">
                  M∫%
                </span>
              </div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                MatheVisual
                <span className="text-[10px] uppercase font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Interaktives Mathe-Labor</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* PWA Install Button */}
            {installPrompt && (
              <button
                onClick={handleInstallPWA}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                App installieren
              </button>
            )}

            {/* Info / About Modal trigger */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Über MatheVisual"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900/50'
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} text-white`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.sublabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Über MatheVisual
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>MatheVisual</strong> ist eine moderne Lernplattform, die mathematische Zusammenhänge interaktiv und greifbar macht:
            </p>

            <ul className="text-xs text-slate-300 space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 list-disc list-inside">
              <li><strong>Prozentrechnung:</strong> Magisches Dreieck, 100er-Waffelgitter, 3-Schritte-Dreisatz und echte Alltagsszenarien (Rabatt, Mehrwertsteuer, Trinkgeld).</li>
              <li><strong>Integralrechnung:</strong> Interaktive Kurvenflächen, Riemann-Summen mit variabler Streifenanzahl, HDI und Flächen zwischen Kurven.</li>
              <li><strong>Quiz & Challenge:</strong> Gamifizierter Wissenstrainer mit Streaks, Konfetti und Erklärungen.</li>
              <li><strong>Offline-Fähigkeit:</strong> Funktioniert komplett ohne Internet als Progressive Web App (PWA).</li>
            </ul>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                Loslegen & Experimentieren
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

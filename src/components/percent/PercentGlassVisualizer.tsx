import React, { useState, useEffect, useRef } from 'react';
import { GlassWater, BatteryMedium, Sparkles, Droplets } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const PercentGlassVisualizer: React.FC = () => {
  const [glassCapacity, setGlassCapacity] = useState<number>(500); // 500 ml
  const [fillPercent, setFillPercent] = useState<number>(40); // 40%
  const [mode, setMode] = useState<'water' | 'battery'>('water');

  // Animation frame for undulating water waves
  const [wavePhase, setWavePhase] = useState<number>(0);
  const [waveIntensity, setWaveIntensity] = useState<number>(1);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let phase = 0;
    const animateWaves = () => {
      phase += 0.06;
      setWavePhase(phase);
      animRef.current = requestAnimationFrame(animateWaves);
    };
    animRef.current = requestAnimationFrame(animateWaves);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleFillChange = (val: number) => {
    setFillPercent(val);
    setWaveIntensity(2.5); // Slosh higher on movement
    setTimeout(() => setWaveIntensity(1), 400);
    sounds.playWaterPour(val / 100);
  };

  const handlePresetClick = (p: number) => {
    setFillPercent(p);
    setWaveIntensity(3.5);
    setTimeout(() => setWaveIntensity(1), 600);
    sounds.playWaterPour(p / 100);
  };

  const currentAmount = (glassCapacity * fillPercent) / 100;

  // Generate dynamic wave SVG path
  const generateWavePath = () => {
    const width = 160;
    const height = 260;
    const waterLevelY = height - (fillPercent / 100) * height;

    if (fillPercent <= 0) return '';
    if (fillPercent >= 100) {
      return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
    }

    const amplitude = 4 * waveIntensity;
    const frequency = 0.035;

    let path = `M 0 ${waterLevelY}`;
    for (let x = 0; x <= width; x += 4) {
      const y = waterLevelY + Math.sin(x * frequency + wavePhase) * amplitude;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${width} ${height} L 0 ${height} Z`;
    return path;
  };

  const generateSecondWavePath = () => {
    const width = 160;
    const height = 260;
    const waterLevelY = height - (fillPercent / 100) * height;

    if (fillPercent <= 0 || fillPercent >= 100) return '';

    const amplitude = 3 * waveIntensity;
    const frequency = 0.04;

    let path = `M 0 ${waterLevelY}`;
    for (let x = 0; x <= width; x += 4) {
      const y = waterLevelY + Math.cos(x * frequency + wavePhase * 1.2) * amplitude;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${width} ${height} L 0 ${height} Z`;
    return path;
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Füllstand & Intuition
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Das Füllstands-Labor: Wie "voll" ist etwas?
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Vergiss alle Formeln! Prozent bedeutet einfach nur: <strong>Wie voll ist ein Gefäß oder Akku im Vergleich zum Ganzen?</strong>
          </p>
        </div>

        {/* Mode switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => {
              sounds.playPop();
              setMode('water');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              mode === 'water' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GlassWater className="w-4 h-4" />
            Wasserglas (mit Wellen)
          </button>
          <button
            onClick={() => {
              sounds.playPop();
              setMode('battery');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              mode === 'battery' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BatteryMedium className="w-4 h-4" />
            Smartphone-Akku
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive Visual Glass / Battery with Fluid Wave Simulation */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-3xl border border-slate-800 relative">
          {mode === 'water' ? (
            /* Measuring Cup / Water Glass with undulating waves */
            <div className="relative w-44 h-72 border-4 border-slate-600/80 border-t-0 rounded-b-3xl overflow-hidden bg-slate-900/60 shadow-2xl flex flex-col justify-end">
              {/* Measurement Scale Markings on Glass */}
              <div className="absolute inset-y-0 left-2 flex flex-col justify-between py-4 pointer-events-none text-[10px] font-mono text-slate-400 z-20">
                <span>100% ({glassCapacity} ml)</span>
                <span>75% ({Math.round(glassCapacity * 0.75)} ml)</span>
                <span>50% ({Math.round(glassCapacity * 0.5)} ml)</span>
                <span>25% ({Math.round(glassCapacity * 0.25)} ml)</span>
                <span>0% (0 ml)</span>
              </div>

              {/* Dynamic SVG Water Wave */}
              <svg viewBox="0 0 160 260" className="w-full h-full absolute inset-0">
                <defs>
                  <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8" />
                    <stop offset="40%" stop-color="#0284c7" />
                    <stop offset="100%" stop-color="#0369a1" />
                  </linearGradient>
                  <linearGradient id="backWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#0284c7" stop-opacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Back Wave */}
                {fillPercent > 0 && (
                  <path d={generateSecondWavePath()} fill="url(#backWaveGrad)" />
                )}

                {/* Front Wave */}
                {fillPercent > 0 && (
                  <path d={generateWavePath()} fill="url(#waterGrad)" />
                )}

                {/* Rising bubble particles */}
                {fillPercent > 15 && (
                  <>
                    <circle
                      cx="60"
                      cy={260 - (fillPercent / 100) * 260 + (wavePhase * 25) % 180}
                      r="3"
                      fill="rgba(255,255,255,0.4)"
                    />
                    <circle
                      cx="110"
                      cy={260 - (fillPercent / 100) * 260 + ((wavePhase * 35) + 40) % 180}
                      r="2"
                      fill="rgba(255,255,255,0.3)"
                    />
                    <circle
                      cx="80"
                      cy={260 - (fillPercent / 100) * 260 + ((wavePhase * 20) + 80) % 180}
                      r="3.5"
                      fill="rgba(255,255,255,0.35)"
                    />
                  </>
                )}
              </svg>

              {/* Floating Center Numbers */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white drop-shadow-md z-10">
                {fillPercent > 12 && (
                  <>
                    <span className="font-extrabold text-3xl font-mono text-white tracking-tight">
                      {fillPercent}%
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-200">
                      {currentAmount.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ml
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Smartphone Battery Visualizer */
            <div className="relative flex flex-col items-center">
              <div className="w-12 h-3 bg-slate-600 rounded-t-md" />
              <div className="w-48 h-64 border-4 border-slate-600 rounded-2xl p-2 bg-slate-900/80 shadow-2xl flex flex-col justify-end overflow-hidden relative">
                <div
                  className={`w-full rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-white relative overflow-hidden ${
                    fillPercent < 20
                      ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                      : fillPercent < 50
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                      : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                  }`}
                  style={{ height: `${fillPercent}%` }}
                >
                  {/* Energy Sparkle Bar */}
                  <div className="absolute top-0 inset-x-0 h-2 bg-white/40 animate-pulse" />

                  {fillPercent > 10 && (
                    <>
                      <span className="font-extrabold text-3xl font-mono text-white drop-shadow">
                        {fillPercent}%
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-100 drop-shadow">
                        {currentAmount.toLocaleString('de-DE', { maximumFractionDigits: 0 })} mAh
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-slate-400 text-center font-mono">
            {fillPercent === 0 ? 'Vollkommen leer (0%)' : fillPercent === 100 ? 'Randvoll (100%)' : `${fillPercent}% gefüllt`}
          </div>
        </div>

        {/* Intuitive Controls and AHA-Moments */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Slider: How Full? */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Füllstand verändern ({fillPercent}%):
              </span>
              <span className="font-mono text-2xl font-extrabold text-cyan-400 bg-cyan-950/80 px-4 py-1 rounded-xl border border-cyan-800/80">
                {fillPercent}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={fillPercent}
              onChange={(e) => handleFillChange(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { p: 25, label: '¼ (Viertel)' },
                { p: 50, label: '½ (Halb voll)' },
                { p: 75, label: '¾ (Dreiviertel)' },
                { p: 100, label: 'Voll (100%)' }
              ].map(btn => (
                <button
                  key={btn.p}
                  onClick={() => handlePresetClick(btn.p)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                    fillPercent === btn.p
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>{btn.p}%</div>
                  <div className="text-[10px] opacity-75 font-normal">{btn.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Slider: Capacity of the container (Grundwert) */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>Fassungsvermögen des ganzen Gefäßes (Das Ganze):</span>
              <span className="text-white font-bold text-sm">
                {glassCapacity} {mode === 'water' ? 'ml' : 'mAh'}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={glassCapacity}
              onChange={(e) => {
                setGlassCapacity(Number(e.target.value));
                sounds.playPop();
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* The Core AHA-Moment Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Der "Aha!"-Moment für dein Verständnis:
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>50%</strong> bedeutet immer genau <strong>"halb voll"</strong> – ganz egal, wie riesig oder winzig das Glas ist!
            </p>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono">Im Glas befinden sich gerade:</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  {currentAmount.toLocaleString('de-DE', { maximumFractionDigits: 1 })} {mode === 'water' ? 'ml' : 'mAh'}
                </span>
              </div>
              <div className="text-right text-slate-400 text-xs">
                Das sind genau <strong>{fillPercent}%</strong> von <strong>{glassCapacity} {mode === 'water' ? 'ml' : 'mAh'}</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

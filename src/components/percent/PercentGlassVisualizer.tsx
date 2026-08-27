import React, { useState, useEffect, useRef } from 'react';
import {
  GlassWater,
  BatteryMedium,
  Sparkles,
  Droplets,
  Edit3,
  Maximize2,
  Minimize2,
  Clock
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const PercentGlassVisualizer: React.FC = () => {
  const [glassCapacity, setGlassCapacity] = useState<number>(500); // e.g. 500 ml
  const [unit, setUnit] = useState<string>('ml');
  const [fillPercent, setFillPercent] = useState<number>(30); // 30% default for demonstration
  const [mode, setMode] = useState<'water' | 'battery'>('water');
  const [totalHours100Percent, setTotalHours100Percent] = useState<number>(10); // 100% = 10 hours
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    sounds.playPop();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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
    setWaveIntensity(2.5);
    setTimeout(() => setWaveIntensity(1), 400);
    sounds.playWaterPour(val / 100);
  };

  const handlePresetClick = (p: number) => {
    setFillPercent(p);
    setWaveIntensity(3.5);
    setTimeout(() => setWaveIntensity(1), 600);
    sounds.playWaterPour(p / 100);
  };

  const handleCapacityPreset = (
    cap: number,
    customUnit: string,
    targetMode: 'water' | 'battery',
    defaultHours: number
  ) => {
    sounds.playPop();
    setGlassCapacity(cap);
    setUnit(customUnit);
    setMode(targetMode);
    setTotalHours100Percent(defaultHours);
  };

  // Math Calculations:
  // 1. Current amount (Prozentwert)
  const currentAmount = (glassCapacity * fillPercent) / 100;

  // 2. Remaining Runtime (Wie lange hält es insgesamt?)
  // If 100% = totalHours100Percent, then p% = totalHours100Percent * (p / 100)
  const remainingHours = (totalHours100Percent * fillPercent) / 100;
  const remainingMinutes = Math.round(remainingHours * 60);
  const hoursPart = Math.floor(remainingMinutes / 60);
  const minutesPart = remainingMinutes % 60;

  // 3. Consumption rate per hour (Verbrauch pro Stunde)
  const ratePerHour = totalHours100Percent > 0 ? glassCapacity / totalHours100Percent : 0;
  const percentPerHour = totalHours100Percent > 0 ? 100 / totalHours100Percent : 0;

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
    <div
      ref={containerRef}
      className={`bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-6 sm:p-10 overflow-y-auto w-screen h-screen rounded-none'
          : ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Füllstand & Laufzeit
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Füllstand & Gesamtlaufzeit-Labor
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Rechne <strong>Füllstand in Prozent</strong> direkt in <strong>Menge und Restlaufzeit (Wie lange hält es insgesamt?)</strong> um!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode switcher */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => {
                sounds.playPop();
                setMode('water');
                setUnit('ml');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                mode === 'water' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GlassWater className="w-4 h-4" />
              Flüssigkeit & Tank
            </button>
            <button
              onClick={() => {
                sounds.playPop();
                setMode('battery');
                setUnit('mAh');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                mode === 'battery' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BatteryMedium className="w-4 h-4" />
              Akku & Batterie
            </button>
          </div>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center shadow-lg ${
              isFullscreen
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isFullscreen ? 'Vollbildmodus beenden' : 'Vollbildmodus starten'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grundwert & Gesamtdauer Quick-Presets */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span>Schnellauswahl für den Unterricht (100 % = Grundwert & Gesamtdauer):</span>
          </div>
        </div>

        {/* Fast presets */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[
            { cap: 500, label: '500 ml Flasche (hält 10 Std.)', unit: 'ml', mode: 'water' as const, hours: 10 },
            { cap: 100, label: '100 Liter Tank (hält 100 Std.)', unit: 'l', mode: 'water' as const, hours: 100 },
            { cap: 4000, label: '4.000 mAh Smartphone (hält 10 Std.)', unit: 'mAh', mode: 'battery' as const, hours: 10 },
            { cap: 5000, label: '5.000 mAh Akku (hält 20 Std.)', unit: 'mAh', mode: 'battery' as const, hours: 20 },
            { cap: 10000, label: '10.000 mAh Powerbank (hält 100 Std.)', unit: 'mAh', mode: 'battery' as const, hours: 100 }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleCapacityPreset(item.cap, item.unit, item.mode, item.hours)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                glassCapacity === item.cap && unit === item.unit && totalHours100Percent === item.hours
                  ? 'bg-cyan-600 border-cyan-400 text-white font-bold shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom inputs: Capacity & Total Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-mono">Gesamtmenge (100%):</span>
            <input
              type="number"
              min="1"
              max="1000000"
              value={glassCapacity}
              onChange={(e) => {
                setGlassCapacity(Math.max(1, Number(e.target.value)));
                sounds.playPop();
              }}
              className="w-24 bg-slate-950 border border-slate-600 rounded-lg px-2 py-1 text-white font-mono text-sm font-bold focus:outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Einheit"
              className="w-16 bg-slate-950 border border-slate-600 rounded-lg px-2 py-1 text-cyan-300 font-mono text-xs font-bold focus:outline-none focus:border-cyan-400 text-center"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-400 font-mono">Bei 100% hält es insgesamt:</span>
            <input
              type="number"
              min="0.1"
              step="0.5"
              max="1000"
              value={totalHours100Percent}
              onChange={(e) => {
                setTotalHours100Percent(Math.max(0.1, Number(e.target.value)));
                sounds.playPop();
              }}
              className="w-20 bg-slate-950 border border-slate-600 rounded-lg px-2 py-1 text-amber-300 font-mono text-sm font-bold focus:outline-none focus:border-amber-400"
            />
            <span className="text-xs text-slate-300 font-mono">Stunden</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive Visual Glass / Battery with Fluid Wave Simulation */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-3xl border border-slate-800 relative">
          {mode === 'water' ? (
            <div className="relative w-48 h-72 border-4 border-slate-600/80 border-t-0 rounded-b-3xl overflow-hidden bg-slate-900/60 shadow-2xl flex flex-col justify-end">
              {/* Measurement Scale Markings on Glass */}
              <div className="absolute inset-y-0 left-2 flex flex-col justify-between py-4 pointer-events-none text-[10px] font-mono text-slate-400 z-20">
                <span>100% ({glassCapacity} {unit})</span>
                <span>75% ({Math.round(glassCapacity * 0.75)} {unit})</span>
                <span>50% ({Math.round(glassCapacity * 0.5)} {unit})</span>
                <span>25% ({Math.round(glassCapacity * 0.25)} {unit})</span>
                <span>0% (0 {unit})</span>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white drop-shadow-md z-10 text-center px-2">
                {fillPercent > 10 && (
                  <>
                    <span className="font-extrabold text-3xl font-mono text-white tracking-tight">
                      {fillPercent}%
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-200">
                      {currentAmount.toLocaleString('de-DE', { maximumFractionDigits: 2 })} {unit}
                    </span>
                    <span className="mt-1 text-[11px] font-mono font-extrabold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-amber-500/40">
                      ⏱️ {remainingHours.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Std.
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
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
                  <div className="absolute top-0 inset-x-0 h-2 bg-white/40 animate-pulse" />

                  {fillPercent > 10 && (
                    <>
                      <span className="font-extrabold text-3xl font-mono text-white drop-shadow">
                        {fillPercent}%
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-100 drop-shadow">
                        {currentAmount.toLocaleString('de-DE', { maximumFractionDigits: 2 })} {unit}
                      </span>
                      <span className="mt-1 text-[11px] font-mono font-extrabold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-amber-500/40">
                        ⏱️ {remainingHours.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Std.
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-slate-400 text-center font-mono space-y-0.5">
            <div>
              {fillPercent === 0
                ? 'Vollkommen leer (0 %)'
                : fillPercent === 100
                ? `Randvoll (100 % = ${glassCapacity} ${unit} / ${totalHours100Percent} h)`
                : `${fillPercent} % gefüllt`}
            </div>
            <div className="text-cyan-300 font-bold">
              ⏱️ Hält noch: {remainingHours.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Stunden ({hoursPart} h {minutesPart} min)
            </div>
          </div>
        </div>

        {/* Intuitive Controls and AHA-Moments */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Slider: How Full? */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Füllstand einstellen ({fillPercent}%):
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

            {/* Quick percentage buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { p: 10, label: '10 % (⅒)' },
                { p: 30, label: '30 % (Typisch)' },
                { p: 50, label: '50 % (Halb)' },
                { p: 100, label: '100 % (Voll)' }
              ].map((btn) => (
                <button
                  key={btn.p}
                  onClick={() => handlePresetClick(btn.p)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                    fillPercent === btn.p
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">{btn.p}%</div>
                  <div className="text-[10px] opacity-75 font-normal">{btn.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* DREISATZ & LAUFZEIT-RECHNUNG (WIE LANGE INSGESAMT?) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Wie lange hält der Füllstand insgesamt?</span>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">
                Prozent-Laufzeitrechnung
              </span>
            </div>

            {/* 3 Result Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              {/* Card 1: Verbleibende Menge */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Verbleibende Menge</span>
                <strong className="text-cyan-300 text-base font-extrabold">
                  {currentAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {unit}
                </strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ({fillPercent} % von {glassCapacity} {unit})
                </span>
              </div>

              {/* Card 2: Restlaufzeit */}
              <div className="p-3 bg-slate-950 rounded-xl border-2 border-amber-500/60 shadow-lg shadow-amber-500/10">
                <span className="text-amber-400 block text-[10px] uppercase font-bold">⏱️ Restlaufzeit</span>
                <strong className="text-amber-300 text-base font-extrabold">
                  {remainingHours.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Std.
                </strong>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  ({hoursPart} Std. {minutesPart} Min.)
                </span>
              </div>

              {/* Card 3: Verbrauch pro Stunde */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Verbrauch pro Std.</span>
                <strong className="text-white text-base font-extrabold">
                  {ratePerHour.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {unit}/h
                </strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ({percentPerHour.toLocaleString('de-DE', { maximumFractionDigits: 1 })} % pro Stunde)
                </span>
              </div>
            </div>

            {/* Step-by-Step Educational Explanation */}
            <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Der Rechenweg für die Schüler:</span>
              </div>
              <div className="font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1 text-slate-200">
                <div>
                  • <strong>100 % (Grundwert G)</strong> = {totalHours100Percent} Stunden (volle {glassCapacity} {unit})
                </div>
                <div>
                  • <strong>1 %</strong> = {totalHours100Percent} Std. ÷ 100 = <strong>{(totalHours100Percent / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} Std.</strong>
                </div>
                <div className="text-amber-300 font-bold pt-0.5">
                  • <strong>{fillPercent} % (Prozentwert W)</strong> = {fillPercent} × {(totalHours100Percent / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} Std. = <span className="underline">{remainingHours.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Stunden</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

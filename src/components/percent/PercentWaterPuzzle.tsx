import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Maximize2,
  Minimize2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { MathRenderer } from '../common/MathRenderer';

export const PercentWaterPuzzle: React.FC = () => {
  // Das Glas fasst exakt 420 ml (Randvoll = 100%)
  const glassCapacityMl = 420;

  // FELD 1: Wie viele Portionen? (1, 2, 3 oder 4) - Standard 3 (Original-Aufgabe)
  const [numPortions, setNumPortions] = useState<1 | 2 | 3 | 4>(3);

  // FELD 2: Wie groß ist die 1. Portion? (Einfaches Zahlenfeld, Standard 200 ml zum Raten)
  const [firstPortionMl, setFirstPortionMl] = useState<number>(200);

  // Simulations-Status
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [currentPouringPortion, setCurrentPouringPortion] = useState<number | null>(null);
  const [pouredMl, setPouredMl] = useState<number>(0);
  const [hasTested, setHasTested] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Beamer-Vollbild
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

  // Sanfte Wellen-Animation
  const [wavePhase, setWavePhase] = useState<number>(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let phase = 0;
    const animate = () => {
      phase += 0.05;
      setWavePhase(phase);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Berechnung aller Portionen: Jede Folgeportion ist genau 50% der vorherigen
  const calculatedPortions = useMemo(() => {
    const portions: { index: number; amountMl: number; cumulativeMl: number }[] = [];
    let current = Math.max(0, firstPortionMl);
    let cumulative = current;
    portions.push({ index: 1, amountMl: current, cumulativeMl: cumulative });

    for (let i = 2; i <= numPortions; i++) {
      current = current * 0.5; // genau 50%
      cumulative += current;
      portions.push({ index: i, amountMl: current, cumulativeMl: cumulative });
    }

    return portions;
  }, [firstPortionMl, numPortions]);

  const totalCalculatedMl = useMemo(() => {
    return calculatedPortions.reduce((acc, p) => acc + p.amountMl, 0);
  }, [calculatedPortions]);

  // Exakte mathematische Lösung für die 1. Portion, um genau 420 ml zu erreichen
  const exactSolution = useMemo(() => {
    if (numPortions === 1) return 420;
    if (numPortions === 2) return 420 / 1.5; // 280 ml
    if (numPortions === 3) return 420 / 1.75; // 240 ml (Original)
    return 420 / 1.875; // 224 ml
  }, [numPortions]);

  // Klick auf "LOS! Wasser marsch!"
  const handleStartPouring = async () => {
    if (isPouring) return;
    setIsPouring(true);
    setHasTested(false);
    setPouredMl(0);
    sounds.playPop();

    let accumulated = 0;

    for (let i = 0; i < calculatedPortions.length; i++) {
      const p = calculatedPortions[i];
      setCurrentPouringPortion(p.index);

      // Fließgeräusch mit ansteigender Tonhöhe
      const fillRatio = Math.min(1, (accumulated + p.amountMl) / glassCapacityMl);
      sounds.playWaterStream(0.55, 0.3 + fillRatio * 0.5);

      const startVal = accumulated;
      const targetVal = accumulated + p.amountMl;
      const steps = 16;
      const stepDuration = 550 / steps;

      for (let s = 1; s <= steps; s++) {
        await new Promise((res) => setTimeout(res, stepDuration));
        const currentInterp = startVal + (targetVal - startVal) * (s / steps);
        setPouredMl(currentInterp);
      }

      accumulated = targetVal;
      await new Promise((res) => setTimeout(res, 220));
    }

    setIsPouring(false);
    setCurrentPouringPortion(null);
    setHasTested(true);

    // Auswertung: 420 ml ist genau voll
    const diff = Math.abs(accumulated - glassCapacityMl);
    if (diff < 0.2) {
      // Exakt randvoll!
      sounds.playSuccess();
      try {
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch {}
    } else if (accumulated > glassCapacityMl) {
      // Wasser fließt über!
      sounds.playOverflow();
    } else {
      // Zu wenig (Glas nicht voll)
      sounds.playError();
    }
  };

  const handleReset = () => {
    sounds.playPop();
    setIsPouring(false);
    setCurrentPouringPortion(null);
    setPouredMl(0);
    setHasTested(false);
  };

  // Status-Flags
  const isExactMatch = hasTested && Math.abs(pouredMl - glassCapacityMl) < 0.2;
  const isOverflown = hasTested && pouredMl > glassCapacityMl + 0.2;
  const isUnderfilled = hasTested && pouredMl < glassCapacityMl - 0.2;

  // Glas Füllstand: 420 ml = 100% (Randvoll). Wenn mehr, dann über 100%.
  const fillPercentage = Math.min(108, (pouredMl / glassCapacityMl) * 100);

  // SVG Wellenfunktion
  const generateWaveSvg = () => {
    const width = 220;
    const totalHeight = 320;
    const baseY = totalHeight - (fillPercentage / 100) * totalHeight;

    if (fillPercentage <= 0) return '';
    if (fillPercentage >= 100) {
      return `M 0 0 L ${width} 0 L ${width} ${totalHeight} L 0 ${totalHeight} Z`;
    }

    const amplitude = isPouring ? 4 : 2;
    const frequency = 0.035;

    let path = `M 0 ${baseY}`;
    for (let x = 0; x <= width; x += 4) {
      const y = baseY + Math.sin(x * frequency + wavePhase) * amplitude;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${width} ${totalHeight} L 0 ${totalHeight} Z`;
    return path;
  };

  return (
    <div
      ref={containerRef}
      className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-6 sm:p-10 overflow-y-auto w-screen h-screen rounded-none max-w-none'
          : 'max-w-4xl mx-auto'
      }`}
    >
      {/* 1. KLARE AUFGABENSTELLUNG */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-2 border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <span>Rätsel • Prozentrechnung</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              Ein Wasserspender soll ein Glas mit <span className="text-amber-400 underline decoration-amber-400/60">exakt 420 ml</span> füllen.
            </h2>
            <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-1">
              <p>
                Dafür gibt der Automat das Wasser in <strong>Portionen</strong> ab. Bei 420 ml ist das Glas randvoll gefüllt.
              </p>
              <p className="text-cyan-300 font-semibold">
                ⚡ Regel: Jede weitere Portion ist genau <strong>50 % (die Hälfte)</strong> so groß wie die vorherige.
              </p>
              <p className="text-amber-300 font-bold text-base sm:text-lg pt-1">
                Frage: Wie viele Milliliter Wasser muss die Maschine bei der 1. Portion ausgeben?
              </p>
            </div>
          </div>

          {/* Vollbild-Button für Beamer */}
          <button
            onClick={toggleFullscreen}
            className="self-end sm:self-start p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all shadow cursor-pointer shrink-0"
            title={isFullscreen ? 'Vollbild beenden (Esc)' : 'Vollbild für den Beamer'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 2. NUR DIE ZWEI GEWÜNSCHTEN FELDER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-lg">
        {/* FELD 1: WIE VIELE PORTIONEN? */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            1. Wie viele Portionen?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as const).map((count) => (
              <button
                key={count}
                onClick={() => {
                  sounds.playPop();
                  setNumPortions(count);
                  setHasTested(false);
                  setPouredMl(0);
                }}
                disabled={isPouring}
                className={`py-3 px-1 rounded-xl font-mono text-center font-extrabold text-xs sm:text-sm border transition-all cursor-pointer ${
                  numPortions === count
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div>{count} {count === 1 ? 'Portion' : 'Portionen'}</div>
                {count === 3 && (
                  <span className="text-[10px] text-amber-300 block font-normal">(Aufgabe)</span>
                )}
                {count === 1 && (
                  <span className="text-[10px] text-slate-400 block font-normal">(420 ml)</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* FELD 2: GRÖSSE DER 1. PORTION (EINFACHES ZAHLENFELD OHNE +/- BUTTONS) */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            2. Wie groß ist die 1. Portion?
          </label>
          <div className="flex items-center justify-center bg-slate-900 border-2 border-cyan-500/60 rounded-xl px-4 py-2 shadow-inner">
            <input
              type="number"
              min="1"
              max="1000"
              step="1"
              disabled={isPouring}
              value={firstPortionMl}
              onChange={(e) => {
                setFirstPortionMl(Math.max(1, Number(e.target.value)));
                setHasTested(false);
                setPouredMl(0);
              }}
              className="w-32 bg-transparent text-white font-mono text-3xl font-extrabold focus:outline-none text-center"
            />
            <span className="text-cyan-300 font-mono font-bold text-xl ml-1">ml</span>
          </div>
        </div>
      </div>

      {/* 3. GROSSER ACTION BUTTON */}
      <div>
        <button
          onClick={handleStartPouring}
          disabled={isPouring}
          className={`w-full py-4 px-6 rounded-2xl font-extrabold text-xl sm:text-2xl shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-98 cursor-pointer ${
            isPouring
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white border-2 border-cyan-300 shadow-cyan-500/25 hover:shadow-cyan-500/40'
          }`}
        >
          <Play className={`w-7 h-7 fill-current ${isPouring ? 'animate-spin' : 'animate-pulse'}`} />
          <span>
            {isPouring ? 'Wasser marsch! Das Glas wird gefüllt...' : 'LOS! Wasser marsch!'}
          </span>
        </button>
      </div>

      {/* 4. VISUALISIERUNG & RÜCKMELDUNG */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-950/90 rounded-3xl p-6 border border-slate-800">
        {/* Linke Seite: Wasserspender & Glas mit 420 ml Füllmenge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          {/* Spender Düse */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-4 bg-gradient-to-b from-slate-600 to-slate-700 rounded-t-md border border-slate-500 shadow flex items-center justify-center">
              <span className="text-[8px] font-mono text-slate-300 font-bold">SPENDER</span>
            </div>
            <div className="w-4 h-2.5 bg-slate-500 border-x border-slate-400" />
            {/* Wasserstrahl */}
            <div className="w-2.5 h-7 flex justify-center overflow-hidden">
              {isPouring && (
                <div className="w-2 h-full bg-gradient-to-b from-cyan-200 via-sky-400 to-blue-500 rounded-full animate-pulse shadow-lg shadow-cyan-400" />
              )}
            </div>
          </div>

          {/* DAS GLAS (Exakt 420 ml = Randvoll) */}
          <div className="relative w-52 h-76 flex flex-col justify-end items-center">
            {/* Überlauf Spritzer links und rechts */}
            {isOverflown && (
              <>
                <div className="absolute top-0 -left-2 w-2 h-74 bg-cyan-300/90 rounded-full animate-pulse z-30" />
                <div className="absolute top-0 -right-2 w-2 h-74 bg-cyan-300/90 rounded-full animate-pulse z-30" />
                <div className="absolute top-4 -left-4 text-cyan-300 animate-bounce text-sm">💧</div>
                <div className="absolute top-8 -right-4 text-cyan-300 animate-bounce text-sm">💧</div>
              </>
            )}

            {/* Glas Körper: Oberkante ist genau 420 ml */}
            <div className="relative w-48 h-72 border-4 border-slate-500 border-t-0 rounded-b-3xl bg-slate-900/80 shadow-2xl overflow-hidden flex flex-col justify-end">
              {/* KLARE SKALEN-MARKIERUNGEN AUF DEM GLAS */}
              {/* 420 ml Markierung ganz oben am Rand */}
              <div className="absolute top-1 inset-x-0 flex items-center justify-between px-2 pointer-events-none z-20 text-[10px] font-mono font-extrabold text-amber-300 border-b border-dashed border-amber-400/80 pb-0.5">
                <span>420 ml (Randvoll)</span>
                <span>100%</span>
              </div>

              {/* 300 ml Markierung */}
              <div
                className="absolute inset-x-0 flex items-center justify-between px-2 pointer-events-none z-20 text-[9px] font-mono text-slate-400 border-b border-slate-700/60"
                style={{ bottom: `${(300 / glassCapacityMl) * 100}%` }}
              >
                <span>300 ml</span>
              </div>

              {/* 200 ml Markierung */}
              <div
                className="absolute inset-x-0 flex items-center justify-between px-2 pointer-events-none z-20 text-[9px] font-mono text-slate-400 border-b border-slate-700/60"
                style={{ bottom: `${(200 / glassCapacityMl) * 100}%` }}
              >
                <span>200 ml</span>
              </div>

              {/* 100 ml Markierung */}
              <div
                className="absolute inset-x-0 flex items-center justify-between px-2 pointer-events-none z-20 text-[9px] font-mono text-slate-400 border-b border-slate-700/60"
                style={{ bottom: `${(100 / glassCapacityMl) * 100}%` }}
              >
                <span>100 ml</span>
              </div>

              {/* 0 ml am Boden */}
              <div className="absolute bottom-1 left-2 pointer-events-none z-20 text-[9px] font-mono text-slate-500">
                0 ml
              </div>

              {/* Das Wasser im Glas */}
              {pouredMl > 0 && (
                <div
                  className="w-full relative overflow-hidden transition-all ease-out"
                  style={{ height: `${fillPercentage}%` }}
                >
                  <svg viewBox="0 0 220 320" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
                    <defs>
                      <linearGradient id="waterFlow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                      </linearGradient>
                    </defs>
                    <path d={generateWaveSvg()} fill="url(#waterFlow)" />
                  </svg>

                  {/* Portionen-Schichten im Wasser */}
                  <div className="absolute inset-0 flex flex-col justify-end pointer-events-none z-10 px-2 pb-1 text-[10px] font-mono text-white/95">
                    {calculatedPortions.map((p) => {
                      if (pouredMl < p.cumulativeMl - 5) return null;
                      return (
                        <div
                          key={p.index}
                          className="flex items-center justify-between border-t border-white/30 py-0.5 px-1 bg-black/20 rounded backdrop-blur-[1px] mb-0.5"
                        >
                          <span className="font-bold">{p.index}. Portion:</span>
                          <span>{p.amountMl.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ml</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Center Zahl: Aktueller Inhalt */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                {pouredMl > 10 && (
                  <div className="bg-slate-950/90 border border-cyan-500/50 px-3 py-1 rounded-xl text-center shadow-lg">
                    <span className="font-extrabold text-2xl font-mono text-white">
                      {Math.round(pouredMl)} <span className="text-sm font-normal text-cyan-300">ml</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Glas Fuß / Auffangschale */}
            <div className="w-56 h-3 bg-slate-700 rounded-b-lg border-t border-slate-600 shadow" />
          </div>

          <div className="mt-2 text-center text-xs font-mono text-slate-400">
            {isPouring && (
              <span className="text-cyan-400 font-bold animate-pulse">
                Portion {currentPouringPortion ?? 1} wird eingeschenkt...
              </span>
            )}
            {!isPouring && !hasTested && <span>Bereit • Klicke auf LOS</span>}
          </div>
        </div>

        {/* Rechte Seite: Klare Auswertung & Portionen-Übersicht */}
        <div className="md:col-span-7 space-y-4">
          {/* AUSWERTUNG */}
          {hasTested ? (
            <div
              className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                isExactMatch
                  ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-xl shadow-emerald-950/40'
                  : isOverflown
                  ? 'bg-rose-950/90 border-rose-500 text-white shadow-xl shadow-rose-950/40'
                  : 'bg-amber-950/90 border-amber-500 text-white shadow-xl shadow-amber-950/40'
              }`}
            >
              <div className="flex items-start gap-3">
                {isExactMatch ? (
                  <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl shrink-0">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                ) : isOverflown ? (
                  <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 animate-bounce">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0">
                    <XCircle className="w-8 h-8" />
                  </div>
                )}

                <div className="flex-1">
                  <span className="text-xs uppercase font-mono font-extrabold px-2 py-0.5 rounded bg-black/30 border border-white/20">
                    {isExactMatch
                      ? '✔ RICHTIG! ABGEHAKT'
                      : isOverflown
                      ? '❌ FALSCH: WASSER FLIESST ÜBER!'
                      : '❌ FALSCH: ZU WENIG WASSER!'}
                  </span>

                  <h3 className="text-xl font-extrabold mt-1.5">
                    {isExactMatch
                      ? 'Perfekt! Exakt 420 ml – das Glas ist randvoll!'
                      : isOverflown
                      ? `Übergelaufen! ${Math.round(pouredMl - glassCapacityMl)} ml zu viel!`
                      : `Nicht voll! Es fehlen noch ${Math.round(glassCapacityMl - pouredMl)} ml bis zum Rand!`}
                  </h3>

                  <p className="text-sm opacity-90 mt-1">
                    {isExactMatch && (
                      <>Mit einer 1. Portion von <strong>{firstPortionMl} ml</strong> ist das 420 ml Glas exakt bis zum oberen Rand gefüllt.</>
                    )}
                    {isUnderfilled && (
                      <>Im Glas sind nur <strong>{Math.round(pouredMl)} ml</strong>. Die 1. Portion war zu klein!</>
                    )}
                    {isOverflown && (
                      <>Im Glas waren <strong>{Math.round(pouredMl)} ml</strong>. Das Glas fasst nur 420 ml – das überschüssige Wasser fließt an den Seiten über!</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
              Wähle oben die Portionenanzahl und gib die 1. Portion ein. Klicke dann auf <strong>„LOS! Wasser marsch!“</strong>.
            </div>
          )}

          {/* ÜBERSICHT DER EINZELNEN PORTIONEN */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>Die {numPortions} {numPortions === 1 ? 'Portion' : 'Portionen'}:</span>
              <span className="text-cyan-300">
                Gesamt: {totalCalculatedMl.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ml
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {calculatedPortions.map((p) => (
                <div
                  key={p.index}
                  className={`p-2.5 rounded-xl border ${
                    currentPouringPortion === p.index
                      ? 'bg-cyan-950 border-cyan-400 ring-2 ring-cyan-400/40 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">
                    {p.index === 1 ? '1. Portion' : `${p.index}. Portion (50%)`}
                  </div>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    {p.amountMl.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ml
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GLAS LEEREN BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              disabled={isPouring}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" />
              Glas leeren / Neuer Versuch
            </button>
          </div>
        </div>
      </div>

      {/* 5. TAFEL-LÖSUNGSWEG ZUM AUSKLAPPEN */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => {
            sounds.playPop();
            setShowSolution(!showSolution);
          }}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Didaktischer Lösungsweg & Gleichung für die Tafel anzeigen</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              showSolution ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showSolution && (
          <div className="p-5 border-t border-slate-800 space-y-3 text-xs sm:text-sm text-slate-300 bg-slate-900/40 font-mono">
            <div>
              <span className="text-cyan-400 font-bold uppercase text-xs block mb-1">
                Gleichung aufstellen (1. Portion = x):
              </span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-slate-200">
                {numPortions === 1 && (
                  <div>
                    <MathRenderer latex="x = 420\text{ ml}" display={true} />
                    <p className="text-xs text-slate-400 text-center mt-1">
                      (Bei 1 Portion gibt der Automat sofort die gesamten 420 ml auf einmal ab.)
                    </p>
                  </div>
                )}
                {numPortions === 2 && (
                  <div>
                    <MathRenderer latex="x + 0{,}5\,x = 1{,}5\,x = 420\text{ ml}" display={true} />
                    <div className="text-center pt-1 text-emerald-300 font-bold">
                      <MathRenderer latex="x = \frac{420}{1{,}5} = \mathbf{280\text{ ml}}" display={true} />
                    </div>
                  </div>
                )}
                {numPortions === 3 && (
                  <div>
                    <MathRenderer latex="x + 0{,}5\,x + 0{,}25\,x = 1{,}75\,x = 420\text{ ml}" display={true} />
                    <div className="text-center pt-1 text-emerald-300 font-bold">
                      <MathRenderer latex="x = \frac{420}{1{,}75} = \frac{420}{\frac{7}{4}} = 420 \cdot \frac{4}{7} = \mathbf{240\text{ ml}}" display={true} />
                    </div>
                  </div>
                )}
                {numPortions === 4 && (
                  <div>
                    <MathRenderer latex="x + 0{,}5\,x + 0{,}25\,x + 0{,}125\,x = 1{,}875\,x = 420\text{ ml}" display={true} />
                    <div className="text-center pt-1 text-emerald-300 font-bold">
                      <MathRenderer latex="x = \frac{420}{1{,}875} = \mathbf{224\text{ ml}}" display={true} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  sounds.playPop();
                  setFirstPortionMl(Math.round(exactSolution));
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Lösung ({Math.round(exactSolution)} ml) direkt eintragen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

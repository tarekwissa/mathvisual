import React, { useState, useMemo, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Bot,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  X,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

type ProblemType = 'typeA' | 'typeB' | 'typeC' | 'free';

export const Percent100GridTutor: React.FC = () => {
  // Mode Selection via Dropdown
  const [selectedType, setSelectedType] = useState<ProblemType>('typeA');

  // Direct User Inputs for own numbers
  const [inputG, setInputG] = useState<number>(70);
  const [inputP, setInputP] = useState<number>(23);
  const [inputW, setInputW] = useState<number>(16.1);
  const [unit, setUnit] = useState<string>('€');

  // Slide Index: 1 (Werte eingeben), 2 (Hundertertafel & 1%), 3 (Lösung & Farbige Kästchen)
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  // Free explorer state
  const [freeG, setFreeG] = useState<number>(200);
  const [freeP, setFreeP] = useState<number>(25);
  const [freeUnit, setFreeUnit] = useState<string>('€');

  // Interactive Zoom / Focus on a specific cell for classroom display
  const [zoomedCell, setZoomedCell] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Fullscreen state
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

  // Compute calculated values based on type
  const calculatedValues = useMemo(() => {
    if (selectedType === 'typeA') {
      // G and P given -> W = (G * P) / 100
      const g = Math.max(0.01, inputG);
      const p = Math.max(0.1, Math.min(100, inputP));
      const oneCell = g / 100;
      const w = oneCell * p;
      return { g, p, w, oneCell };
    } else if (selectedType === 'typeB') {
      // P and W given -> 1 cell = W / P, G = 100 * (W / P)
      const p = Math.max(0.1, Math.min(100, inputP));
      const w = Math.max(0.01, inputW);
      const oneCell = w / p;
      const g = oneCell * 100;
      return { g, p, w, oneCell };
    } else if (selectedType === 'typeC') {
      // G and W given -> 1 cell = G / 100, P = W / (G / 100)
      const g = Math.max(0.01, inputG);
      const w = Math.max(0.01, inputW);
      const oneCell = g / 100;
      const p = Math.max(0.1, Math.min(100, (w / g) * 100));
      return { g, p, w, oneCell };
    }
    // Free mode
    const g = Math.max(1, freeG);
    const p = Math.max(1, Math.min(100, freeP));
    const oneCell = g / 100;
    const w = oneCell * p;
    return { g, p, w, oneCell };
  }, [selectedType, inputG, inputP, inputW, freeG, freeP]);

  const { g: activeG, p: activeP, w: activeW, oneCell: cellValue1Percent } = calculatedValues;

  // Handle Type Change from Dropdown
  const handleTypeDropdownChange = (type: ProblemType) => {
    sounds.playPop();
    setSelectedType(type);
    setCurrentSlide(1);
    setZoomedCell(null);
    if (type === 'typeA') {
      setInputG(70);
      setInputP(23);
    } else if (type === 'typeB') {
      setInputP(23);
      setInputW(16.1);
    } else if (type === 'typeC') {
      setInputG(70);
      setInputW(16.1);
    }
  };

  // Next Slide Action
  const handleNextSlide = () => {
    sounds.playPop();
    const next = Math.min(3, currentSlide + 1);
    setCurrentSlide(next);
    if (next === 3) {
      sounds.playSuccess();
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.7 }
      });
    }
  };

  // Prev Slide Action
  const handlePrevSlide = () => {
    sounds.playPop();
    setCurrentSlide((s) => Math.max(1, s - 1));
  };

  // Reset to Slide 1
  const handleResetToInput = () => {
    sounds.playPop();
    setCurrentSlide(1);
    setZoomedCell(null);
  };

  // Number of highlighted cells in 100 grid
  const highlightedCellsCount = useMemo(() => {
    if (selectedType === 'free') return freeP;
    if (currentSlide === 3) return Math.round(activeP);
    if (selectedType === 'typeB' && currentSlide === 2) return Math.round(activeP);
    return 0;
  }, [selectedType, currentSlide, activeP, freeP]);

  // Value displayed in each cell of the grid
  const displayCellNumber = (_cellIndex?: number) => {
    if (selectedType === 'free') {
      const one = freeG / 100;
      return one < 100 ? one.toLocaleString('de-DE', { maximumFractionDigits: 2 }) : one.toFixed(0);
    }
    if (currentSlide >= 2) {
      return cellValue1Percent < 100
        ? cellValue1Percent.toLocaleString('de-DE', { maximumFractionDigits: 2 })
        : cellValue1Percent.toFixed(0);
    }
    return '?';
  };

  // Handler when a cell is clicked
  const handleCellClick = (cellIndex: number) => {
    sounds.playPop();
    setZoomedCell(cellIndex);
    if (selectedType === 'free') {
      setFreeP(cellIndex);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-4 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-6 sm:p-10 overflow-y-auto w-screen h-screen rounded-none max-w-none'
          : ''
      }`}
    >
      {/* Top Banner: Dropdown Selector, Fullscreen Button & Slide Pills */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Die Hundertertafel</h2>
              <span className="text-xs text-slate-400 font-mono">100 Kästchen = 100 % (Das Ganze)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Aufgabentyp Dropdown */}
            <div className="relative min-w-[240px] sm:min-w-[260px]">
              <select
                value={selectedType}
                onChange={(e) => handleTypeDropdownChange(e.target.value as any)}
                className="w-full appearance-none bg-slate-950 border border-amber-500/50 hover:border-amber-400 rounded-2xl px-4 py-2.5 pr-10 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-400 cursor-pointer shadow-lg transition-all"
              >
                <option value="typeA">Typ A: Prozentwert (p % von G)</option>
                <option value="typeB">Typ B: Grundwert (p % sind W)</option>
                <option value="typeC">Typ C: Prozentsatz (W von G)</option>
                <option value="free">✨ Freies Labor (Schieberegler)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>

            {/* Model Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center shadow-lg ${
                isFullscreen
                  ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={isFullscreen ? 'Vollbildmodus beenden (Esc)' : 'Vollbildmodus starten (Fullscreen)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Slide Step Navigation Tabs (only in guided modes) */}
        {selectedType !== 'free' && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              {[
                { s: 1, label: '1. Werte eingeben' },
                { s: 2, label: '2. Hundertertafel (1 %)' },
                { s: 3, label: '3. Lösung' }
              ].map((tab) => (
                <button
                  key={tab.s}
                  onClick={() => {
                    sounds.playPop();
                    setCurrentSlide(tab.s);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    currentSlide === tab.s
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                      : currentSlide > tab.s
                      ? 'bg-slate-950 text-emerald-400 border border-emerald-800/60'
                      : 'bg-slate-950 text-slate-500 border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleResetToInput}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              title="Neu starten"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Neu</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDE 1: WERTE EINGEBEN & AUFGABE ANSEHEN                                 */}
      {/* ========================================================================= */}
      {currentSlide === 1 && selectedType !== 'free' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
              Folie 1 von 3
            </span>
            <h3 className="text-2xl font-extrabold text-white">Eigene Werte eingeben</h3>
          </div>

          {/* Clean Input Grid */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedType === 'typeA' && (
                <>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Das Ganze (G):</label>
                    <input
                      type="number"
                      min="1"
                      value={inputG}
                      onChange={(e) => setInputG(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-base font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Prozentsatz (p %):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={inputP}
                      onChange={(e) => setInputP(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-amber-300 font-mono text-base font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Einheit:</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 font-mono text-base font-bold focus:border-amber-400 focus:outline-none text-center"
                    />
                  </div>
                </>
              )}

              {selectedType === 'typeB' && (
                <>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Prozentsatz (p %):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={inputP}
                      onChange={(e) => setInputP(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-amber-300 font-mono text-base font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Wert (W):</label>
                    <input
                      type="number"
                      min="0.1"
                      value={inputW}
                      onChange={(e) => setInputW(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-base font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Einheit:</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 font-mono text-base font-bold focus:border-amber-400 focus:outline-none text-center"
                    />
                  </div>
                </>
              )}

              {selectedType === 'typeC' && (
                <>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Das Ganze (G):</label>
                    <input
                      type="number"
                      min="1"
                      value={inputG}
                      onChange={(e) => setInputG(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-base font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Teilwert (W):</label>
                    <input
                      type="number"
                      min="0.1"
                      value={inputW}
                      onChange={(e) => setInputW(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-emerald-400 font-mono text-base font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Einheit:</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 font-mono text-base font-bold focus:border-amber-400 focus:outline-none text-center"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Big Question Banner */}
            <div className="p-4 bg-slate-900 rounded-xl border border-amber-500/30 text-center">
              <span className="text-xs text-slate-400 font-mono block mb-1">Die Aufgabe für die Klasse:</span>
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {selectedType === 'typeA' && `Wie viel sind ${activeP} % von ${activeG} ${unit}?`}
                {selectedType === 'typeB' && `${activeP} % sind ${activeW} ${unit}. Wie groß ist das Ganze?`}
                {selectedType === 'typeC' && `Wie viel Prozent sind ${activeW} ${unit} von ${activeG} ${unit}?`}
              </div>
            </div>
          </div>

          {/* Action Button to Slide 2 */}
          <div className="max-w-xl mx-auto">
            <button
              onClick={handleNextSlide}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Weiter zur Hundertertafel</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE 2: HUNDERTERTAFEL MIT WERTEN (1 % PRO KÄSTCHEN)                     */}
      {/* ========================================================================= */}
      {currentSlide === 2 && selectedType !== 'free' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
              Folie 2 von 3: Hundertertafel
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {selectedType === 'typeB'
                ? `${activeW} ${unit} ÷ ${activeP} Kästchen = ${cellValue1Percent.toFixed(2)} ${unit} pro Kästchen`
                : `${activeG} ${unit} verteilt auf 100 Kästchen = ${cellValue1Percent.toFixed(2)} ${unit} pro Kästchen`}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              In jedem einzelnen der 100 Kästchen steht genau <strong>{cellValue1Percent.toFixed(2)} {unit}</strong> (exakt 1 %)
            </p>
          </div>

          {/* THE 100 GRID (10x10 Matrix) */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-950 rounded-2xl border border-slate-800 select-none aspect-square max-w-[460px] mx-auto">
            {Array.from({ length: 100 }, (_, i) => {
              const cellIndex = i + 1;
              const isHovered = hoveredCell === cellIndex;
              const isZoomed = zoomedCell === cellIndex;

              return (
                <button
                  type="button"
                  key={cellIndex}
                  onMouseEnter={() => setHoveredCell(cellIndex)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => handleCellClick(cellIndex)}
                  className={`relative flex flex-col items-center justify-center rounded-lg border text-[9px] sm:text-[10px] font-mono font-bold transition-all duration-200 cursor-pointer overflow-hidden bg-slate-900 text-slate-200 border-slate-700 hover:border-amber-400 hover:bg-slate-800 ${
                    isHovered ? 'ring-2 ring-white scale-110 z-20' : ''
                  } ${isZoomed ? 'ring-4 ring-cyan-400 scale-125 z-30 shadow-2xl' : ''}`}
                >
                  <span className="text-[7px] sm:text-[8px] opacity-60 leading-none">#{cellIndex}</span>
                  <span className="font-extrabold text-[8px] sm:text-[9px] truncate max-w-full px-0.5 mt-0.5 text-amber-300">
                    {displayCellNumber(cellIndex)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* GROSSANSICHT / ZOOM CARD (IF CLICKED) */}
          {zoomedCell !== null && (
            <div className="p-4 bg-slate-950 rounded-2xl border-2 border-cyan-400 max-w-md mx-auto text-center space-y-1 animate-fadeIn relative">
              <button
                onClick={() => setZoomedCell(null)}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-cyan-400 font-bold block">
                🔍 Kästchen #{zoomedCell} (1 %) im Fokus:
              </span>
              <div className="text-3xl font-extrabold text-white font-mono">
                {cellValue1Percent.toFixed(2)} {unit}
              </div>
            </div>
          )}

          {/* Slide Navigation Buttons */}
          <div className="flex gap-3 max-w-xl mx-auto pt-2">
            <button
              onClick={handlePrevSlide}
              className="px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </button>
            <button
              onClick={handleNextSlide}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Weiter zur Lösung</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE 3: DIE LÖSUNG (FARBIGE KÄSTCHEN & ENDERGEBNIS)                     */}
      {/* ========================================================================= */}
      {currentSlide === 3 && selectedType !== 'free' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Folie 3 von 3: Das Gesamtergebnis
            </span>

            {/* Big Solution Header */}
            <div className="text-2xl sm:text-3xl font-extrabold text-white pt-1">
              {selectedType === 'typeA' && `${activeP} Kästchen × ${cellValue1Percent.toFixed(2)} ${unit} = ${activeW.toFixed(2)} ${unit}`}
              {selectedType === 'typeB' && `100 Kästchen × ${cellValue1Percent.toFixed(2)} ${unit} = ${activeG.toFixed(2)} ${unit}`}
              {selectedType === 'typeC' && `${activeW} ${unit} ÷ ${cellValue1Percent.toFixed(2)} ${unit} = ${activeP.toFixed(1)} % (${activeP.toFixed(0)} Kästchen)`}
            </div>
          </div>

          {/* THE 100 GRID (10x10 Matrix) with highlighted cells */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-950 rounded-2xl border border-slate-800 select-none aspect-square max-w-[460px] mx-auto">
            {Array.from({ length: 100 }, (_, i) => {
              const cellIndex = i + 1;
              const isHighlighted = cellIndex <= highlightedCellsCount;
              const isHovered = hoveredCell === cellIndex;
              const isZoomed = zoomedCell === cellIndex;

              return (
                <button
                  type="button"
                  key={cellIndex}
                  onMouseEnter={() => setHoveredCell(cellIndex)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => handleCellClick(cellIndex)}
                  className={`relative flex flex-col items-center justify-center rounded-lg border text-[9px] sm:text-[10px] font-mono font-bold transition-all duration-200 cursor-pointer overflow-hidden ${
                    isHighlighted
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 scale-[1.02] z-10'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  } ${isHovered ? 'ring-2 ring-white scale-110 z-20' : ''} ${
                    isZoomed ? 'ring-4 ring-cyan-400 scale-125 z-30 shadow-2xl' : ''
                  }`}
                >
                  <span className="text-[7px] sm:text-[8px] opacity-60 leading-none">#{cellIndex}</span>
                  <span className="font-extrabold text-[8px] sm:text-[9px] truncate max-w-full px-0.5 mt-0.5">
                    {displayCellNumber(cellIndex)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Big Solution Summary Box */}
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto text-center font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">1 Kästchen (1 %)</span>
              <strong className="text-amber-300 text-base">{cellValue1Percent.toFixed(2)} {unit}</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/40">
              <span className="text-emerald-400 block text-[10px] uppercase">{activeP} Kästchen ({activeP} %)</span>
              <strong className="text-emerald-400 text-base">{activeW.toFixed(2)} {unit}</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">100 Kästchen (100 %)</span>
              <strong className="text-white text-base">{activeG.toFixed(2)} {unit}</strong>
            </div>
          </div>

          {/* Slide Navigation Buttons */}
          <div className="flex gap-3 max-w-xl mx-auto pt-2">
            <button
              onClick={handlePrevSlide}
              className="px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </button>
            <button
              onClick={handleResetToInput}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Neue Werte eingeben</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FREE EXPLORATION LABORATORY (WHEN FREE IS SELECTED)                       */}
      {/* ========================================================================= */}
      {selectedType === 'free' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold uppercase">
              <Sparkles className="w-4 h-4" />
              Freies Erkundungs-Labor
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {freeP} von 100 Kästchen = {((freeG / 100) * freeP).toFixed(2)} {freeUnit}
            </h3>
          </div>

          {/* Inputs & Sliders */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 max-w-xl mx-auto space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Das Ganze (100 %):</label>
                <input
                  type="number"
                  value={freeG}
                  onChange={(e) => setFreeG(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div className="w-24">
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Einheit:</label>
                <input
                  type="text"
                  value={freeUnit}
                  onChange={(e) => setFreeUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-amber-300 font-mono text-sm font-bold focus:border-amber-400 focus:outline-none text-center"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Farbige Kästchen:</span>
                <span className="text-amber-400 font-bold">{freeP} % ({freeP} Kästchen)</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={freeP}
                onChange={(e) => setFreeP(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-950 rounded-2xl border border-slate-800 select-none aspect-square max-w-[460px] mx-auto">
            {Array.from({ length: 100 }, (_, i) => {
              const cellIndex = i + 1;
              const isHighlighted = cellIndex <= freeP;
              return (
                <button
                  type="button"
                  key={cellIndex}
                  onClick={() => setFreeP(cellIndex)}
                  className={`flex flex-col items-center justify-center rounded-lg border text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    isHighlighted
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-300'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  <span className="text-[7px] opacity-60 leading-none">#{cellIndex}</span>
                  <span className="text-[8px] truncate max-w-full px-0.5">
                    {(freeG / 100).toFixed(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

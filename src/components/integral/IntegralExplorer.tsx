import React, { useState, useMemo } from 'react';
import { IntegralCanvasGraph } from './IntegralCanvasGraph';
import { IntegralRiemannExplainer } from './IntegralRiemannExplainer';
import { IntegralStepByStep } from './IntegralStepByStep';
import { IntegralTwoFunctions } from './IntegralTwoFunctions';
import {
  PRESET_FUNCTIONS,
  compileMathExpression,
  computeDefiniteIntegral,
  computeRiemannSum,
  findRootsInInterval
} from '../../utils/mathParser';
import type { PresetFunction } from '../../types/math';
import { MathRenderer } from '../common/MathRenderer';
import { Activity, Layers, Sparkles, Sigma, Eye, Plus, Minus } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const IntegralExplorer: React.FC = () => {
  // Active Preset & Expression
  const [selectedPresetId, setSelectedPresetId] = useState<string>('quad_standard');
  const [customExpr, setCustomExpr] = useState<string>('x^2');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Second function expression for between mode
  const [secondExpr, setSecondExpr] = useState<string>('x');

  // Integration bounds
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(3);

  // Mode and view options
  const [activeMode, setActiveMode] = useState<'single' | 'riemann' | 'between' | 'hdi_accumulator'>('single');
  const [areaType, setAreaType] = useState<'signed' | 'absolute'>('signed');
  const [riemannType, setRiemannType] = useState<'left' | 'right' | 'midpoint' | 'trapezoid'>('midpoint');
  const [riemannN, setRiemannN] = useState<number>(10);
  const [showAntiderivative, setShowAntiderivative] = useState<boolean>(false);

  // Accumulator marker for HDI
  const [xAccumulator, setXAccumulator] = useState<number>(1.5);

  const currentPreset = useMemo(() => {
    return PRESET_FUNCTIONS.find(p => p.id === selectedPresetId);
  }, [selectedPresetId]);

  // Active expression string
  const activeExpression = isCustom ? customExpr : (currentPreset?.expression || 'x^2');

  // Compiled functions
  const { fn: primaryFn, isValid: isPrimaryValid, errorMessage } = useMemo(() => {
    return compileMathExpression(activeExpression);
  }, [activeExpression]);

  const { fn: secondFn } = useMemo(() => {
    return compileMathExpression(secondExpr);
  }, [secondExpr]);

  // Numerical evaluations
  const signedIntegral = useMemo(() => {
    if (!isPrimaryValid) return 0;
    return computeDefiniteIntegral(primaryFn, a, b, false);
  }, [primaryFn, isPrimaryValid, a, b]);

  const absoluteArea = useMemo(() => {
    if (!isPrimaryValid) return 0;
    return computeDefiniteIntegral(primaryFn, a, b, true);
  }, [primaryFn, isPrimaryValid, a, b]);

  const areaBetween = useMemo(() => {
    if (!isPrimaryValid) return 0;
    const diffFn = (x: number) => primaryFn(x) - secondFn(x);
    return computeDefiniteIntegral(diffFn, a, b, false);
  }, [primaryFn, secondFn, isPrimaryValid, a, b]);

  // Riemann sums
  const { totalSum: riemannSum, rectangles: riemannRectangles } = useMemo(() => {
    if (!isPrimaryValid || activeMode !== 'riemann') return { totalSum: 0, rectangles: [] };
    return computeRiemannSum(primaryFn, a, b, riemannN, riemannType);
  }, [primaryFn, isPrimaryValid, a, b, riemannN, riemannType, activeMode]);

  // Roots in interval for absolute area
  const roots = useMemo(() => {
    if (!isPrimaryValid) return [];
    return findRootsInInterval(primaryFn, a, b);
  }, [primaryFn, isPrimaryValid, a, b]);

  // Simple numeric antiderivative approximation for graphing F(x)
  const antiderivativeFn = useMemo(() => {
    return (x: number) => computeDefiniteIntegral(primaryFn, a, x, false, 50);
  }, [primaryFn, a]);

  const handleSelectPreset = (preset: PresetFunction) => {
    sounds.playPop();
    setSelectedPresetId(preset.id);
    setIsCustom(false);
    setCustomExpr(preset.expression);
    setA(preset.defaultA);
    setB(preset.defaultB);
  };

  const handleSetTwoFunctionsPreset = (f: string, g: string, newA: number, newB: number) => {
    sounds.playPop();
    setIsCustom(true);
    setCustomExpr(f);
    setSecondExpr(g);
    setA(newA);
    setB(newB);
  };

  const handleUpdateN = (newN: number) => {
    const clamped = Math.max(1, Math.min(200, newN));
    setRiemannN(clamped);
    if (Math.random() < 0.25) {
      sounds.playPop();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sigma className="w-4 h-4 text-cyan-400" />
            Analysis & Kurvenintegral
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Der Integral-Visualizer
          </h1>
          <p className="mt-2 text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
            Verstehe die Integralrechnung intuitiv: Untersuche, wie Flächen unter Kurven entstehen, experimentiere mit <strong>Riemann-Summen</strong> und bestimme die <strong>Anzahl der Rechtecke</strong> frei!
          </p>

          {/* Quick Preset Function Selector Pills */}
          <div className="mt-6">
            <span className="text-xs font-mono uppercase text-slate-400 block mb-2 font-semibold">
              Funktion wählen:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_FUNCTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                    !isCustom && selectedPresetId === p.id
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="font-bold">{p.name}</span>
                  <span className="font-mono text-[11px] opacity-75">({p.latex})</span>
                </button>
              ))}
              <button
                onClick={() => {
                  sounds.playPop();
                  setIsCustom(true);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isCustom
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                ✏️ Eigene Formel eingeben
              </button>
            </div>
          </div>

          {/* Custom Formula Editor if active */}
          {isCustom && (
            <div className="mt-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 w-full">
                <label className="text-xs font-mono text-cyan-400 block mb-1">
                  f(x) Formel eingeben (z.B. x^3 - 2*x, sin(x), 2*exp(x)):
                </label>
                <input
                  type="text"
                  value={customExpr}
                  onChange={(e) => setCustomExpr(e.target.value)}
                  placeholder="z.B. x^2 - 4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
              {!isPrimaryValid && (
                <div className="text-xs text-rose-400 font-mono self-end sm:self-center">
                  ⚠️ {errorMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'single', label: '1. Fläche unter f(x)', icon: Activity },
          { id: 'riemann', label: '2. Riemann-Summen (Rechtecks-Labor)', icon: Layers },
          { id: 'between', label: '3. Fläche zwischen zwei Graphen', icon: Sparkles },
          { id: 'hdi_accumulator', label: '4. Stammfunktion & Hauptsatz (HDI)', icon: Eye }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playPop();
                setActiveMode(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Direct Riemann Rectangle Controller in Riemann Mode */}
      {activeMode === 'riemann' && (
        <div className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 bg-blue-500/20 text-blue-400 rounded-md text-[10px] font-mono uppercase font-bold">
                  Rechtecke konfigurieren
                </span>
                <span className="text-white font-bold text-base">
                  Anzahl der Riemann-Streifen (n):
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stelle die Streifenanzahl beliebig ein. Je mehr Rechtecke, desto exakter nähert sich die Summe dem Integral an!
              </p>
            </div>

            {/* Direct Number Input & Stepper Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateN(riemannN - 1)}
                className="p-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all"
                title="1 Rechteck weniger"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-blue-500/50">
                <span className="text-xs text-slate-400 font-mono mr-2 font-bold">n =</span>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={riemannN}
                  onChange={(e) => handleUpdateN(Number(e.target.value))}
                  className="w-16 bg-transparent text-blue-300 font-mono font-bold text-base focus:outline-none text-center"
                />
              </div>
              <button
                onClick={() => handleUpdateN(riemannN + 1)}
                className="p-2 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all"
                title="1 Rechteck mehr"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slider and Fast Preset Buttons */}
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="150"
              value={riemannN}
              onChange={(e) => handleUpdateN(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
            />

            {/* Quick n presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-500 font-mono">Schnell-Auswahl:</span>
              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                {[1, 2, 4, 8, 16, 32, 50, 100].map((presetN) => (
                  <button
                    key={presetN}
                    onClick={() => {
                      sounds.playPop();
                      setRiemannN(presetN);
                    }}
                    className={`px-3 py-1 rounded-xl border transition-all ${
                      riemannN === presetN
                        ? 'bg-blue-600 border-blue-400 text-white font-bold shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    n = {presetN}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Riemann Type Picker (Method) */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-mono self-center mr-2">Methode:</span>
            {[
              { id: 'left', label: 'Links-Summe' },
              { id: 'right', label: 'Rechts-Summe' },
              { id: 'midpoint', label: 'Mittelpunkt-Summe' },
              { id: 'trapezoid', label: 'Trapez-Regel' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  sounds.playPop();
                  setRiemannType(m.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  riemannType === m.id
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Canvas Graph Section */}
      <div className="space-y-4">
        {/* Interactive Controls Bar for Bounds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 items-center">
          {/* Lower bound a */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-emerald-400 font-mono font-bold">
              <span>Untere Grenze (a):</span>
              <span>{a}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Upper bound b */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-amber-400 font-mono font-bold">
              <span>Obere Grenze (b):</span>
              <span>{b}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Area Type Toggle (Signed vs Absolute) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono block">Flächen-Interpretation:</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setAreaType('signed')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  areaType === 'signed' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Bilanz (±)
              </button>
              <button
                onClick={() => setAreaType('absolute')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  areaType === 'absolute' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Geometrisch (|A|)
              </button>
            </div>
          </div>

          {/* Antiderivative Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Stammfunktion F(x) einblenden</span>
            <input
              type="checkbox"
              checked={showAntiderivative || activeMode === 'hdi_accumulator'}
              onChange={(e) => setShowAntiderivative(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* The Live Interactive Graph */}
        <IntegralCanvasGraph
          fn={primaryFn}
          secondFn={secondFn}
          a={a}
          b={b}
          onUpdateBounds={(newA, newB) => {
            setA(newA);
            setB(newB);
          }}
          areaType={areaType}
          riemannType={activeMode === 'riemann' ? riemannType : 'none'}
          riemannRectangles={riemannRectangles}
          showAntiderivative={showAntiderivative || activeMode === 'hdi_accumulator'}
          antiderivativeFn={antiderivativeFn}
          xAccumulator={xAccumulator}
          onUpdateAccumulator={setXAccumulator}
          mode={activeMode}
        />

        {/* Live Calculation Scorecard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-mono block">Integralausdruck:</span>
              <div className="text-base font-bold text-cyan-300 mt-0.5">
                <MathRenderer latex={`\\int_{${a}}^{${b}} (${activeExpression}) \\, dx`} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-400 uppercase font-mono block">
                {activeMode === 'riemann' ? `Riemann-Summe (n=${riemannN}):` : 'Flächenbilanz (Integral):'}
              </span>
              <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
                {activeMode === 'riemann' ? riemannSum.toFixed(4) : signedIntegral.toFixed(4)}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-cyan-400 uppercase font-mono block">
                {activeMode === 'riemann' ? 'Exaktes Integral:' : 'Geometrischer Flächeninhalt:'}
              </span>
              <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-0.5">
                {activeMode === 'riemann' ? signedIntegral.toFixed(4) : `${absoluteArea.toFixed(4)} FE`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Views for deep explanations */}
      <div className="space-y-6">
        {activeMode === 'riemann' && (
          <IntegralRiemannExplainer
            exactIntegral={signedIntegral}
            riemannSum={riemannSum}
            n={riemannN}
            onUpdateN={handleUpdateN}
            riemannType={riemannType}
            onUpdateType={setRiemannType}
            a={a}
            b={b}
          />
        )}

        {activeMode === 'between' && (
          <IntegralTwoFunctions
            fStr={activeExpression}
            gStr={secondExpr}
            onUpdateG={setSecondExpr}
            areaBetween={areaBetween}
            a={a}
            b={b}
            onSetPreset={handleSetTwoFunctionsPreset}
          />
        )}

        {activeMode === 'single' && (
          <IntegralStepByStep
            currentPreset={currentPreset}
            functionString={activeExpression}
            a={a}
            b={b}
            signedIntegral={signedIntegral}
            absoluteArea={absoluteArea}
            roots={roots}
          />
        )}

        {activeMode === 'hdi_accumulator' && (
          <div className="bg-slate-900/80 backdrop-blur border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
                Der Flächen-Akkumulator
              </span>
              <h3 className="text-xl font-bold text-white">Stammfunktion als Flächenfunktion</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Verschiebe die Position <MathRenderer latex="x" /> zwischen <MathRenderer latex={`a = ${a}`} /> und <MathRenderer latex={`b = ${b}`} />. Beobachte, wie der y-Wert der lila gestrichelten Stammfunktion <MathRenderer latex="F(x)" /> exakt dem bisher aufsummierten Flächeninhalt entspricht!
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono text-purple-300">
                <span>Aktuelle Position x: {xAccumulator.toFixed(2)}</span>
                <span>Aufsummierte Fläche A(x) = {computeDefiniteIntegral(primaryFn, a, xAccumulator, false).toFixed(4)}</span>
              </div>
              <input
                type="range"
                min={Math.min(a, b)}
                max={Math.max(a, b)}
                step="0.05"
                value={xAccumulator}
                onChange={(e) => setXAccumulator(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

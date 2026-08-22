import React, { useState, useMemo } from 'react';
import { IntegralCanvasGraph } from './IntegralCanvasGraph';
import { IntegralRiemannExplainer } from './IntegralRiemannExplainer';
import { IntegralStepByStep } from './IntegralStepByStep';
import { IntegralTwoFunctions } from './IntegralTwoFunctions';
import { IntegralCustomFunctionModal } from './IntegralCustomFunctionModal';
import {
  PRESET_FUNCTIONS,
  compileMathExpression,
  computeDefiniteIntegral,
  computeRiemannSum,
  findRootsInInterval
} from '../../utils/mathParser';
import { MathRenderer } from '../common/MathRenderer';
import { Layers, Sigma, Plus, Minus, Edit3, ChevronDown } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const IntegralExplorer: React.FC = () => {
  // Active Preset & Expression
  const [selectedPresetId, setSelectedPresetId] = useState<string>('quad_standard');
  const [customExpr, setCustomExpr] = useState<string>('x^2');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
    return PRESET_FUNCTIONS.find((p) => p.id === selectedPresetId);
  }, [selectedPresetId]);

  // Active expression string
  const activeExpression = isCustom ? customExpr : (currentPreset?.expression || 'x^2');

  // Formatted LaTeX for active function
  const activeLatex = useMemo(() => {
    if (!isCustom && currentPreset) return currentPreset.latex;
    return activeExpression
      .replace(/\*/g, ' \\cdot ')
      .replace(/sqrt\((.*?)\)/g, '\\sqrt{$1}')
      .replace(/sin\((.*?)\)/g, '\\sin($1)')
      .replace(/cos\((.*?)\)/g, '\\cos($1)')
      .replace(/tan\((.*?)\)/g, '\\tan($1)')
      .replace(/exp\((.*?)\)/g, 'e^{$1}')
      .replace(/ln\((.*?)\)/g, '\\ln($1)');
  }, [activeExpression, isCustom, currentPreset]);

  // Compiled functions
  const { fn: primaryFn, isValid: isPrimaryValid } = useMemo(() => {
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

  const handleSelectPresetDropdown = (presetId: string) => {
    sounds.playPop();
    const preset = PRESET_FUNCTIONS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setIsCustom(false);
    setCustomExpr(preset.expression);
    setA(preset.defaultA);
    setB(preset.defaultB);
  };

  const handleApplyCustomFunction = (newExpr: string) => {
    setIsCustom(true);
    setCustomExpr(newExpr);
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
      {/* Hero Banner with Sleek Dropdown & Custom Function Button */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sigma className="w-4 h-4 text-cyan-400" />
              Analysis & Kurvenintegral
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Der Integral-Visualizer
            </h1>
            <p className="mt-1 text-slate-300 max-w-2xl text-xs sm:text-sm leading-relaxed">
              Untersuche Flächen unter Kurven, experimentiere mit Riemann-Summen und gib eigene Funktionen ein!
            </p>
          </div>

          {/* Active Formula Live LaTeX Badge */}
          <div className="bg-slate-950/90 border border-cyan-500/40 px-5 py-3 rounded-2xl text-center shadow-lg">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Aktuelle Funktion:</span>
            <div className="text-xl font-extrabold text-cyan-300 mt-0.5">
              <MathRenderer latex={`f(x) = ${activeLatex}`} />
            </div>
          </div>
        </div>

        {/* Function Selection Bar: Dropdown + Custom Button */}
        <div className="relative z-10 p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <span className="text-xs text-slate-400 font-mono font-semibold whitespace-nowrap">
              Funktion wählen:
            </span>

            {/* Modern Dropdown Select */}
            <div className="relative flex-1">
              <select
                value={isCustom ? 'custom' : selectedPresetId}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsModalOpen(true);
                  } else {
                    handleSelectPresetDropdown(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-2.5 pr-10 text-white font-mono text-xs sm:text-sm font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer transition-all shadow-inner"
              >
                <optgroup label="Bekannte Standard-Funktionen">
                  {PRESET_FUNCTIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — f(x) = {p.expression}
                    </option>
                  ))}
                </optgroup>
                {isCustom && (
                  <optgroup label="Benutzerdefiniert">
                    <option value="custom">✨ Eigene Formel: f(x) = {customExpr}</option>
                  </optgroup>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Button for Custom Function Modal */}
          <button
            onClick={() => {
              sounds.playPop();
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-600/30 transition-all shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Eigene Funktion eingeben</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Dropdown / Segment Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Modus:</span>
          <div className="relative">
            <select
              value={activeMode}
              onChange={(e) => {
                sounds.playPop();
                setActiveMode(e.target.value as any);
              }}
              className="appearance-none bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl px-3.5 py-2 pr-9 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-cyan-400 cursor-pointer transition-all"
            >
              <option value="single">1. Fläche unter f(x)</option>
              <option value="riemann">2. Riemann-Summen (Rechtecks-Labor)</option>
              <option value="between">3. Fläche zwischen zwei Graphen</option>
              <option value="hdi_accumulator">4. Stammfunktion & Hauptsatz (HDI)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Quick hint */}
        <span className="text-[11px] text-slate-500 font-mono">
          {activeMode === 'single' && 'Standard-Kurvenintegral & Flächenberechnung'}
          {activeMode === 'riemann' && 'Approximation mit verstellbaren Rechtecken'}
          {activeMode === 'between' && 'Fläche zwischen f(x) und g(x)'}
          {activeMode === 'hdi_accumulator' && 'Hauptsatz: F\'(x) = f(x)'}
        </span>
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

          {/* Riemann Type Picker Dropdown / Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
            <span className="text-xs text-slate-400 font-mono mr-1">Methode:</span>
            <div className="relative">
              <select
                value={riemannType}
                onChange={(e) => {
                  sounds.playPop();
                  setRiemannType(e.target.value as any);
                }}
                className="appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="left">Links-Summe</option>
                <option value="right">Rechts-Summe</option>
                <option value="midpoint">Mittelpunkt-Summe</option>
                <option value="trapezoid">Trapez-Regel</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
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

          {/* Area Type Dropdown (Signed vs Absolute) */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-mono block">Fläche:</label>
            <div className="relative">
              <select
                value={areaType}
                onChange={(e) => setAreaType(e.target.value as any)}
                className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="signed">Flächenbilanz (±)</option>
                <option value="absolute">Geometrisch (|A|)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Antiderivative Toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 font-medium">Stammfunktion F(x)</span>
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

      {/* Custom Function Input Modal */}
      <IntegralCustomFunctionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentExpression={customExpr}
        onApplyFunction={handleApplyCustomFunction}
      />
    </div>
  );
};

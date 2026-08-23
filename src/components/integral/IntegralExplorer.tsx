import React, { useState, useMemo } from 'react';
import { IntegralCanvasGraph } from './IntegralCanvasGraph';
import type { CompiledFunctionItem } from './IntegralCanvasGraph';
import { IntegralRiemannExplainer } from './IntegralRiemannExplainer';
import { IntegralStepByStep } from './IntegralStepByStep';
import { IntegralTwoFunctions } from './IntegralTwoFunctions';
import { IntegralCustomFunctionModal } from './IntegralCustomFunctionModal';
import {
  compileMathExpression,
  computeDefiniteIntegral,
  computeRiemannSum,
  findRootsInInterval,
  findKeyPointsInView
} from '../../utils/mathParser';
import { MathRenderer } from '../common/MathRenderer';
import { Sigma, Plus, Minus, Edit3, Trash2, Eye, EyeOff, ChevronDown, Magnet } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const PALETTE = [
  '#38bdf8', // Cyan
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#fbbf24', // Amber
  '#c084fc', // Purple
  '#3b82f6', // Blue
  '#f97316'  // Orange
];

interface FunctionEntry {
  id: string;
  name: string;
  expression: string;
  color: string;
  isVisible: boolean;
}

export const IntegralExplorer: React.FC = () => {
  // Multiple functions state
  const [functions, setFunctions] = useState<FunctionEntry[]>([
    { id: 'f1', name: 'f₁(x)', expression: 'x^3 - 3*x', color: '#38bdf8', isVisible: true },
    { id: 'f2', name: 'f₂(x)', expression: 'x', color: '#f43f5e', isVisible: true }
  ]);

  // Which function is the primary target for integration
  const [primaryFunctionId, setPrimaryFunctionId] = useState<string>('f1');
  const [secondFunctionId, setSecondFunctionId] = useState<string>('f2');

  // Modal for editing/adding function
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTargetId, setModalTargetId] = useState<string | null>(null);

  // Integration bounds
  const [a, setA] = useState<number>(-2);
  const [b, setB] = useState<number>(2);

  // Mode and view options
  const [activeMode, setActiveMode] = useState<'single' | 'riemann' | 'between' | 'hdi_accumulator'>('single');
  const [areaType, setAreaType] = useState<'signed' | 'absolute'>('signed');
  const [riemannType, setRiemannType] = useState<'left' | 'right' | 'midpoint' | 'trapezoid'>('midpoint');
  const [riemannN, setRiemannN] = useState<number>(12);
  const [showAntiderivative, setShowAntiderivative] = useState<boolean>(false);
  const [xAccumulator, setXAccumulator] = useState<number>(1.0);

  // Compile all functions
  const compiledFunctions: CompiledFunctionItem[] = useMemo(() => {
    return functions.map((f) => {
      const { fn, isValid } = compileMathExpression(f.expression);
      return {
        ...f,
        fn,
        isValid
      };
    });
  }, [functions]);

  const primaryItem = compiledFunctions.find((f) => f.id === primaryFunctionId) || compiledFunctions[0];
  const secondItem = compiledFunctions.find((f) => f.id === secondFunctionId) || compiledFunctions[1];

  // Helper to format LaTeX
  const formatLatex = (expr: string) => {
    return expr
      .replace(/\*/g, ' \\cdot ')
      .replace(/sqrt\((.*?)\)/g, '\\sqrt{$1}')
      .replace(/sin\((.*?)\)/g, '\\sin($1)')
      .replace(/cos\((.*?)\)/g, '\\cos($1)')
      .replace(/tan\((.*?)\)/g, '\\tan($1)')
      .replace(/exp\((.*?)\)/g, 'e^{$1}')
      .replace(/ln\((.*?)\)/g, '\\ln($1)');
  };

  // Numerical evaluations
  const signedIntegral = useMemo(() => {
    if (!primaryItem || !primaryItem.isValid) return 0;
    return computeDefiniteIntegral(primaryItem.fn, a, b, false);
  }, [primaryItem, a, b]);

  const absoluteArea = useMemo(() => {
    if (!primaryItem || !primaryItem.isValid) return 0;
    return computeDefiniteIntegral(primaryItem.fn, a, b, true);
  }, [primaryItem, a, b]);

  const areaBetween = useMemo(() => {
    if (!primaryItem || !primaryItem.isValid || !secondItem || !secondItem.isValid) return 0;
    const diffFn = (x: number) => primaryItem.fn(x) - secondItem.fn(x);
    return computeDefiniteIntegral(diffFn, a, b, false);
  }, [primaryItem, secondItem, a, b]);

  // Riemann sums
  const { totalSum: riemannSum, rectangles: riemannRectangles } = useMemo(() => {
    if (!primaryItem || !primaryItem.isValid || activeMode !== 'riemann') return { totalSum: 0, rectangles: [] };
    return computeRiemannSum(primaryItem.fn, a, b, riemannN, riemannType);
  }, [primaryItem, a, b, riemannN, riemannType, activeMode]);

  // Roots in interval
  const roots = useMemo(() => {
    if (!primaryItem || !primaryItem.isValid) return [];
    return findRootsInInterval(primaryItem.fn, a, b);
  }, [primaryItem, a, b]);

  // All key points (Nullstellen & Schnittpunkte) for magnetic quick-snapping
  const allKeyPoints = useMemo(() => {
    return findKeyPointsInView(compiledFunctions, -10, 10, 400);
  }, [compiledFunctions]);

  // Numeric antiderivative
  const antiderivativeFn = useMemo(() => {
    if (!primaryItem || !primaryItem.isValid) return undefined;
    return (x: number) => computeDefiniteIntegral(primaryItem.fn, a, x, false, 50);
  }, [primaryItem, a]);

  // Remove function
  const handleRemoveFunction = (id: string) => {
    if (functions.length <= 1) return;
    sounds.playPop();
    const updated = functions.filter((f) => f.id !== id);
    setFunctions(updated);
    if (primaryFunctionId === id) {
      setPrimaryFunctionId(updated[0].id);
    }
    if (secondFunctionId === id) {
      setSecondFunctionId(updated[1]?.id || updated[0].id);
    }
  };

  // Toggle visibility
  const handleToggleVisibility = (id: string) => {
    sounds.playPop();
    setFunctions(
      functions.map((f) => (f.id === id ? { ...f, isVisible: !f.isVisible } : f))
    );
  };

  // Update expression directly
  const handleUpdateExpression = (id: string, expr: string) => {
    setFunctions(
      functions.map((f) => (f.id === id ? { ...f, expression: expr } : f))
    );
  };

  // Open modal for editing
  const handleOpenModal = (id?: string) => {
    sounds.playPop();
    setModalTargetId(id || null);
    setIsModalOpen(true);
  };

  const handleApplyModalFunction = (newExpr: string) => {
    if (modalTargetId) {
      handleUpdateExpression(modalTargetId, newExpr);
    } else {
      // Add as new function
      const nextIdx = functions.length + 1;
      const color = PALETTE[(nextIdx - 1) % PALETTE.length];
      const newFunc: FunctionEntry = {
        id: `f_${Date.now()}`,
        name: `f${nextIdx}(x)`,
        expression: newExpr,
        color,
        isVisible: true
      };
      setFunctions([...functions, newFunc]);
    }
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
      {/* Hero Banner with Multi-Function Manager */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sigma className="w-4 h-4 text-cyan-400" />
              Multi-Funktions-Labor
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Der Integral-Visualizer
            </h1>
            <p className="mt-1 text-slate-300 max-w-2xl text-xs sm:text-sm leading-relaxed">
              Gib <strong>mehrere beliebige Funktionen</strong> ein! Jede Kurve erhält ihre eigene Farbe und wird direkt als <strong>formatiertes LaTeX</strong> angezeigt.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-cyan-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Neue Funktion hinzufügen</span>
          </button>
        </div>

        {/* Multi-Function Cards List */}
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono font-semibold">
            <span>Deine aktiven Funktionen ({functions.length}):</span>
            <span>Klicke in das Textfeld, um Formeln direkt zu ändern</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {functions.map((func) => (
              <div
                key={func.id}
                className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-2 relative"
                style={{ borderLeftColor: func.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Name badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: func.color }}
                    />
                    <span className="font-bold text-white text-xs font-mono">
                      {func.name}:
                    </span>
                  </div>

                  {/* Right Actions: Modal Edit, Visibility, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(func.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Im Formel-Fenster mit Live-LaTeX bearbeiten"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(func.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title={func.isVisible ? 'Kurve ausblenden' : 'Kurve einblenden'}
                    >
                      {func.isVisible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                    </button>
                    {functions.length > 1 && (
                      <button
                        onClick={() => handleRemoveFunction(func.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Funktion löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Text Input */}
                <input
                  type="text"
                  value={func.expression}
                  onChange={(e) => handleUpdateExpression(func.id, e.target.value)}
                  placeholder="z.B. x^2 - 3"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                />

                {/* Immediate LaTeX Display Badge */}
                <div className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-center text-xs font-bold truncate" style={{ color: func.color }}>
                  <MathRenderer latex={`${func.name} = ${formatLatex(func.expression)}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Settings & Target Selector */}
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          {/* Mode Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Berechnungs-Modus:</span>
            <div className="relative">
              <select
                value={activeMode}
                onChange={(e) => {
                  sounds.playPop();
                  setActiveMode(e.target.value as any);
                }}
                className="appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-white font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="single">1. Fläche unter Funktion</option>
                <option value="riemann">2. Riemann-Summen (Streifen)</option>
                <option value="between">3. Fläche zwischen 2 Graphen</option>
                <option value="hdi_accumulator">4. Stammfunktion (HDI)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Primary Function Picker for Integration */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Haupt-Funktion:</span>
            <div className="relative">
              <select
                value={primaryFunctionId}
                onChange={(e) => {
                  sounds.playPop();
                  setPrimaryFunctionId(e.target.value);
                }}
                className="appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {functions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.expression})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Second Function Picker for Between Mode */}
          {activeMode === 'between' && functions.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Zweite Funktion:</span>
              <div className="relative">
                <select
                  value={secondFunctionId}
                  onChange={(e) => {
                    sounds.playPop();
                    setSecondFunctionId(e.target.value);
                  }}
                  className="appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 pr-8 text-rose-300 font-bold focus:outline-none focus:border-rose-400 cursor-pointer"
                >
                  {functions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.expression})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
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

          {/* Riemann Type Picker */}
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
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            {/* Lower bound a */}
            <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30">
              <div className="flex justify-between items-center text-xs text-emerald-400 font-mono font-bold">
                <span>Grenze (a):</span>
                <input
                  type="number"
                  step="any"
                  value={a}
                  onChange={(e) => setA(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-emerald-500/40 rounded px-1.5 py-0.5 text-right text-emerald-300 font-bold focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.05"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Upper bound b */}
            <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-amber-500/30">
              <div className="flex justify-between items-center text-xs text-amber-400 font-mono font-bold">
                <span>Grenze (b):</span>
                <input
                  type="number"
                  step="any"
                  value={b}
                  onChange={(e) => setB(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-amber-500/40 rounded px-1.5 py-0.5 text-right text-amber-300 font-bold focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.05"
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
                  className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="signed">Flächenbilanz (±)</option>
                  <option value="absolute">Geometrisch (|A|)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Antiderivative Toggle */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">Stammfunktion F(x)</span>
              <input
                type="checkbox"
                checked={showAntiderivative || activeMode === 'hdi_accumulator'}
                onChange={(e) => setShowAntiderivative(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Magnetic Quick-Snap Badges for Detected Nullstellen & Schnittpunkte */}
          {allKeyPoints.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                <Magnet className="w-3.5 h-3.5 text-amber-400" />
                Spezielle Punkte treffen:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allKeyPoints.slice(0, 8).map((kp, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-[11px] font-mono shadow-sm"
                  >
                    <span
                      className="font-bold truncate max-w-[120px]"
                      style={{ color: kp.type === 'root' ? (kp.color || '#38bdf8') : '#e879f9' }}
                    >
                      {kp.type === 'root' ? `Nullst. ${kp.funcName}` : `Schnitt ${kp.funcName}`}: {kp.x.toLocaleString('de-DE', { maximumFractionDigits: 3 })}
                    </span>
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => {
                          sounds.playPop();
                          setA(kp.x);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          Math.abs(a - kp.x) < 0.005
                            ? 'bg-emerald-500 text-slate-950 font-extrabold'
                            : 'bg-slate-900 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                        }`}
                        title={`Untere Grenze a auf ${kp.x} setzen`}
                      >
                        a
                      </button>
                      <button
                        onClick={() => {
                          sounds.playPop();
                          setB(kp.x);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          Math.abs(b - kp.x) < 0.005
                            ? 'bg-amber-500 text-slate-950 font-extrabold'
                            : 'bg-slate-900 text-amber-400 hover:bg-amber-600 hover:text-white'
                        }`}
                        title={`Obere Grenze b auf ${kp.x} setzen`}
                      >
                        b
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* The Live Multi-Function Canvas Graph */}
        <IntegralCanvasGraph
          functionsList={compiledFunctions}
          primaryFunctionId={primaryFunctionId}
          secondFunctionId={secondFunctionId}
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
          signedIntegral={signedIntegral}
          absoluteArea={absoluteArea}
          areaBetween={areaBetween}
          riemannSum={riemannSum}
          rootsInInterval={roots}
        />

        {/* Live Calculation Scorecard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-mono block">Integralausdruck:</span>
              <div className="text-base font-bold text-cyan-300 mt-0.5">
                <MathRenderer latex={`\\int_{${a}}^{${b}} (${formatLatex(primaryItem?.expression || '0')}) \\, dx`} />
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
                {activeMode === 'riemann' ? 'Exaktes Integral:' : activeMode === 'between' ? 'Fläche zwischen Graphen:' : 'Geometrische Fläche:'}
              </span>
              <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-0.5">
                {activeMode === 'riemann' ? signedIntegral.toFixed(4) : activeMode === 'between' ? `${Math.abs(areaBetween).toFixed(4)} FE` : `${absoluteArea.toFixed(4)} FE`}
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

        {activeMode === 'between' && primaryItem && secondItem && (
          <IntegralTwoFunctions
            fStr={primaryItem.expression}
            gStr={secondItem.expression}
            onUpdateG={(newG) => handleUpdateExpression(secondItem.id, newG)}
            areaBetween={areaBetween}
            a={a}
            b={b}
            onSetPreset={(f, g, newA, newB) => {
              handleUpdateExpression(primaryItem.id, f);
              handleUpdateExpression(secondItem.id, g);
              setA(newA);
              setB(newB);
            }}
          />
        )}

        {activeMode === 'single' && primaryItem && (
          <IntegralStepByStep
            functionString={primaryItem.expression}
            a={a}
            b={b}
            signedIntegral={signedIntegral}
            absoluteArea={absoluteArea}
            roots={roots}
          />
        )}

        {activeMode === 'hdi_accumulator' && primaryItem && (
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
                <span>Aufsummierte Fläche A(x) = {computeDefiniteIntegral(primaryItem.fn, a, xAccumulator, false).toFixed(4)}</span>
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
        currentExpression={modalTargetId ? functions.find((f) => f.id === modalTargetId)?.expression || 'x^2' : 'x^2 - 2'}
        onApplyFunction={handleApplyModalFunction}
      />
    </div>
  );
};

import React from 'react';
import { MathRenderer } from '../common/MathRenderer';
import { Sparkles, Layers } from 'lucide-react';

interface IntegralRiemannExplainerProps {
  exactIntegral: number;
  riemannSum: number;
  n: number;
  onUpdateN: (newN: number) => void;
  riemannType: 'left' | 'right' | 'midpoint' | 'trapezoid';
  onUpdateType: (newType: 'left' | 'right' | 'midpoint' | 'trapezoid') => void;
  a: number;
  b: number;
}

export const IntegralRiemannExplainer: React.FC<IntegralRiemannExplainerProps> = ({
  exactIntegral,
  riemannSum,
  n,
  onUpdateN,
  riemannType,
  onUpdateType,
  a,
  b
}) => {
  const error = Math.abs(riemannSum - exactIntegral);
  const percentAccuracy = Math.max(0, 100 - (error / Math.max(1, Math.abs(exactIntegral))) * 100);
  const dx = (Math.abs(b - a) / n).toFixed(3);

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Approximation & Grenzwerte
            </span>
            <h3 className="text-xl font-bold text-white">Riemann-Summen & Rechtecks-Verfahren</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Wie funktioniert Integration überhaupt? Bernhard Riemann teilte die Fläche in winzige Rechtecke mit Breite <MathRenderer latex="\Delta x" /> auf!
          </p>
        </div>

        {/* Method selector */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => onUpdateType('left')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              riemannType === 'left' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Links-Summe
          </button>
          <button
            onClick={() => onUpdateType('right')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              riemannType === 'right' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rechts-Summe
          </button>
          <button
            onClick={() => onUpdateType('midpoint')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              riemannType === 'midpoint' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mittelpunkt-Summe
          </button>
          <button
            onClick={() => onUpdateType('trapezoid')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              riemannType === 'trapezoid' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trapez-Regel
          </button>
        </div>
      </div>

      {/* Slider for n subdivisions */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            Anzahl der Streifen (n):
          </span>
          <span className="font-mono font-bold text-white bg-blue-600/30 border border-blue-500/40 px-2.5 py-0.5 rounded-lg text-sm">
            n = {n} Rechtecke (<MathRenderer latex={`\\Delta x = ${dx}`} />)
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={n}
          onChange={(e) => onUpdateN(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>n = 1 (Grobes Rechteck)</span>
          <span>n = 50</span>
          <span>n = 100 (Fast exakt!)</span>
        </div>
      </div>

      {/* Convergence Comparison Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Riemann Result */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-blue-500/30">
          <span className="text-xs text-blue-400 uppercase font-mono block mb-1">
            Riemann-Summe ({n} Streifen):
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {riemannSum.toFixed(4)}
          </div>
          <span className="text-[11px] text-slate-500">
            <MathRenderer latex="S_n = \sum_{i=1}^n f(x_i^*) \Delta x" />
          </span>
        </div>

        {/* Exact Integral */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/30">
          <span className="text-xs text-emerald-400 uppercase font-mono block mb-1">
            Exakter Grenzwert (Integral):
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {exactIntegral.toFixed(4)}
          </div>
          <span className="text-[11px] text-slate-500">
            <MathRenderer latex="\lim_{n \to \infty} S_n = \int_a^b f(x)dx" />
          </span>
        </div>

        {/* Approximation Error */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
          <span className="text-xs text-amber-400 uppercase font-mono block mb-1">
            Abweichung / Fehler (Δ):
          </span>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {error.toFixed(4)}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${percentAccuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Concept Explanation Card */}
      <div className="p-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 rounded-xl border border-blue-500/20 text-xs text-slate-300 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-1 text-sm">
          <Sparkles className="w-4 h-4" />
          Das Riemannsche Integral-Prinzip:
        </div>
        Je schmaler die Streifen <MathRenderer latex="\Delta x \to 0" /> werden (d.h. je größer <MathRenderer latex="n \to \infty" /> wird), desto besser schmiegen sich die Rechtecke an den kurvigen Graphen an. Im Grenzwert verschwindet der Approximationsfehler vollständig – daraus entsteht das <strong>bestimmte Integral</strong>!
      </div>
    </div>
  );
};

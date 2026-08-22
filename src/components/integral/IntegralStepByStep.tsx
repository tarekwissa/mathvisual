import React from 'react';
import { MathRenderer } from '../common/MathRenderer';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { PresetFunction } from '../../types/math';

interface IntegralStepByStepProps {
  currentPreset?: PresetFunction;
  functionString: string;
  a: number;
  b: number;
  signedIntegral: number;
  absoluteArea: number;
  roots: number[];
}

export const IntegralStepByStep: React.FC<IntegralStepByStepProps> = ({
  currentPreset,
  functionString,
  a,
  b,
  signedIntegral,
  absoluteArea,
  roots
}) => {
  const antiderivativeLatex = currentPreset?.antiderivativeLatex || `F(x) = \\int (${functionString}) dx`;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
          Schritt für Schritt
        </span>
        <h3 className="text-xl font-bold text-white">Hauptsatz der Integralrechnung (HDI)</h3>
      </div>

      {/* Main HDI Formula Card */}
      <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono border-b border-slate-800/80 pb-2">
          <span>Der fundamentale Hauptsatz:</span>
          <span className="text-emerald-400 font-bold">Newton & Leibniz</span>
        </div>

        <div className="text-center py-2">
          <MathRenderer
            latex="\int_a^b f(x) \, dx = \left[ F(x) \right]_a^b = F(b) - F(a)"
            display
          />
        </div>

        <p className="text-xs text-slate-300">
          Um die Fläche unter der Kurve <MathRenderer latex="f(x)" /> zu bestimmen, bilden wir zuerst die <strong>Stammfunktion <MathRenderer latex="F(x)" /></strong> und ziehen dann den Wert an der unteren Grenze <MathRenderer latex="a" /> vom Wert an der oberen Grenze <MathRenderer latex="b" /> ab.
        </p>
      </div>

      {/* Step 1: Find Antiderivative */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs flex items-center justify-center font-mono">1</span>
          Stammfunktion F(x) bestimmen:
        </div>
        <div className="pl-7">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 inline-block">
            <MathRenderer latex={antiderivativeLatex} display />
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            (Aufleiten nach den Potenz-, Faktor- und Summenregeln)
          </span>
        </div>
      </div>

      {/* Step 2: Insert Bounds */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs flex items-center justify-center font-mono">2</span>
          Grenzen einsetzen: <MathRenderer latex={`a = ${a}`} /> und <MathRenderer latex={`b = ${b}`} />
        </div>
        <div className="pl-7 space-y-2">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[11px] text-slate-500 block">Obere Grenze F(b):</span>
              <span className="font-mono text-sm text-amber-400">F({b})</span>
            </div>
            <span className="text-slate-600 font-bold text-lg">−</span>
            <div>
              <span className="text-[11px] text-slate-500 block">Untere Grenze F(a):</span>
              <span className="font-mono text-sm text-emerald-400">F({a})</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 mx-2" />
            <div>
              <span className="text-[11px] text-slate-500 block">Flächenbilanz (Integral):</span>
              <span className="font-mono font-bold text-lg text-white">{signedIntegral.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crucial Concept: Signed Area vs Absolute Geometric Area */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 border border-purple-500/30 space-y-3">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Wichtiger Unterschied: Flächenbilanz vs. Tatsächliche Fläche!
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-400 uppercase font-mono block">1. Flächenbilanz (Integral):</span>
            <p className="text-slate-300">
              Flächen <em>unterhalb</em> der x-Achse zählen negativ, Flächen <em>oberhalb</em> positiv. Sie heben sich teilweise gegenseitig auf!
            </p>
            <div className="font-mono font-bold text-sm text-white pt-1">
              Ergebnis = {signedIntegral.toFixed(4)}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5">
            <span className="font-bold text-cyan-400 uppercase font-mono block">2. Geometrische Fläche (Inhalt A):</span>
            <p className="text-slate-300">
              Jede Fläche ist geometrisch positiv (<MathRenderer latex="A \ge 0" />). Bei Nullstellen im Intervall muss das Integral aufgeteilt werden!
            </p>
            <div className="font-mono font-bold text-sm text-cyan-300 pt-1">
              Ergebnis = {absoluteArea.toFixed(4)}
            </div>
          </div>
        </div>

        {roots.length > 0 && (
          <div className="text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-slate-300">
            📍 <strong>Gefundene Nullstellen in [{a}, {b}]:</strong> {roots.map(r => `x = ${r}`).join(', ')}
            <br />
            <span className="text-[11px] text-slate-400">
              Zur Berechnung des tatsächlichen Flächeninhalts wird integriert: <MathRenderer latex={`A = \\int_{${a}}^{${roots[0]}} |f(x)|dx + \\int_{${roots[0]}}^{${b}} |f(x)|dx`} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

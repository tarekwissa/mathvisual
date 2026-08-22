import React from 'react';
import { MathRenderer } from '../common/MathRenderer';

interface IntegralTwoFunctionsProps {
  fStr: string;
  gStr: string;
  onUpdateG: (newG: string) => void;
  areaBetween: number;
  a: number;
  b: number;
  onSetPreset: (f: string, g: string, a: number, b: number) => void;
}

export const IntegralTwoFunctions: React.FC<IntegralTwoFunctionsProps> = ({
  fStr,
  gStr,
  areaBetween,
  a,
  b,
  onSetPreset
}) => {
  const presets = [
    {
      name: 'Parabel & Gerade (Klassiker)',
      f: '4 - x^2',
      g: 'x + 2',
      a: -2,
      b: 1,
      desc: 'Schnittpunkte bei x = -2 und x = 1'
    },
    {
      name: 'Zwei Parabeln (Fischform)',
      f: '4 - x^2',
      g: 'x^2 - 4',
      a: -2,
      b: 2,
      desc: 'Symmetrische Fläche zwischen oberer und unterer Parabel'
    },
    {
      name: 'Sinus & Kosinus',
      f: 'sin(x)',
      g: 'cos(x)',
      a: 0.785, // pi/4
      b: 3.927, // 5pi/4
      desc: 'Fläche zwischen den Wellenbergen'
    }
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Fläche zwischen Kurven
            </span>
            <h3 className="text-xl font-bold text-white">Differenzfunktion f(x) − g(x)</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Wie berechnet man die von zwei Funktionen eingeschlossene Fläche? Obere Kurve minus untere Kurve!
          </p>
        </div>
      </div>

      {/* Preset Quick Chooser */}
      <div>
        <span className="text-xs font-mono uppercase text-slate-400 block mb-2 font-semibold">
          Typische Schulaufgaben & Beispiele:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSetPreset(p.f, p.g, p.a, p.b)}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300">
                {p.name}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                f(x) = {p.f} | g(x) = {p.g}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Formula & Calculation Breakdown */}
      <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
        <div className="text-center py-1">
          <MathRenderer
            latex="A = \int_a^b \left( f(x) - g(x) \right) \, dx = \int_a^b d(x) \, dx"
            display
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Obere Funktion (f):</span>
            <div className="text-cyan-400 font-mono font-bold">f(x) = {fStr}</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Untere Funktion (g):</span>
            <div className="text-rose-400 font-mono font-bold">g(x) = {gStr}</div>
          </div>
        </div>

        <div className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-300 uppercase font-mono block">Eingeschlossener Flächeninhalt (A):</span>
            <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
              A = {Math.abs(areaBetween).toFixed(4)} FE (Flächeneinheiten)
            </div>
          </div>
          <span className="text-xs text-purple-400 font-mono bg-purple-950/80 px-3 py-1.5 rounded-lg border border-purple-800/80">
            Intervall: [{a}, {b}]
          </span>
        </div>
      </div>
    </div>
  );
};

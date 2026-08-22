import React from 'react';
import { ArrowLeftRight, Sliders } from 'lucide-react';

interface PercentDoubleNumberLineProps {
  grundwert: number;
  prozentsatz: number;
  prozentwert: number;
  onUpdatePercent: (newPercent: number) => void;
}

export const PercentDoubleNumberLine: React.FC<PercentDoubleNumberLineProps> = ({
  grundwert,
  prozentsatz,
  prozentwert,
  onUpdatePercent
}) => {
  // SVG Pie geometry
  const angle = (prozentsatz / 100) * 360;
  const radius = 65;
  const cx = 80;
  const cy = 80;
  
  // Calculate arc endpoint
  const rad = ((angle - 90) * Math.PI) / 180;
  const x = cx + radius * Math.cos(rad);
  const y = cy + radius * Math.sin(rad);
  const largeArcFlag = angle > 180 ? 1 : 0;

  const pathData =
    prozentsatz >= 100
      ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
      : prozentsatz <= 0
      ? ''
      : `M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y} Z`;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-violet-500/20 text-violet-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Doppel-Zahlenstrahl & Kreis
            </span>
            <h3 className="text-xl font-bold text-white">Proportionales Verstehen</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Erkenne die direkte proportionale Verbindung zwischen Prozentwerten und den realen Zahlen.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Double Number Line Visualizer */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dual Number Line Graphic */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 relative select-none">
            {/* Top Line: Percentages */}
            <div className="relative mb-8">
              <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mb-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span className="text-violet-400">100% (Ganzes)</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-150"
                  style={{ width: `${Math.min(100, prozentsatz)}%` }}
                />
              </div>
            </div>

            {/* Connecting visual beam */}
            <div className="flex items-center justify-center my-1 text-slate-500 text-xs font-mono">
              <ArrowLeftRight className="w-4 h-4 mr-1 text-indigo-400" />
              Proportionale Zuordnung (1:1 Verhältnis)
            </div>

            {/* Bottom Line: Real Values (Grundwert / Prozentwert) */}
            <div className="relative mt-4">
              <div className="h-4 bg-slate-800 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 rounded-full transition-all duration-150"
                  style={{ width: `${Math.min(100, prozentsatz)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-400 mt-2">
                <span>0</span>
                <span>{(grundwert * 0.25).toLocaleString('de-DE', { maximumFractionDigits: 1 })}</span>
                <span>{(grundwert * 0.5).toLocaleString('de-DE', { maximumFractionDigits: 1 })}</span>
                <span>{(grundwert * 0.75).toLocaleString('de-DE', { maximumFractionDigits: 1 })}</span>
                <span className="text-emerald-400 font-bold">{grundwert.toLocaleString('de-DE')} (G)</span>
              </div>
            </div>

            {/* Interactive needle / position indicator */}
            <div
              className="absolute top-4 bottom-4 w-1 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] pointer-events-none rounded transition-all duration-150"
              style={{ left: `calc(1.5rem + (100% - 3rem) * ${Math.min(100, Math.max(0, prozentsatz)) / 100})` }}
            >
              <div className="absolute -top-3 -left-7 bg-amber-400 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap">
                {prozentsatz}%
              </div>
              <div className="absolute -bottom-3 -left-7 bg-amber-400 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap">
                W = {prozentwert.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
              </div>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Sliders className="w-3.5 h-3.5" />
                Schieberegler für Prozentsatz (p%):
              </span>
              <span className="font-mono text-base font-bold text-white bg-indigo-600/30 px-2 py-0.5 rounded border border-indigo-500/30">
                {prozentsatz}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={prozentsatz}
              onChange={(e) => onUpdatePercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Pie / Donut Chart & Angle Explanation */}
        <div className="lg:col-span-4 flex flex-col items-center bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-xl">
              {/* Full background circle */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="2"
              />
              {/* Slice path */}
              {pathData && (
                <path
                  d={pathData}
                  fill="url(#pieGradient)"
                  className="transition-all duration-200"
                />
              )}
              {/* Center hole for donut look */}
              <circle cx={cx} cy={cy} r={radius * 0.45} fill="#090d16" />

              <defs>
                <linearGradient id="pieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#8b5cf6" />
                  <stop offset="100%" stop-color="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center percentage label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-extrabold text-white font-mono">{prozentsatz}%</span>
              <span className="text-[10px] text-slate-400">vom Kreis</span>
            </div>
          </div>

          <div className="mt-4 text-center space-y-1">
            <div className="text-xs font-mono text-violet-300 font-semibold">
              Winkel im Kreis: α = {angle.toFixed(1)}°
            </div>
            <div className="text-[11px] text-slate-400">
              Formel: <span className="font-mono text-slate-300">{prozentsatz}% × 360° = {angle.toFixed(1)}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

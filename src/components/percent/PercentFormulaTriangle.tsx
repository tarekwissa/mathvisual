import React from 'react';
import { MathRenderer } from '../common/MathRenderer';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PercentFormulaTriangleProps {
  grundwert: number;
  prozentsatz: number;
  prozentwert: number;
  activeTarget: 'W' | 'G' | 'p';
  onSelectTarget: (target: 'W' | 'G' | 'p') => void;
}

export const PercentFormulaTriangle: React.FC<PercentFormulaTriangleProps> = ({
  grundwert,
  prozentsatz,
  prozentwert,
  activeTarget,
  onSelectTarget
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Das magische Dreieck
            </span>
            <h3 className="text-xl font-bold text-white">Formel-Pyramide</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Klicke auf die gesuchte Größe, um die Formel und den Rechenweg aufzudecken!
          </p>
        </div>

        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-medium">
          <button
            onClick={() => onSelectTarget('W')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTarget === 'W'
                ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Suche W (Wert)
          </button>
          <button
            onClick={() => onSelectTarget('G')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTarget === 'G'
                ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Suche G (Grundwert)
          </button>
          <button
            onClick={() => onSelectTarget('p')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTarget === 'p'
                ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Suche p% (Satz)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive SVG Triangle */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-72 h-64 select-none">
            <svg viewBox="0 0 300 260" className="w-full h-full drop-shadow-2xl">
              <defs>
                <linearGradient id="triBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#1e293b" />
                  <stop offset="100%" stop-color="#0f172a" />
                </linearGradient>
                <filter id="glowEffect">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Triangle Base Frame */}
              <polygon
                points="150,15 285,245 15,245"
                fill="url(#triBg)"
                stroke="#334155"
                strokeWidth="3"
                className="transition-all"
              />

              {/* Divider Lines: Horizontal (Division) and Vertical (Multiplication) */}
              <line x1="60" y1="140" x2="240" y2="140" stroke="#475569" strokeWidth="4" strokeDasharray="2 2" />
              <line x1="150" y1="140" x2="150" y2="245" stroke="#475569" strokeWidth="4" strokeDasharray="2 2" />

              {/* Operation Symbols */}
              <circle cx="150" cy="140" r="14" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
              <text x="150" y="145" textAnchor="middle" fill="#94a3b8" fontSize="16" fontWeight="bold">÷</text>

              <circle cx="150" cy="195" r="12" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
              <text x="150" y="199" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">×</text>

              {/* TOP: W Section (Prozentwert) */}
              <g
                className="cursor-pointer group"
                onClick={() => onSelectTarget('W')}
              >
                <polygon
                  points="150,22 235,135 65,135"
                  fill={activeTarget === 'W' ? '#059669' : '#1e293b'}
                  fillOpacity={activeTarget === 'W' ? 0.35 : 0.6}
                  stroke={activeTarget === 'W' ? '#10b981' : '#334155'}
                  strokeWidth={activeTarget === 'W' ? 3 : 1.5}
                  className="transition-all duration-300 group-hover:fill-emerald-950/60"
                />
                <text
                  x="150"
                  y="80"
                  textAnchor="middle"
                  fill={activeTarget === 'W' ? '#34d399' : '#e2e8f0'}
                  fontSize="24"
                  fontWeight="bold"
                >
                  W
                </text>
                <text
                  x="150"
                  y="105"
                  textAnchor="middle"
                  fill={activeTarget === 'W' ? '#6ee7b7' : '#94a3b8'}
                  fontSize="12"
                >
                  Prozentwert ({prozentwert.toLocaleString('de-DE', { maximumFractionDigits: 2 })})
                </text>
              </g>

              {/* BOTTOM LEFT: G Section (Grundwert) */}
              <g
                className="cursor-pointer group"
                onClick={() => onSelectTarget('G')}
              >
                <polygon
                  points="62,145 145,145 145,240 22,240"
                  fill={activeTarget === 'G' ? '#2563eb' : '#1e293b'}
                  fillOpacity={activeTarget === 'G' ? 0.35 : 0.6}
                  stroke={activeTarget === 'G' ? '#3b82f6' : '#334155'}
                  strokeWidth={activeTarget === 'G' ? 3 : 1.5}
                  className="transition-all duration-300 group-hover:fill-blue-950/60"
                />
                <text
                  x="85"
                  y="185"
                  textAnchor="middle"
                  fill={activeTarget === 'G' ? '#60a5fa' : '#e2e8f0'}
                  fontSize="22"
                  fontWeight="bold"
                >
                  G
                </text>
                <text
                  x="85"
                  y="210"
                  textAnchor="middle"
                  fill={activeTarget === 'G' ? '#93c5fd' : '#94a3b8'}
                  fontSize="11"
                >
                  Grundwert ({grundwert})
                </text>
              </g>

              {/* BOTTOM RIGHT: p% Section (Prozentsatz) */}
              <g
                className="cursor-pointer group"
                onClick={() => onSelectTarget('p')}
              >
                <polygon
                  points="155,145 238,145 278,240 155,240"
                  fill={activeTarget === 'p' ? '#d97706' : '#1e293b'}
                  fillOpacity={activeTarget === 'p' ? 0.35 : 0.6}
                  stroke={activeTarget === 'p' ? '#f59e0b' : '#334155'}
                  strokeWidth={activeTarget === 'p' ? 3 : 1.5}
                  className="transition-all duration-300 group-hover:fill-amber-950/60"
                />
                <text
                  x="215"
                  y="185"
                  textAnchor="middle"
                  fill={activeTarget === 'p' ? '#fbbf24' : '#e2e8f0'}
                  fontSize="22"
                  fontWeight="bold"
                >
                  p %
                </text>
                <text
                  x="215"
                  y="210"
                  textAnchor="middle"
                  fill={activeTarget === 'p' ? '#fde68a' : '#94a3b8'}
                  fontSize="11"
                >
                  Prozentsatz ({prozentsatz}%)
                </text>
              </g>
            </svg>
          </div>
          <span className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Tipp: Decke das Gesuchte mit dem Daumen ab!
          </span>
        </div>

        {/* Dynamic Formula Explanation Box */}
        <div className="lg:col-span-7 space-y-4">
          {activeTarget === 'W' && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Berechnung des Prozentwerts (W)
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Wenn du den <strong>Grundwert (G)</strong> und den <strong>Prozentsatz (p%)</strong> kennst, multiplizierst du beide miteinander:
              </p>

              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-1 uppercase font-mono">Allgemeine Formel:</span>
                  <MathRenderer latex="W = G \cdot \frac{p}{100} = G \cdot p\%" display />
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 hidden md:block" />
                <div>
                  <span className="text-xs text-slate-500 block mb-1 uppercase font-mono">Mit aktuellen Zahlen:</span>
                  <MathRenderer
                    latex={`W = ${grundwert} \\cdot \\frac{${prozentsatz}}{100} = \\mathbf{${prozentwert.toLocaleString('de-DE', { maximumFractionDigits: 2 })}}`}
                    display
                  />
                </div>
              </div>

              <div className="mt-3 text-xs text-emerald-300/80 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/50">
                💡 <strong>Anschaulich:</strong> Du teilst das Ganze ({grundwert}) in 100 gleiche Teile und nimmst davon {prozentsatz} Teile.
              </div>
            </div>
          )}

          {activeTarget === 'G' && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                Berechnung des Grundwerts (G)
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Wenn du den <strong>Prozentwert (W)</strong> und den <strong>Prozentsatz (p%)</strong> kennst, teilst du den Wert durch den Prozentsatz:
              </p>

              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-1 uppercase font-mono">Allgemeine Formel:</span>
                  <MathRenderer latex="G = \frac{W}{p\%} = \frac{W \cdot 100}{p}" display />
                </div>
                <ArrowRight className="w-5 h-5 text-blue-400 hidden md:block" />
                <div>
                  <span className="text-xs text-slate-500 block mb-1 uppercase font-mono">Mit aktuellen Zahlen:</span>
                  <MathRenderer
                    latex={`G = \\frac{${prozentwert.toFixed(1)} \\cdot 100}{${prozentsatz}} = \\mathbf{${grundwert.toLocaleString('de-DE')}}`}
                    display
                  />
                </div>
              </div>

              <div className="mt-3 text-xs text-blue-300/80 bg-blue-950/30 p-2.5 rounded-lg border border-blue-900/50">
                💡 <strong>Anschaulich:</strong> Wenn {prozentsatz}% gleich {prozentwert.toFixed(1)} sind, dann sind 100% genau {grundwert}.
              </div>
            </div>
          )}

          {activeTarget === 'p' && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                Berechnung des Prozentsatzes (p%)
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Wenn du den <strong>Prozentwert (W)</strong> und den <strong>Grundwert (G)</strong> kennst, bestimmst du das Verhältnis und nimmst es mal 100:
              </p>

              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-1 uppercase font-mono">Allgemeine Formel:</span>
                  <MathRenderer latex="p\% = \frac{W}{G} \cdot 100\%" display />
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 hidden md:block" />
                <div>
                  <span className="text-xs text-slate-500 block mb-1 uppercase font-mono">Mit aktuellen Zahlen:</span>
                  <MathRenderer
                    latex={`p = \\frac{${prozentwert.toFixed(1)}}{${grundwert}} \\cdot 100 = \\mathbf{${prozentsatz.toLocaleString('de-DE')}\\%}`}
                    display
                  />
                </div>
              </div>

              <div className="mt-3 text-xs text-amber-300/80 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/50">
                💡 <strong>Anschaulich:</strong> Welcher Bruchteil ist {prozentwert.toFixed(1)} von {grundwert}? Als Dezimalzahl: {(prozentwert / grundwert).toFixed(4)} $\to$ {prozentsatz}%.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

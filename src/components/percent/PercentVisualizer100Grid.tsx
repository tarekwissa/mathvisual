import React, { useState } from 'react';
import { Sparkles, Grid3X3, Users, Coins } from 'lucide-react';

interface PercentVisualizer100GridProps {
  grundwert: number;
  prozentsatz: number;
  prozentwert: number;
  onUpdatePercent: (newPercent: number) => void;
}

export const PercentVisualizer100Grid: React.FC<PercentVisualizer100GridProps> = ({
  grundwert,
  prozentsatz,
  prozentwert,
  onUpdatePercent
}) => {
  const [iconMode, setIconMode] = useState<'boxes' | 'coins' | 'people'>('boxes');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Each square represents exactly 1% of the Grundwert
  const valuePerSquare = grundwert / 100;
  const filledSquaresCount = Math.round(prozentsatz);

  const handleBoxClick = (index: number) => {
    // index is 0..99 -> corresponds to 1% .. 100%
    const targetPercent = index + 1;
    onUpdatePercent(targetPercent);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              100er-Gitter
            </span>
            <h3 className="text-xl font-bold text-white">Das Hunderterfeld</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            "Prozent" heißt wörtlich <em>pro Hundert</em>. Jedes der 100 Kästchen entspricht genau <strong>1%</strong> bzw. <strong>{valuePerSquare.toLocaleString('de-DE', { maximumFractionDigits: 2 })}</strong>.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setIconMode('boxes')}
            className={`p-2 rounded-lg transition-all ${iconMode === 'boxes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            title="Kästchen-Ansicht"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIconMode('coins')}
            className={`p-2 rounded-lg transition-all ${iconMode === 'coins' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            title="Geld / Münzen"
          >
            <Coins className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIconMode('people')}
            className={`p-2 rounded-lg transition-all ${iconMode === 'people' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            title="Personen / Umfrage"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* 10x10 Grid Container */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div
            className="grid grid-cols-10 gap-1.5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl max-w-sm w-full aspect-square select-none cursor-pointer"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {Array.from({ length: 100 }, (_, i) => {
              const isFilled = i < filledSquaresCount;
              const isHovered = hoveredIndex === i;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleBoxClick(i)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  className={`relative rounded-md transition-all duration-200 flex items-center justify-center aspect-square ${
                    isFilled
                      ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm shadow-cyan-500/20 scale-100 hover:scale-110 ring-1 ring-white/20'
                      : 'bg-slate-800/80 text-slate-600 hover:bg-slate-700 hover:text-slate-300'
                  } ${isHovered ? 'ring-2 ring-amber-400 z-10' : ''}`}
                >
                  {iconMode === 'boxes' && (
                    <span className="text-[9px] font-mono font-medium opacity-80">
                      {i + 1}
                    </span>
                  )}
                  {iconMode === 'coins' && (
                    <span className="text-[10px] leading-none">
                      {isFilled ? '🪙' : '⚪'}
                    </span>
                  )}
                  {iconMode === 'people' && (
                    <span className="text-[10px] leading-none">
                      {isFilled ? '🧑' : '👤'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Klicke auf ein beliebiges Kästchen, um den Prozentsatz direkt zu setzen!
          </p>
        </div>

        {/* Breakdown details */}
        <div className="lg:col-span-6 space-y-4">
          {/* Live values banner */}
          <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                Gefärbte Kästchen:
              </span>
              <span className="font-bold text-white font-mono text-base">
                {filledSquaresCount} von 100 <span className="text-cyan-400 font-semibold">({prozentsatz}%)</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                Restliche Kästchen:
              </span>
              <span className="font-mono text-slate-300">
                {100 - filledSquaresCount} von 100 ({100 - prozentsatz}%)
              </span>
            </div>

            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-slate-400">Wert von 1 Kästchen (1%):</span>
              <span className="font-mono font-semibold text-indigo-300">
                {grundwert} ÷ 100 = {valuePerSquare.toLocaleString('de-DE', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Quick preset buttons for common percentages */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Häufige Anteile schnell testen:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '10% (Zehntel)', p: 10 },
                { label: '25% (Viertel)', p: 25 },
                { label: '50% (Hälfte)', p: 50 },
                { label: '75% (3/4)', p: 75 }
              ].map(preset => (
                <button
                  key={preset.p}
                  onClick={() => onUpdatePercent(preset.p)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition-all text-center ${
                    prozentsatz === preset.p
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <div className="font-bold">{preset.p}%</div>
                  <div className="text-[10px] opacity-75">{preset.label.split(' ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Value Summary Card */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-slate-900 rounded-xl border border-indigo-500/20 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-mono">Daraus folgt der Prozentwert:</div>
              <div className="text-2xl font-bold text-white mt-0.5 font-mono">
                {prozentwert.toLocaleString('de-DE', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right text-xs text-indigo-300">
              {filledSquaresCount} Kästchen × {valuePerSquare.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

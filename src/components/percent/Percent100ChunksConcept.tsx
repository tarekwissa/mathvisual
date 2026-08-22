import React, { useState } from 'react';
import { Scissors, Box, Layers } from 'lucide-react';

export const Percent100ChunksConcept: React.FC = () => {
  const [totalValue, setTotalValue] = useState<number>(300); // e.g. 300 €
  const [unit, setUnit] = useState<string>('€');
  const [chunksCount, setChunksCount] = useState<number>(20); // 20 chunks = 20%

  // 1 chunk is exactly totalValue / 100
  const oneChunkValue = totalValue / 100;
  const pickedValue = oneChunkValue * chunksCount;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Das Grundprinzip
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Die 100-Häppchen-Maschine
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            "Pro-Zent" bedeutet wörtlich: <strong>"Von Hundert"</strong>. Stell dir vor, wir zerschneiden alles in genau 100 gleiche Mini-Teile!
          </p>
        </div>

        {/* Quick Unit picker */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
          {['€ (Geld)', 'Schüler', 'Gramm', 'Follower'].map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u.split(' ')[0])}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                unit === u.split(' ')[0]
                  ? 'bg-amber-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Step 1 & Step 2 Visual Demonstration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Machine Step 1: The Whole */}
        <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400 font-mono font-bold uppercase flex items-center gap-1.5">
              <Box className="w-4 h-4" />
              1. Das Ganze
            </span>
            <span className="text-xs text-slate-500 font-mono">100%</span>
          </div>

          <div className="text-center py-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <div className="text-3xl font-extrabold text-white font-mono">
              {totalValue.toLocaleString('de-DE')} {unit}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Dein Startwert (100%)</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 block font-mono">Startwert ändern:</label>
            <input
              type="number"
              min="10"
              max="10000"
              step="10"
              value={totalValue}
              onChange={(e) => setTotalValue(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Machine Step 2: The 1% Chunk */}
        <div className="p-5 bg-slate-950/90 rounded-2xl border border-amber-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-mono font-bold uppercase flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-amber-400" />
              2. In 100 Teile teilen
            </span>
            <span className="text-xs text-amber-400 font-mono font-bold">1 Teil = 1%</span>
          </div>

          <div className="text-center py-4 bg-amber-950/20 rounded-xl border border-amber-500/20">
            <div className="text-3xl font-extrabold text-amber-300 font-mono">
              {oneChunkValue.toLocaleString('de-DE', { maximumFractionDigits: 2 })} {unit}
            </div>
            <span className="text-xs text-amber-200/80 mt-1 block">
              Wert von genau 1 Häppchen (1%)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {totalValue} {unit} geteilt durch 100 = <strong>{oneChunkValue.toFixed(2)} {unit}</strong> pro Teilchen.
          </p>
        </div>

        {/* Machine Step 3: Pick Chunks */}
        <div className="p-5 bg-slate-950/90 rounded-2xl border border-emerald-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-mono font-bold uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              3. Gewünschte Teile nehmen
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">{chunksCount}%</span>
          </div>

          <div className="text-center py-4 bg-emerald-950/20 rounded-xl border border-emerald-500/20">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              {pickedValue.toLocaleString('de-DE', { maximumFractionDigits: 2 })} {unit}
            </div>
            <span className="text-xs text-emerald-200/80 mt-1 block">
              {chunksCount} Teile zusammengenommen
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Du nimmst {chunksCount} Häppchen: {chunksCount} × {oneChunkValue.toFixed(2)} = <strong>{pickedValue.toFixed(2)} {unit}</strong>.
          </p>
        </div>
      </div>

      {/* Interactive Grabber / Chunks Slider */}
      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-300 font-bold">
            Wie viele der 100 Häppchen möchtest du nehmen? ({chunksCount} Teile = {chunksCount}%):
          </span>
          <span className="font-mono text-xl font-extrabold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-800/80">
            {chunksCount} Häppchen ({chunksCount}%)
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={chunksCount}
          onChange={(e) => setChunksCount(Number(e.target.value))}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        {/* Visual Mini Chunks Representation */}
        <div className="flex flex-wrap gap-1 p-3 bg-slate-900 rounded-xl border border-slate-800/80 max-h-28 overflow-y-auto">
          {Array.from({ length: 100 }, (_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-sm transition-all ${
                i < chunksCount
                  ? 'bg-amber-400 shadow-sm shadow-amber-400/50 scale-105'
                  : 'bg-slate-800 opacity-40'
              }`}
              title={`Häppchen #${i + 1} = ${oneChunkValue.toFixed(2)} ${unit}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

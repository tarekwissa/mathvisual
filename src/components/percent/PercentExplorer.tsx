import React, { useState } from 'react';
import { PercentGlassVisualizer } from './PercentGlassVisualizer';
import { Percent100ChunksConcept } from './Percent100ChunksConcept';
import { PercentPizzaCutter } from './PercentPizzaCutter';
import { PercentIntuitionGame } from './PercentIntuitionGame';
import { PercentRealWorldScenarios } from './PercentRealWorldScenarios';
import { PercentFormulaTriangle } from './PercentFormulaTriangle';
import { Percent, ChevronDown } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const PercentExplorer: React.FC = () => {
  const [activeView, setActiveView] = useState<
    'glass' | 'chunks' | 'pizza' | 'game' | 'scenarios' | 'triangle'
  >('glass');

  const [grundwert] = useState<number>(200);
  const [prozentsatz] = useState<number>(35);
  const [activeTarget, setActiveTarget] = useState<'W' | 'G' | 'p'>('W');
  const prozentwert = (grundwert * prozentsatz) / 100;

  const viewOptions = [
    { id: 'glass', label: '1. Füllstands-Labor (Wie voll ist das Glas?)' },
    { id: 'chunks', label: '2. Die 100-Häppchen-Maschine' },
    { id: 'pizza', label: '3. Pizza- & Schoko-Teiler (Brüche zu %)' },
    { id: 'game', label: '4. Augenmaß-Trainer (Schätz-Labor)' },
    { id: 'scenarios', label: '5. Reallife (Rabatt, MwSt, Trinkgeld)' },
    { id: 'triangle', label: '6. Formel-Pyramide (Für die Schule)' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Intro Hero Banner with Dropdown Selection */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/20 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Percent className="w-4 h-4 text-amber-400" />
              Visuelles Verstehen ohne Formeln
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Der Prozent-Erklärer
            </h1>
            <p className="mt-1 text-slate-300 max-w-2xl text-xs sm:text-sm leading-relaxed">
              Vergiss komplizierte Formeln! Wähle ein interaktives Lern-Modell aus:
            </p>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative min-w-[280px]">
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-semibold">
              Lern-Modell wählen:
            </label>
            <div className="relative">
              <select
                value={activeView}
                onChange={(e) => {
                  sounds.playPop();
                  setActiveView(e.target.value as any);
                }}
                className="w-full appearance-none bg-slate-950 border border-amber-500/40 hover:border-amber-400 rounded-2xl px-4 py-3 pr-10 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-400 cursor-pointer shadow-lg transition-all"
              >
                {viewOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3.5 top-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Concept Views */}
      <div className="transition-all duration-300">
        {activeView === 'glass' && <PercentGlassVisualizer />}

        {activeView === 'chunks' && <Percent100ChunksConcept />}

        {activeView === 'pizza' && <PercentPizzaCutter />}

        {activeView === 'game' && <PercentIntuitionGame />}

        {activeView === 'scenarios' && <PercentRealWorldScenarios />}

        {activeView === 'triangle' && (
          <PercentFormulaTriangle
            grundwert={grundwert}
            prozentsatz={prozentsatz}
            prozentwert={prozentwert}
            activeTarget={activeTarget}
            onSelectTarget={setActiveTarget}
          />
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { PercentGlassVisualizer } from './PercentGlassVisualizer';
import { Percent100ChunksConcept } from './Percent100ChunksConcept';
import { PercentPizzaCutter } from './PercentPizzaCutter';
import { PercentIntuitionGame } from './PercentIntuitionGame';
import { PercentRealWorldScenarios } from './PercentRealWorldScenarios';
import { PercentFormulaTriangle } from './PercentFormulaTriangle';
import { GlassWater, Scissors, Pizza, Eye, Tag, Layers, Percent } from 'lucide-react';

export const PercentExplorer: React.FC = () => {
  // Navigation tabs prioritizing intuitive visual understanding over dry formulas
  const [activeView, setActiveView] = useState<
    'glass' | 'chunks' | 'pizza' | 'game' | 'scenarios' | 'triangle'
  >('glass');

  // Background values for optional formula triangle
  const [grundwert] = useState<number>(200);
  const [prozentsatz] = useState<number>(35);
  const [activeTarget, setActiveTarget] = useState<'W' | 'G' | 'p'>('W');
  const prozentwert = (grundwert * prozentsatz) / 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Intro Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Percent className="w-4 h-4 text-amber-400" />
            Visuelles Verstehen ohne Formeln
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Der Prozent-Erklärer
          </h1>
          <p className="mt-2 text-slate-300 max-w-3xl text-sm sm:text-base leading-relaxed">
            Vergiss komplizierte Formeln! Prozent bedeutet einfach nur <strong>"Wie voll ist etwas?"</strong> oder <strong>"In 100 kleine Häppchen zerschnitten"</strong>. Erkunde das Thema mit interaktiven Experimenten:
          </p>
        </div>
      </div>

      {/* Modern Concept Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'glass', label: '1. Füllstands-Labor (Wie voll?)', icon: GlassWater },
          { id: 'chunks', label: '2. Die 100-Häppchen-Maschine', icon: Scissors },
          { id: 'pizza', label: '3. Pizza- & Schoko-Teiler (Brüche)', icon: Pizza },
          { id: 'game', label: '4. Augenmaß-Trainer (Schätz-Labor)', icon: Eye },
          { id: 'scenarios', label: '5. Reallife (Rabatt, MwSt, Trinkgeld)', icon: Tag },
          { id: 'triangle', label: '6. Formel-Pyramide (Für die Schule)', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-amber-600/20 scale-[1.02]'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
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

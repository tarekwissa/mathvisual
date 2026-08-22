import { useState } from 'react';
import type { AppModule } from './types/math';
import { Header } from './components/common/Header';
import { PercentExplorer } from './components/percent/PercentExplorer';
import { IntegralExplorer } from './components/integral/IntegralExplorer';
import { MathQuiz } from './components/quiz/MathQuiz';
import { FormulaeCheatSheet } from './components/formulae/FormulaeCheatSheet';

export function App() {
  const [activeModule, setActiveModule] = useState<AppModule>('prozent');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* App Header & Navigation */}
      <Header activeModule={activeModule} onSelectModule={setActiveModule} />

      {/* Main Interactive Content Area */}
      <main className="flex-1 pb-16">
        {activeModule === 'prozent' && <PercentExplorer />}
        {activeModule === 'integral' && <IntegralExplorer />}
        {activeModule === 'quiz' && <MathQuiz />}
        {activeModule === 'formeln' && <FormulaeCheatSheet />}
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-400">MatheVisual • Offline-fähige PWA</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            Interaktives Mathe-Labor für Schule, Studium & Jugendliche
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveModule('prozent')}
              className="hover:text-slate-300 transition-colors"
            >
              Prozentrechnung
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModule('integral')}
              className="hover:text-slate-300 transition-colors"
            >
              Integralrechnung
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveModule('quiz')}
              className="hover:text-slate-300 transition-colors"
            >
              Trainer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { MathRenderer } from '../common/MathRenderer';

interface FormulaItem {
  id: string;
  category: 'prozent' | 'integral';
  title: string;
  latex: string;
  description: string;
  example: string;
}

const FORMULAS: FormulaItem[] = [
  // Prozentrechnung
  {
    id: 'f_w',
    category: 'prozent',
    title: 'Prozentwert (W)',
    latex: 'W = G \\cdot \\frac{p}{100} = G \\cdot p\\%',
    description: 'Berechnet den konkreten Teilbetrag W aus Grundwert G und Prozentsatz p%.',
    example: '20% von 80 €: W = 80 · 0,20 = 16 €'
  },
  {
    id: 'f_g',
    category: 'prozent',
    title: 'Grundwert (G)',
    latex: 'G = \\frac{W}{p\\%} = \\frac{W \\cdot 100}{p}',
    description: 'Berechnet das Ganze (100%), wenn der Teilbetrag W und der Prozentsatz p% bekannt sind.',
    example: '15 € sind 30%: G = (15 · 100) / 30 = 50 €'
  },
  {
    id: 'f_p',
    category: 'prozent',
    title: 'Prozentsatz (p%)',
    latex: 'p\\% = \\frac{W}{G} \\cdot 100\\%',
    description: 'Bestimmt den Anteil in Hundertsteln aus Prozentwert W und Grundwert G.',
    example: '12 von 60 Schülern: p = (12 / 60) · 100 = 20%'
  },
  {
    id: 'f_change',
    category: 'prozent',
    title: 'Prozentuale Veränderung (Wachstum / Rabatt)',
    latex: 'G_{\\text{neu}} = G_{\\text{alt}} \\cdot \\left( 1 \\pm \\frac{p}{100} \\right)',
    description: 'Schnellrechnung mit Wachstumsfaktor (z.B. +19% MwSt = · 1,19; -20% Rabatt = · 0,80).',
    example: '100 € + 19% MwSt = 100 · 1,19 = 119 €'
  },
  // Integralrechnung
  {
    id: 'f_hdi',
    category: 'integral',
    title: 'Hauptsatz der Integralrechnung (HDI)',
    latex: '\\int_a^b f(x) \\, dx = \\left[ F(x) \\right]_a^b = F(b) - F(a)',
    description: 'Verbindet Differential- und Integralrechnung: Das bestimmte Integral ist gleich der Differenz der Stammfunktionswerte.',
    example: '∫_0^2 x² dx = [1/3 x³]_0^2 = 8/3 - 0 = 2,67'
  },
  {
    id: 'f_potenz',
    category: 'integral',
    title: 'Potenzregel der Integration',
    latex: '\\int x^n \\, dx = \\frac{1}{n+1} x^{n+1} + C \\quad (n \\neq -1)',
    description: 'Der Exponent wird um 1 erhöht und man teilt durch den neuen Exponenten.',
    example: '∫ x³ dx = 1/4 x⁴ + C'
  },
  {
    id: 'f_between',
    category: 'integral',
    title: 'Fläche zwischen zwei Graphen',
    latex: 'A = \\int_a^b \\left( f(x) - g(x) \\right) \\, dx',
    description: 'Flächeninhalt zwischen der oberen Funktion f(x) und der unteren Funktion g(x).',
    example: 'Differenzfunktion d(x) = f(x) - g(x) bilden und integrieren'
  },
  {
    id: 'f_riemann',
    category: 'integral',
    title: 'Riemann-Summe (Definition)',
    latex: '\\int_a^b f(x) \\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i^*) \\cdot \\Delta x',
    description: 'Das Integral als Grenzwert unendlich vieler, unendlich schmaler Rechtecksstreifen.',
    example: 'Δx = (b - a) / n'
  },
  {
    id: 'f_exp',
    category: 'integral',
    title: 'Exponentialfunktion Stammfunktion',
    latex: '\\int e^{k \\cdot x} \\, dx = \\frac{1}{k} e^{k \\cdot x} + C',
    description: 'Die e-Funktion bleibt beim Integrieren erhalten, geteilt durch die innere Ableitung k.',
    example: '∫ e^(2x) dx = 1/2 e^(2x) + C'
  },
  {
    id: 'f_trig',
    category: 'integral',
    title: 'Trigonometrische Stammfunktionen',
    latex: '\\int \\sin(x) \\, dx = -\\cos(x) + C, \\quad \\int \\cos(x) \\, dx = \\sin(x) + C',
    description: 'Wichtig: Das Integral von sin(x) ist -cos(x) (Vorzeichenwechsel!).',
    example: '∫_0^π sin(x) dx = [-cos(x)]_0^π = 1 - (-1) = 2'
  }
];

export const FormulaeCheatSheet: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'prozent' | 'integral'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = FORMULAS.filter((item) => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.example.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyLatex = (id: string, latex: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
            Nachschlagen & Lernen
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Formelsammlung & Mathe-Spickzettel
        </h2>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          Alle wichtigen Formeln, Stammfunktionen und Rechenregeln auf einen Blick – mit Beispielen und Erklärungen.
        </p>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Formel oder Begriff suchen (z.B. Grundwert, HDI, Potenzregel)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Alle' },
              { id: 'prozent', label: 'Prozent' },
              { id: 'integral', label: 'Integral' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  categoryFilter === f.id
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                  item.category === 'prozent'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                }`}>
                  {item.category === 'prozent' ? 'Prozentrechnung' : 'Integralrechnung'}
                </span>

                <button
                  onClick={() => handleCopyLatex(item.id, item.latex)}
                  className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  title="LaTeX kopieren"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 text-center my-2">
                <MathRenderer latex={item.latex} display />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
              <span className="text-indigo-400 font-semibold">Beispiel:</span> {item.example}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

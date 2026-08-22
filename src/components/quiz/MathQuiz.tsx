import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, HelpCircle, CheckCircle, XCircle, ArrowRight, Award, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { MathRenderer } from '../common/MathRenderer';
import type { QuizQuestion } from '../../types/math';
import { sounds } from '../../utils/soundEffects';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ==========================================
  // PROZENTRECHNUNG
  // ==========================================
  {
    id: 'p1',
    category: 'prozent',
    difficulty: 'leicht',
    title: 'Grundbegriffe der Prozentrechnung',
    question: 'Ein Skateboard kostet 80 €. Du bekommst 25 % Rabatt. Was ist in dieser Aufgabe der Grundwert (G)?',
    options: ['80 €', '25 %', '20 €', '60 €'],
    correctIndex: 0,
    explanation: 'Der Grundwert (G) ist immer das Ganze bzw. der Ausgangswert (100%), also der ursprüngliche Preis von 80 €.',
    formulaHint: 'G = 100\\% = \\text{Ausgangswert}'
  },
  {
    id: 'p2',
    category: 'prozent',
    difficulty: 'leicht',
    title: 'Bruch ➔ Prozent im Kopf',
    question: 'Welcher Prozentsatz entspricht dem Bruch 3/4 einer Pizza?',
    options: ['75 %', '50 %', '34 %', '66,7 %'],
    correctIndex: 0,
    explanation: '3/4 entspricht 3 von 4 Vierteln: 3 · 25% = 75%. (Oder 3 ÷ 4 = 0,75 = 75%).',
    formulaHint: '\\frac{3}{4} = \\frac{75}{100} = 75\\%'
  },
  {
    id: 'p3',
    category: 'prozent',
    difficulty: 'leicht',
    title: 'Prozentwert im Kopf berechnen',
    question: 'Wie viel sind 20 % von 150 €?',
    options: ['30 €', '15 €', '75 €', '20 €'],
    correctIndex: 0,
    explanation: '10% von 150 € sind 15 €. 20% ist das Doppelte, also 30 €. (W = 150 · 0,20 = 30 €).',
    formulaHint: 'W = G \\cdot \\frac{p}{100} = 150 \\cdot 0{,}20 = 30'
  },
  {
    id: 'p4',
    category: 'prozent',
    difficulty: 'leicht',
    title: 'Zehntel-Regel (10%)',
    question: 'Ein Paar Kopfhörer kostet 60 €. Wie viel sparst du bei 10 % Rabatt?',
    options: ['6 €', '10 €', '50 €', '0,60 €'],
    correctIndex: 0,
    explanation: '10% von einer Zahl bedeutet einfach: Komma um eine Stelle nach links verschieben! 60 € ÷ 10 = 6 €.',
    formulaHint: '10\\% = \\frac{1}{10} \\implies 60 \\div 10 = 6'
  },
  {
    id: 'p5',
    category: 'prozent',
    difficulty: 'mittel',
    title: 'Prozentsatz ermitteln',
    question: 'In einer Schulklasse mit 25 Schülern spielen 10 Schüler ein Instrument. Wie viel Prozent der Klasse sind das?',
    options: ['40 %', '25 %', '10 %', '50 %'],
    correctIndex: 0,
    explanation: 'p% = (W / G) · 100% = (10 / 25) · 100% = 0,40 · 100% = 40%.',
    formulaHint: 'p\\% = \\frac{W}{G} \\cdot 100\\%'
  },
  {
    id: 'p6',
    category: 'prozent',
    difficulty: 'mittel',
    title: 'Grundwert gesucht (Rückwärtsrechnen)',
    question: '12 % einer Schulklasse sind 6 Schüler. Wie viele Schüler hat die gesamte Klasse?',
    options: ['50 Schüler', '48 Schüler', '72 Schüler', '25 Schüler'],
    correctIndex: 0,
    explanation: 'Wenn 12% = 6 Schüler sind, dann ist 1% = 6 ÷ 12 = 0,5 Schüler. Das Ganze (100%) sind 100 · 0,5 = 50 Schüler.',
    formulaHint: 'G = \\frac{W \\cdot 100}{p} = \\frac{6 \\cdot 100}{12} = 50'
  },
  {
    id: 'p7',
    category: 'prozent',
    difficulty: 'mittel',
    title: 'Prozentuale Erhöhung (Wachstumsfaktor)',
    question: 'Dein Taschengeld von 40 € wird um 15 % erhöht. Welcher Multiplikator (Wachstumsfaktor) berechnet den neuen Betrag direkt?',
    options: ['· 1,15', '· 0,15', '· 15', '· 1,015'],
    correctIndex: 0,
    explanation: 'Ausgangswert ist 100% (1,00). Kommen 15% (0,15) hinzu, rechnet man mit dem Faktor 1,15: 40 € · 1,15 = 46 €.',
    formulaHint: 'q = 1 + \\frac{p}{100} = 1 + 0{,}15 = 1{,}15'
  },
  {
    id: 'p8',
    category: 'prozent',
    difficulty: 'knifflig',
    title: 'Mehrwertsteuer-Falle',
    question: 'Ein Smartphone kostet im Laden brutto 595 € (inkl. 19 % MwSt.). Wie hoch ist der reine Nettopreis?',
    options: ['500 €', '481,95 €', '519 €', '495 €'],
    correctIndex: 0,
    explanation: 'Klassische Falle! Der Bruttopreis entspricht 119% des Nettopreises. Netto = 595 € ÷ 1,19 = 500 €.',
    formulaHint: '\\text{Netto} = \\frac{\\text{Brutto}}{1{,}19} = \\frac{595}{1{,}19} = 500'
  },
  {
    id: 'p9',
    category: 'prozent',
    difficulty: 'knifflig',
    title: 'Hintereinander geschaltete Rabatte (Aktions-Rabatt)',
    question: 'Ein Pullover wird zuerst um 20 % reduziert, an der Kasse gibt es nochmal 10 % Extra-Rabatt auf den reduzierten Preis. Wie viel Prozent Rabatt gibt es insgesamt im Vergleich zum Originalpreis?',
    options: ['28 %', '30 %', '25 %', '18 %'],
    correctIndex: 0,
    explanation: 'Nach 20% Rabatt zahlt man 80% (0,80). Darauf 10% Extra-Rabatt bedeutet: 0,80 · 0,90 = 0,72 = 72% Restpreis. Ersparnis: 100% - 72% = 28% (NICHT 30%!).',
    formulaHint: '1 - (0{,}80 \\cdot 0{,}90) = 1 - 0{,}72 = 0{,}28 = 28\\%'
  },
  {
    id: 'p10',
    category: 'prozent',
    difficulty: 'knifflig',
    title: 'Prozentpunkte vs. Prozent',
    question: 'Der Zinssatz einer Bank steigt von 2 % auf 3 %. Um wie viele Prozentpunkte und um wie viel Prozent ist der Zinssatz gestiegen?',
    options: [
      'Um 1 Prozentpunkt und um 50 %',
      'Um 1 % und um 1 %',
      'Um 3 % und um 33 %',
      'Um 10 Prozentpunkte und um 100 %'
    ],
    correctIndex: 0,
    explanation: 'Die absolute Differenz (3 - 2) ist genau 1 Prozentpunkt. Relativ betrachtet ist der Anstieg von 2 auf 3 eine Zunahme um die Hälfte des Ausgangswertes, also um 50%!',
    formulaHint: '\\Delta = 3\\% - 2\\% = 1\\%\\text{p} \\quad \\text{relativ: } \\frac{1}{2} = 50\\%'
  },

  // ==========================================
  // INTEGRALRECHNUNG
  // ==========================================
  {
    id: 'i1',
    category: 'integral',
    difficulty: 'leicht',
    title: 'Stammfunktion einer Potenz',
    question: 'Welche Stammfunktion F(x) gehört zur Potenzfunktion f(x) = x³?',
    latexQuestion: 'f(x) = x^3',
    options: ['F(x) = 1/4 · x⁴ + C', 'F(x) = 3x² + C', 'F(x) = x⁴ + C', 'F(x) = 1/3 · x⁴ + C'],
    correctIndex: 0,
    explanation: 'Nach der Potenzregel der Integration erhöht sich der Exponent um 1 und man teilt durch den neuen Exponenten: ∫ x^n dx = 1/(n+1) · x^(n+1). Also 1/4 · x⁴.',
    formulaHint: '\\int x^n \\, dx = \\frac{1}{n+1} x^{n+1} + C'
  },
  {
    id: 'i2',
    category: 'integral',
    difficulty: 'leicht',
    title: 'Stammfunktion einer Konstanten',
    question: 'Was ist die Stammfunktion der konstanten Funktion f(x) = 7?',
    latexQuestion: 'f(x) = 7',
    options: ['F(x) = 7x + C', 'F(x) = 0', 'F(x) = 7/2 · x² + C', 'F(x) = 7 + C'],
    correctIndex: 0,
    explanation: 'Die Stammfunktion einer Konstante c ist c·x + C, da die Ableitung von 7x wieder 7 ergibt.',
    formulaHint: '\\int c \\, dx = c \\cdot x + C'
  },
  {
    id: 'i3',
    category: 'integral',
    difficulty: 'mittel',
    title: 'Bestimmtes Integral der Normalparabel',
    question: 'Was ist der Wert des bestimmten Integrals von f(x) = x² im Intervall [0, 3]?',
    latexQuestion: '\\int_0^3 x^2 \\, dx',
    options: ['9', '27', '3', '6'],
    correctIndex: 0,
    explanation: 'Stammfunktion ist F(x) = 1/3 · x³. Grenzen einsetzen: F(3) - F(0) = (1/3 · 27) - 0 = 9.',
    formulaHint: '\\left[ \\frac{1}{3} x^3 \\right]_0^3 = \\frac{27}{3} - 0 = 9'
  },
  {
    id: 'i4',
    category: 'integral',
    difficulty: 'mittel',
    title: 'Integral einer linearen Steigung',
    question: 'Berechne das bestimmte Integral von f(x) = 2x im Intervall [1, 4]:',
    latexQuestion: '\\int_1^4 2x \\, dx',
    options: ['15', '16', '8', '12'],
    correctIndex: 0,
    explanation: 'F(x) = x². Grenzen einsetzen: F(4) - F(1) = 4² - 1² = 16 - 1 = 15.',
    formulaHint: '\\left[ x^2 \\right]_1^4 = 16 - 1 = 15'
  },
  {
    id: 'i5',
    category: 'integral',
    difficulty: 'mittel',
    title: 'Flächenbilanz bei Punktsymmetrie',
    question: 'Was ist der Wert der Flächenbilanz von f(x) = x³ im symmetrischen Intervall [-2, 2]?',
    latexQuestion: '\\int_{-2}^2 x^3 \\, dx',
    options: ['0', '8', '16', '-8'],
    correctIndex: 0,
    explanation: 'Da f(x) = x³ punktsymmetrisch zum Ursprung ist, ist die Fläche unterhalb der x-Achse negativ und oberhalb positiv. Bei der Flächenbilanz heben sich beide Flächen exakt zu 0 auf!',
    formulaHint: '\\int_{-a}^a f_{\\text{ungerade}}(x) \\, dx = 0'
  },
  {
    id: 'i6',
    category: 'integral',
    difficulty: 'mittel',
    title: 'Stammfunktion der Exponentialfunktion',
    question: 'Welche Stammfunktion gehört zur natürlichen Exponentialfunktion f(x) = e^x?',
    latexQuestion: 'f(x) = e^x',
    options: ['F(x) = e^x + C', 'F(x) = x · e^(x-1) + C', 'F(x) = ln(x) + C', 'F(x) = 1/2 · e^(2x) + C'],
    correctIndex: 0,
    explanation: 'Die Exponentialfunktion e^x ist ihre eigene Ableitung und Stammfunktion! ∫ e^x dx = e^x + C.',
    formulaHint: '\\int e^x \\, dx = e^x + C'
  },
  {
    id: 'i7',
    category: 'integral',
    difficulty: 'mittel',
    title: 'Stammfunktion von Sinus',
    question: 'Was ist die Stammfunktion von f(x) = sin(x)?',
    latexQuestion: 'f(x) = \\sin(x)',
    options: ['F(x) = -cos(x) + C', 'F(x) = cos(x) + C', 'F(x) = -sin(x) + C', 'F(x) = tan(x) + C'],
    correctIndex: 0,
    explanation: 'Da die Ableitung von cos(x) gleich -sin(x) ist, muss die Stammfunktion von sin(x) gleich -cos(x) sein.',
    formulaHint: '\\int \\sin(x) \\, dx = -\\cos(x) + C'
  },
  {
    id: 'i8',
    category: 'integral',
    difficulty: 'knifflig',
    title: 'Riemann-Summen & Grenzwert',
    question: 'Was passiert mit der Obersumme und der Untersumme, wenn die Anzahl der Rechtecke n gegen Unendlich geht (n ➔ ∞)?',
    options: [
      'Beide nähern sich an und konvergieren gegen das exakte bestimmte Integral',
      'Die Obersumme wird unendlich groß',
      'Die Untersumme sinkt auf 0 ab',
      'Der Approximationsfehler bleibt immer konstant'
    ],
    correctIndex: 0,
    explanation: 'Nach dem Satz von Bernhard Riemann konvergieren Obersumme und Untersumme für n ➔ ∞ gegen denselben Grenzwert: das exakte bestimmte Integral.',
    formulaHint: '\\lim_{n \\to \\infty} U_n = \\lim_{n \\to \\infty} O_n = \\int_a^b f(x) \\, dx'
  },
  {
    id: 'i9',
    category: 'integral',
    difficulty: 'knifflig',
    title: 'Hauptsatz der Analysis (HDI)',
    question: 'Was besagt der Hauptsatz der Differential- und Integralrechnung über die Beziehung zwischen Ableiten und Integrieren?',
    options: [
      'Integrieren und Ableiten sind zueinander umgekehrte Operationen: (∫ f(t) dt)\' = f(x)',
      'Jede Stammfunktion ist stets kleiner als die Ausgangsfunktion',
      'Integrale können nur für Geraden berechnet werden',
      'Das Ableiten von F(x) ergibt immer 0'
    ],
    correctIndex: 0,
    explanation: 'Der Hauptsatz (HDI) verbindet Differential- und Integralrechnung: Die Ableitung der Flächenfunktion F(x) = ∫_a^x f(t) dt ergibt exakt die Randfunktion f(x)!',
    formulaHint: '\\frac{d}{dx} \\left( \\int_a^x f(t) \\, dt \\right) = f(x)'
  },
  {
    id: 'i10',
    category: 'integral',
    difficulty: 'knifflig',
    title: 'Fläche zwischen zwei Graphen',
    question: 'Wie berechnet man die Fläche A zwischen einer oberen Funktion f(x) und einer unteren Funktion g(x) im Intervall [a, b]?',
    latexQuestion: 'A = \\int_a^b (f(x) - g(x)) \\, dx',
    options: [
      'Man integriert die Differenz: ∫ (obere Funktion - untere Funktion) dx',
      'Man multipliziert beide Integrale: ∫ f(x)dx · ∫ g(x)dx',
      'Man teilt das Integral von f(x) durch das Integral von g(x)',
      'Man berechnet nur das Integral von g(x)'
    ],
    correctIndex: 0,
    explanation: 'Die Fläche zwischen zwei Funktionsgraphen ist die Differenz der beiden Flächeninhalte, also das Integral der Differenzfunktion: ∫_a^b (f(x) - g(x)) dx.',
    formulaHint: 'A = \\int_a^b [f(x) - g(x)] \\, dx \\quad \\text{mit } f(x) \\ge g(x)'
  }
];

export const MathQuiz: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'alle' | 'prozent' | 'integral'>('alle');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'alle' | 'leicht' | 'mittel' | 'knifflig'>('alle');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const filteredQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) => {
      const matchCat = selectedCategory === 'alle' || q.category === selectedCategory;
      const matchDiff = selectedDifficulty === 'alle' || q.difficulty === selectedDifficulty;
      return matchCat && matchDiff;
    });
  }, [selectedCategory, selectedDifficulty]);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      sounds.playSuccess();
      const points = currentQ.difficulty === 'leicht' ? 10 : currentQ.difficulty === 'mittel' ? 20 : 30;
      setScore((s) => s + points + streak * 3);
      setStreak((st) => st + 1);
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.7 }
      });
    } else {
      sounds.playError();
      setStreak(0);
    }
  };

  const handleNext = () => {
    sounds.playPop();
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
    }
  };

  const handleResetQuiz = () => {
    sounds.playPop();
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Mathe-Challenge ({QUIZ_QUESTIONS.length} Aufgaben)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Interaktiver Wissenstrainer
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Teste dein Wissen in Prozent- & Integralrechnung mit Erklärungen & Formel-Tipps!
            </p>
          </div>

          {/* Score & Streak Counters */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
              <Flame className={`w-5 h-5 ${streak > 0 ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-600'}`} />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500">Streak</div>
                <div className="text-lg font-bold font-mono text-white">{streak}x</div>
              </div>
            </div>

            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500">Punkte</div>
                <div className="text-lg font-bold font-mono text-indigo-400">{score}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters: Category & Difficulty */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Thema:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'alle', label: `Alle (${QUIZ_QUESTIONS.length})` },
                { id: 'prozent', label: 'Prozentrechnung (10)' },
                { id: 'integral', label: 'Integralrechnung (10)' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    sounds.playPop();
                    setSelectedCategory(cat.id as any);
                    handleResetQuiz();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'alle', label: 'Alle Stufen' },
                { id: 'leicht', label: '🟢 Leicht' },
                { id: 'mittel', label: '🟡 Mittel' },
                { id: 'knifflig', label: '🔴 Knifflig' }
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => {
                    sounds.playPop();
                    setSelectedDifficulty(diff.id as any);
                    handleResetQuiz();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    selectedDifficulty === diff.id
                      ? 'bg-slate-800 border-slate-600 text-white shadow'
                      : 'bg-slate-950/80 border-slate-800 text-slate-500 hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-slate-400">
              Frage <strong>{currentIndex + 1}</strong> von <strong>{filteredQuestions.length}</strong>
            </span>
            <span className={`px-2.5 py-1 rounded-full uppercase font-mono font-bold text-[10px] ${
              currentQ.difficulty === 'leicht' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              currentQ.difficulty === 'mittel' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {currentQ.difficulty}
            </span>
          </div>

          {/* Question Progress Bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">{currentQ.title}</h3>
            <p className="text-slate-200 text-base leading-relaxed">{currentQ.question}</p>
            {currentQ.latexQuestion && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <MathRenderer latex={currentQ.latexQuestion} display />
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isCorrect = idx === currentQ.correctIndex;
              const isChosen = idx === selectedAnswer;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-slate-800/60';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/30 font-bold';
                } else if (isChosen) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-600 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isAnswered && isChosen && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Erklärung:
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{currentQ.explanation}</p>
              {currentQ.formulaHint && (
                <div className="pt-2">
                  <span className="text-xs text-slate-500 font-mono">Formel & Hintergrund:</span>
                  <div className="mt-1">
                    <MathRenderer latex={currentQ.formulaHint} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                sounds.playPop();
                setShowHint(!showHint);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? 'Tipp verbergen' : 'Formel-Tipp anzeigen'}
            </button>

            {isAnswered && (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                {currentIndex < filteredQuestions.length - 1 ? 'Nächste Frage' : 'Runde beendet – von vorne'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {showHint && currentQ.formulaHint && (
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
              💡 <strong>Tipp:</strong> <MathRenderer latex={currentQ.formulaHint} />
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 bg-slate-900/80 rounded-3xl border border-slate-800 text-center space-y-4">
          <p className="text-slate-400">Keine Fragen für die gewählten Filter gefunden.</p>
          <button
            onClick={() => {
              setSelectedCategory('alle');
              setSelectedDifficulty('alle');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
};

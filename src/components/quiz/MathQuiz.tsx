import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, HelpCircle, CheckCircle, XCircle, ArrowRight, Award } from 'lucide-react';
import { MathRenderer } from '../common/MathRenderer';
import type { QuizQuestion } from '../../types/math';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Prozentrechnung
  {
    id: 'p1',
    category: 'prozent',
    difficulty: 'leicht',
    title: 'Grundbegriffe der Prozentrechnung',
    question: 'Ein Skateboard kostet 80 €. Du bekommst 25 % Rabatt. Was ist in dieser Aufgabe der Grundwert (G)?',
    options: ['80 €', '25 %', '20 €', '60 €'],
    correctIndex: 0,
    explanation: 'Der Grundwert (G) ist immer das Ganze bzw. der Ausgangswert (100%), also der ursprüngliche Preis von 80 €.',
    formulaHint: 'G = 100% = Gesamter Ausgangspreis'
  },
  {
    id: 'p2',
    category: 'prozent',
    difficulty: 'leicht',
    title: 'Prozentwert berechnen',
    question: 'Wie viel sind 20 % von 150 €?',
    options: ['30 €', '15 €', '75 €', '20 €'],
    correctIndex: 0,
    explanation: 'W = G · (p / 100) = 150 € · 0,20 = 30 €.',
    formulaHint: 'W = G \\cdot \\frac{p}{100}'
  },
  {
    id: 'p3',
    category: 'prozent',
    difficulty: 'mittel',
    title: 'Prozentsatz ermitteln',
    question: 'In einer Klasse mit 25 Schülern spielen 10 Schüler ein Instrument. Wie viel Prozent sind das?',
    options: ['40 %', '25 %', '10 %', '50 %'],
    correctIndex: 0,
    explanation: 'p% = (W / G) · 100% = (10 / 25) · 100% = 0,40 · 100% = 40%.',
    formulaHint: 'p\\% = \\frac{W}{G} \\cdot 100\\%'
  },
  {
    id: 'p4',
    category: 'prozent',
    difficulty: 'knifflig',
    title: 'Mehrwertsteuer-Rückrechnung',
    question: 'Ein Smartphone kostet im Laden brutto 595 € (inkl. 19 % MwSt.). Wie hoch ist der reine Nettopreis?',
    options: ['500 €', '481,95 €', '519 €', '495 €'],
    correctIndex: 0,
    explanation: 'Typische Falle! Der Bruttopreis entspricht 119%. Netto = Brutto / 1,19 = 595 € / 1,19 = 500 €.',
    formulaHint: 'Netto = \\frac{Brutto}{1{,}19}'
  },
  // Integralrechnung
  {
    id: 'i1',
    category: 'integral',
    difficulty: 'leicht',
    title: 'Stammfunktion einer Potenz',
    question: 'Welche Stammfunktion F(x) gehört zur Funktion f(x) = x³?',
    latexQuestion: 'f(x) = x^3',
    options: ['F(x) = 1/4 · x⁴ + C', 'F(x) = 3x² + C', 'F(x) = x⁴ + C', 'F(x) = 1/3 · x⁴ + C'],
    correctIndex: 0,
    explanation: 'Nach der Potenzregel der Integration erhöht sich der Exponent um 1 und man teilt durch den neuen Exponenten: ∫ x^n dx = (1/(n+1)) x^(n+1). Also 1/4 · x⁴.',
    formulaHint: '\\int x^n dx = \\frac{1}{n+1} x^{n+1}'
  },
  {
    id: 'i2',
    category: 'integral',
    difficulty: 'mittel',
    title: 'Bestimmtes Integral der Normalparabel',
    question: 'Was ist der Wert des bestimmten Integrals von f(x) = x² in den Grenzen von 0 bis 3?',
    latexQuestion: '\\int_0^3 x^2 \\, dx',
    options: ['9', '27', '3', '6'],
    correctIndex: 0,
    explanation: 'F(x) = 1/3 · x³. Grenzen einsetzen: F(3) - F(0) = (1/3 · 27) - 0 = 9.',
    formulaHint: '\\left[ \\frac{1}{3} x^3 \\right]_0^3 = \\frac{27}{3} - 0 = 9'
  },
  {
    id: 'i3',
    category: 'integral',
    difficulty: 'mittel',
    title: 'Flächenbilanz bei Punktsymmetrie',
    question: 'Was ist der Wert der Flächenbilanz von f(x) = x³ im symmetrischen Intervall [-2, 2]?',
    latexQuestion: '\\int_{-2}^2 x^3 \\, dx',
    options: ['0', '8', '16', '-8'],
    correctIndex: 0,
    explanation: 'Da f(x) = x³ punktsymmetrisch zum Ursprung ist, ist die Fläche links der y-Achse negativ und rechts positiv. Bei der Flächenbilanz heben sich beide Flächen exakt zu 0 auf!',
    formulaHint: '\\int_{-a}^a f_{ungerade}(x) dx = 0'
  },
  {
    id: 'i4',
    category: 'integral',
    difficulty: 'knifflig',
    title: 'Riemann-Summen & Grenzwert',
    question: 'Was passiert mit der Obersumme und der Untersumme, wenn die Anzahl der Rechtecke n gegen Unendlich geht (n ➔ ∞)?',
    options: [
      'Beide nähern sich einander an und konvergieren gegen das exakte bestimmte Integral',
      'Die Obersumme wird unendlich groß',
      'Die Untersumme sinkt auf 0 ab',
      'Der Fehler bleibt immer konstant'
    ],
    correctIndex: 0,
    explanation: 'Nach dem Satz von Riemann konvergieren Ober- und Untersumme für integrierbare Funktionen für n ➔ ∞ gegen denselben Grenzwert, nämlich das bestimmte Integral.',
    formulaHint: '\\lim_{n \\to \\infty} U_n = \\lim_{n \\to \\infty} O_n = \\int_a^b f(x) dx'
  }
];

export const MathQuiz: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'alle' | 'prozent' | 'integral'>('alle');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const filteredQuestions = QUIZ_QUESTIONS.filter(
    q => selectedCategory === 'alle' || q.category === selectedCategory
  );

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore(s => s + 10 + streak * 2);
      setStreak(st => st + 1);
      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      // Finished all questions in category
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Mathe-Challenge
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Interaktiver Wissenstrainer
            </h2>
          </div>

          {/* Score & Streak Counters */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
              <Flame className={`w-5 h-5 ${streak > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
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

        {/* Category Selector Filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { id: 'alle', label: 'Alle Themen' },
            { id: 'prozent', label: 'Prozentrechnung' },
            { id: 'integral', label: 'Integralrechnung' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as any);
                setCurrentIndex(0);
                setIsAnswered(false);
                setSelectedAnswer(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
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

      {/* Main Question Card */}
      {currentQ && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-slate-400">
              Frage {currentIndex + 1} von {filteredQuestions.length}
            </span>
            <span className={`px-2.5 py-1 rounded-full uppercase font-mono font-bold text-[10px] ${
              currentQ.difficulty === 'leicht' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              currentQ.difficulty === 'mittel' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {currentQ.difficulty}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">{currentQ.title}</h3>
            <p className="text-slate-300 text-base leading-relaxed">{currentQ.question}</p>
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
                  btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/30';
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
                  <span className="text-xs text-slate-500 font-mono">Verwendete Formel:</span>
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
              onClick={() => setShowHint(!showHint)}
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
                {currentIndex < filteredQuestions.length - 1 ? 'Nächste Frage' : 'Quiz von vorne'}
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
      )}
    </div>
  );
};

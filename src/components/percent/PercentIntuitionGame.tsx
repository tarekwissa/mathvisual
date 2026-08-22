import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Eye, RefreshCw, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const PercentIntuitionGame: React.FC = () => {
  const [targetPercent, setTargetPercent] = useState<number>(42);
  const [guess, setGuess] = useState<number>(50);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [visualShape, setVisualShape] = useState<'bar' | 'circle' | 'grid'>('circle');

  const generateNewChallenge = () => {
    sounds.playPop();
    const randomP = Math.floor(Math.random() * 90) + 5;
    const shapes: ('bar' | 'circle' | 'grid')[] = ['circle', 'bar', 'grid'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    setTargetPercent(randomP);
    setVisualShape(randomShape);
    setGuess(50);
    setIsRevealed(false);
  };

  useEffect(() => {
    generateNewChallenge();
  }, []);

  const handleCheckGuess = () => {
    if (isRevealed) return;
    setIsRevealed(true);

    const diff = Math.abs(guess - targetPercent);
    if (diff <= 3) {
      // Amazing guess
      sounds.playSuccess();
      setScore(s => s + 30);
      setStreak(st => st + 1);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } else if (diff <= 8) {
      // Good guess
      sounds.playSuccess();
      setScore(s => s + 15);
      setStreak(st => st + 1);
    } else {
      sounds.playError();
      setStreak(0);
    }
  };

  const errorDiff = Math.abs(guess - targetPercent);

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Augenmaß & Gefühl
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Das Prozent-Schätz-Labor
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Trainiere dein mathematisches Auge: <strong>Schätze den gefärbten Anteil rein visuell!</strong>
          </p>
        </div>

        {/* Score and Streak */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Streak</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">{streak}x</span>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Punkte</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Target Visualizer (Secret Target) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-6 flex flex-col items-center justify-center p-8 bg-slate-950/80 rounded-3xl border border-slate-800 min-h-[260px]">
          {visualShape === 'circle' && (
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                <circle cx="50" cy="50" r="40" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                {targetPercent > 0 && (
                  <path
                    d={(() => {
                      const rad = ((targetPercent / 100) * 360 - 90) * (Math.PI / 180);
                      const x = 50 + 40 * Math.cos(rad);
                      const y = 50 + 40 * Math.sin(rad);
                      const large = targetPercent > 50 ? 1 : 0;
                      return `M 50 50 L 50 10 A 40 40 0 ${large} 1 ${x} ${y} Z`;
                    })()}
                    fill="#10b981"
                  />
                )}
                <circle cx="50" cy="50" r="18" fill="#090d16" />
              </svg>
            </div>
          )}

          {visualShape === 'bar' && (
            <div className="w-full max-w-xs space-y-2">
              <div className="h-16 w-full bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300"
                  style={{ width: `${targetPercent}%` }}
                />
              </div>
            </div>
          )}

          {visualShape === 'grid' && (
            <div className="grid grid-cols-10 gap-1 p-3 bg-slate-900 rounded-2xl border border-slate-800 max-w-[200px] aspect-square w-full">
              {Array.from({ length: 100 }, (_, i) => (
                <div
                  key={i}
                  className={`rounded-sm aspect-square ${
                    i < targetPercent ? 'bg-emerald-400 shadow-sm' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          )}

          <span className="text-xs text-slate-500 mt-4 font-mono">
            {isRevealed
              ? `Tatsächlicher Wert: ${targetPercent}%`
              : '❓ Wie viel Prozent sind gefärbt?'}
          </span>
        </div>

        {/* User Guess Controls */}
        <div className="md:col-span-6 space-y-6">
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                Deine Schätzung:
              </span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400 bg-emerald-950/60 px-4 py-1 rounded-xl border border-emerald-800/80">
                {guess}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={guess}
              disabled={isRevealed}
              onChange={(e) => setGuess(Number(e.target.value))}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-50"
            />

            {!isRevealed ? (
              <button
                onClick={handleCheckGuess}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                Schätzung überprüfen!
              </button>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                <div
                  className={`p-4 rounded-2xl border text-sm ${
                    errorDiff <= 3
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : errorDiff <= 8
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-rose-950/80 border-rose-500 text-rose-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    {errorDiff <= 3
                      ? '🎯 Phänomenal geschätzt! Perfektes Augenmaß!'
                      : errorDiff <= 8
                      ? '👍 Sehr gut! Fast genau getroffen.'
                      : '🧐 Knapp daneben – weiter so trainieren!'}
                  </div>
                  <div className="text-xs mt-1 opacity-90">
                    Tatsächlich: <strong>{targetPercent}%</strong> │ Dein Tipp: <strong>{guess}%</strong> │ Differenz: <strong>{errorDiff}%</strong>
                  </div>
                </div>

                <button
                  onClick={generateNewChallenge}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Nächste Schätz-Runde
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { X, Sparkles, Check, AlertCircle, Play } from 'lucide-react';
import { compileMathExpression } from '../../utils/mathParser';
import { MathRenderer } from '../common/MathRenderer';
import { sounds } from '../../utils/soundEffects';

interface IntegralCustomFunctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExpression: string;
  onApplyFunction: (expr: string) => void;
}

export const IntegralCustomFunctionModal: React.FC<IntegralCustomFunctionModalProps> = ({
  isOpen,
  onClose,
  currentExpression,
  onApplyFunction
}) => {
  const [exprInput, setExprInput] = useState<string>(currentExpression);

  // Compile and validate in real-time
  const { isValid, errorMessage } = useMemo(() => {
    return compileMathExpression(exprInput || '0');
  }, [exprInput]);

  // Convert raw formula to nice LaTeX representation
  const latexPreview = useMemo(() => {
    if (!exprInput.trim()) return 'f(x) = 0';
    let formatted = exprInput
      .replace(/\*/g, ' \\cdot ')
      .replace(/sqrt\((.*?)\)/g, '\\sqrt{$1}')
      .replace(/sin\((.*?)\)/g, '\\sin($1)')
      .replace(/cos\((.*?)\)/g, '\\cos($1)')
      .replace(/tan\((.*?)\)/g, '\\tan($1)')
      .replace(/exp\((.*?)\)/g, 'e^{$1}')
      .replace(/ln\((.*?)\)/g, '\\ln($1)')
      .replace(/pi/g, '\\pi');

    return `f(x) = ${formatted}`;
  }, [exprInput]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !exprInput.trim()) return;
    sounds.playSuccess();
    onApplyFunction(exprInput.trim());
    onClose();
  };

  const handleQuickPreset = (preset: string) => {
    sounds.playPop();
    setExprInput(preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Eigene Funktion eingeben</h3>
              <p className="text-xs text-slate-400">Tippe deine mathematische Formel ein</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-2">
              Funktionsterm f(x):
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={exprInput}
                onChange={(e) => setExprInput(e.target.value)}
                placeholder="z.B. x^3 - 3*x + 1"
                className={`w-full bg-slate-950 border rounded-2xl px-4 py-3.5 text-white font-mono text-base focus:outline-none transition-all ${
                  isValid
                    ? 'border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                    : 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                }`}
              />
              {isValid && exprInput.trim() && (
                <div className="absolute right-3.5 top-3.5 text-emerald-400">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>

            {!isValid && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono mt-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage || 'Ungültige mathematische Formel'}</span>
              </div>
            )}
          </div>

          {/* Real-Time Live LaTeX Preview */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-1 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-500 block font-bold">
              Mathematische LaTeX-Vorschau (Live):
            </span>
            <div className="text-lg sm:text-xl font-bold text-cyan-300 py-1 min-h-[36px] flex items-center justify-center">
              <MathRenderer latex={latexPreview} display />
            </div>
          </div>

          {/* Quick Formula Inspiration Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-mono block">Schnell-Vorlagen:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'x³ - 2x', val: 'x^3 - 2*x' },
                { label: 'sin(x)', val: 'sin(x)' },
                { label: 'cos(x)', val: 'cos(x)' },
                { label: 'x² - 4', val: 'x^2 - 4' },
                { label: 'e^(-x²)', val: 'exp(-x^2)' },
                { label: 'sqrt(x + 2)', val: 'sqrt(x + 2)' }
              ].map((chip) => (
                <button
                  type="button"
                  key={chip.val}
                  onClick={() => handleQuickPreset(chip.val)}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-mono transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onClose();
              }}
              className="flex-1 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-sm font-semibold transition-all"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!isValid || !exprInput.trim()}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              Graph zeichnen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

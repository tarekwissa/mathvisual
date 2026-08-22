import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PercentDreisatzProps {
  grundwert: number;
  prozentsatz: number;
  prozentwert: number;
  activeTarget: 'W' | 'G' | 'p';
}

export const PercentDreisatz: React.FC<PercentDreisatzProps> = ({
  grundwert,
  prozentsatz,
  prozentwert,
  activeTarget
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
          Schule & Methode
        </span>
        <h3 className="text-xl font-bold text-white">Der 3-Schritte-Dreisatz</h3>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Der Dreisatz funktioniert immer – auch ganz ohne Formel auswendig zu lernen! Hier ist der Rechenweg in drei klaren Schritten:
      </p>

      {activeTarget === 'W' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase font-mono">
                  <th className="py-2.5 px-4">Schritt</th>
                  <th className="py-2.5 px-4 text-cyan-400">Prozentsatz (%)</th>
                  <th className="py-2.5 px-4 text-center text-slate-500">Zuordnung</th>
                  <th className="py-2.5 px-4 text-emerald-400">Wert (€ / Anzahl)</th>
                  <th className="py-2.5 px-4 text-slate-400">Rechenoperation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {/* Step 1 */}
                <tr className="bg-slate-950/60 hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">1</span>
                    Ausgangswert
                  </td>
                  <td className="py-3 px-4 font-bold text-cyan-300">100 %</td>
                  <td className="py-3 px-4 text-center text-slate-500">≙</td>
                  <td className="py-3 px-4 font-bold text-emerald-300">{grundwert.toLocaleString('de-DE')} (Grundwert G)</td>
                  <td className="py-3 px-4 text-xs text-slate-400">Gegeben ist das Ganze (100%)</td>
                </tr>

                {/* Step 2 */}
                <tr className="bg-slate-950/40 hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">2</span>
                    Auf 1% herab
                  </td>
                  <td className="py-3 px-4 text-cyan-300 flex items-center gap-1.5">
                    1 %
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">÷ 100</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">≙</td>
                  <td className="py-3 px-4 text-emerald-300">
                    {(grundwert / 100).toLocaleString('de-DE', { maximumFractionDigits: 3 })}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">Beide Seiten geteilt durch 100 (1%)</td>
                </tr>

                {/* Step 3 */}
                <tr className="bg-emerald-950/20 border-emerald-500/40 hover:bg-emerald-950/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-xs flex items-center justify-center font-bold">3</span>
                    Auf {prozentsatz}% hoch
                  </td>
                  <td className="py-3 px-4 font-extrabold text-cyan-300 flex items-center gap-1.5">
                    {prozentsatz} %
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">× {prozentsatz}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-bold">≙</td>
                  <td className="py-3 px-4 font-extrabold text-emerald-400 text-base">
                    {prozentwert.toLocaleString('de-DE', { maximumFractionDigits: 2 })} (Prozentwert W)
                  </td>
                  <td className="py-3 px-4 text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ergebnis fertig berechnet!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTarget === 'G' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase font-mono">
                  <th className="py-2.5 px-4">Schritt</th>
                  <th className="py-2.5 px-4 text-cyan-400">Prozentsatz (%)</th>
                  <th className="py-2.5 px-4 text-center text-slate-500">Zuordnung</th>
                  <th className="py-2.5 px-4 text-blue-400">Wert (€ / Anzahl)</th>
                  <th className="py-2.5 px-4 text-slate-400">Rechenoperation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                <tr className="bg-slate-950/60">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">1</span>
                    Bekannter Anteil
                  </td>
                  <td className="py-3 px-4 font-bold text-cyan-300">{prozentsatz} %</td>
                  <td className="py-3 px-4 text-center text-slate-500">≙</td>
                  <td className="py-3 px-4 font-bold text-blue-300">{prozentwert.toLocaleString('de-DE')} (Prozentwert W)</td>
                  <td className="py-3 px-4 text-xs text-slate-400">Gegeben: {prozentsatz}% entsprechen {prozentwert}</td>
                </tr>
                <tr className="bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">2</span>
                    Auf 1% teilen
                  </td>
                  <td className="py-3 px-4 text-cyan-300">1 %</td>
                  <td className="py-3 px-4 text-center text-slate-500">≙</td>
                  <td className="py-3 px-4 text-blue-300">
                    {(prozentwert / prozentsatz).toLocaleString('de-DE', { maximumFractionDigits: 3 })}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">Beide Seiten geteilt durch {prozentsatz}</td>
                </tr>
                <tr className="bg-blue-950/20 border-blue-500/40">
                  <td className="py-3 px-4 font-bold text-blue-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-slate-950 text-xs flex items-center justify-center font-bold">3</span>
                    Auf 100% hochrechnen
                  </td>
                  <td className="py-3 px-4 font-extrabold text-cyan-300">100 %</td>
                  <td className="py-3 px-4 text-center text-slate-500 font-bold">≙</td>
                  <td className="py-3 px-4 font-extrabold text-blue-400 text-base">
                    {grundwert.toLocaleString('de-DE')} (Grundwert G)
                  </td>
                  <td className="py-3 px-4 text-xs text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Grundwert (100%) ermittelt!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTarget === 'p' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase font-mono">
                  <th className="py-2.5 px-4">Schritt</th>
                  <th className="py-2.5 px-4 text-blue-400">Wert (€ / Anzahl)</th>
                  <th className="py-2.5 px-4 text-center text-slate-500">Zuordnung</th>
                  <th className="py-2.5 px-4 text-amber-400">Prozentsatz (%)</th>
                  <th className="py-2.5 px-4 text-slate-400">Rechenoperation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                <tr className="bg-slate-950/60">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">1</span>
                    Gesamtwert
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-300">{grundwert.toLocaleString('de-DE')}</td>
                  <td className="py-3 px-4 text-center text-slate-500">≙</td>
                  <td className="py-3 px-4 font-bold text-amber-300">100 %</td>
                  <td className="py-3 px-4 text-xs text-slate-400">Der Grundwert {grundwert} sind 100%</td>
                </tr>
                <tr className="bg-slate-950/40">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">2</span>
                    Auf 1 Einheit teilen
                  </td>
                  <td className="py-3 px-4 text-blue-300">1</td>
                  <td className="py-3 px-4 text-center text-slate-500">≙</td>
                  <td className="py-3 px-4 text-amber-300">
                    {(100 / grundwert).toLocaleString('de-DE', { maximumFractionDigits: 3 })} %
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">Beide Seiten geteilt durch {grundwert}</td>
                </tr>
                <tr className="bg-amber-950/20 border-amber-500/40">
                  <td className="py-3 px-4 font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold">3</span>
                    Auf {prozentwert.toFixed(1)} multiplizieren
                  </td>
                  <td className="py-3 px-4 font-extrabold text-blue-300">{prozentwert.toLocaleString('de-DE')}</td>
                  <td className="py-3 px-4 text-center text-slate-500 font-bold">≙</td>
                  <td className="py-3 px-4 font-extrabold text-amber-400 text-base">
                    {prozentsatz.toLocaleString('de-DE')}%
                  </td>
                  <td className="py-3 px-4 text-xs text-amber-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Prozentsatz ermittelt!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

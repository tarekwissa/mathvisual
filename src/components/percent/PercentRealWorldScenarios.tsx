import React, { useState } from 'react';
import { Tag, Receipt, Utensils, AlertCircle } from 'lucide-react';
import { MathRenderer } from '../common/MathRenderer';

export const PercentRealWorldScenarios: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rabatt' | 'mwst' | 'trinkgeld'>('rabatt');

  // Rabatt state
  const [originalPrice, setOriginalPrice] = useState<number>(80);
  const [discountPercent, setDiscountPercent] = useState<number>(25);

  // MwSt state
  const [netPrice, setNetPrice] = useState<number>(100);
  const [taxRate, setTaxRate] = useState<number>(19);
  const [mwstMode, setMwstMode] = useState<'nettoToBrutto' | 'bruttoToNetto'>('nettoToBrutto');
  const [grossPrice, setGrossPrice] = useState<number>(119);

  // Trinkgeld state
  const [billAmount, setBillAmount] = useState<number>(45);
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [peopleCount, setPeopleCount] = useState<number>(3);

  // Rabatt calculations
  const discountAmount = (originalPrice * discountPercent) / 100;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  // MwSt calculations
  const calculatedTax = (netPrice * taxRate) / 100;
  const calculatedGross = netPrice + calculatedTax;
  const bruttoToNettoResult = grossPrice / (1 + taxRate / 100);
  const bruttoTaxContained = grossPrice - bruttoToNettoResult;

  // Trinkgeld calculations
  const tipAmount = (billAmount * tipPercent) / 100;
  const totalWithTip = billAmount + tipAmount;
  const perPerson = peopleCount > 0 ? totalWithTip / peopleCount : totalWithTip;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Alltag & Praxis
            </span>
            <h3 className="text-xl font-bold text-white">Reallife-Szenarien</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Wo begegnet uns Prozentrechnung im echten Leben? Teste praktische Alltagssituationen!
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('rabatt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rabatt' ? 'bg-rose-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Rabatt & Sale
          </button>
          <button
            onClick={() => setActiveTab('mwst')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'mwst' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Mehrwertsteuer
          </button>
          <button
            onClick={() => setActiveTab('trinkgeld')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'trinkgeld' ? 'bg-amber-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Restaurant / Trinkgeld
          </button>
        </div>
      </div>

      {/* Scenario 1: Rabatt & Sale */}
      {activeTab === 'rabatt' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase font-mono block mb-1.5">
                Ursprünglicher Preis (€) (Grundwert G):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-rose-500"
                />
                <span className="absolute right-4 top-3 text-slate-500 font-mono">€</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-mono mb-1.5">
                <span>Rabatt in Prozent (p%):</span>
                <span className="text-rose-400 font-bold text-sm">{discountPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex gap-2 mt-2">
                {[10, 20, 25, 30, 50, 70].map((val) => (
                  <button
                    key={val}
                    onClick={() => setDiscountPercent(val)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono ${
                      discountPercent === val
                        ? 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    -{val}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Du sparst (Rabattbetrag W):</span>
              <span className="text-emerald-400 font-bold font-mono text-xl">
                - {discountAmount.toFixed(2)} €
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-300 font-semibold text-base">Endpreis an der Kasse:</span>
              <span className="text-rose-400 font-extrabold font-mono text-3xl">
                {finalPrice.toFixed(2)} €
              </span>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-mono text-slate-400 uppercase">Rechnungsweg:</div>
              <div>1. Rabatt: <MathRenderer latex={`W = ${originalPrice}€ \\cdot \\frac{${discountPercent}}{100} = ${discountAmount.toFixed(2)}€`} /></div>
              <div>2. Neuer Preis: <MathRenderer latex={`${originalPrice}€ - ${discountAmount.toFixed(2)}€ = ${finalPrice.toFixed(2)}€`} /> (oder direkt <MathRenderer latex={`${originalPrice}€ \\cdot ${(1 - discountPercent / 100).toFixed(2)}`} />)</div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario 2: Mehrwertsteuer (Netto vs. Brutto) */}
      {activeTab === 'mwst' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => setMwstMode('nettoToBrutto')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                mwstMode === 'nettoToBrutto'
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              Netto ➔ Brutto (+19% / +7%)
            </button>
            <button
              onClick={() => setMwstMode('bruttoToNetto')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                mwstMode === 'bruttoToNetto'
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              Brutto ➔ Netto (MwSt. herausrechnen)
            </button>
          </div>

          {mwstMode === 'nettoToBrutto' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-mono block mb-1.5">
                    Nettopreis (€) (100%):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={netPrice}
                    onChange={(e) => setNetPrice(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-mono block mb-1.5">
                    Steuersatz wählen:
                  </label>
                  <div className="flex gap-3">
                    {[19, 7].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setTaxRate(rate)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                          taxRate === rate
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {rate}% {rate === 19 ? '(Standard z.B. Elektronik)' : '(Ermäßigt z.B. Lebensmittel, Bücher)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Nettobetrag (100%):</span>
                  <span className="font-mono text-white">{netPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm text-indigo-400">
                  <span>Mehrwertsteuer ({taxRate}%):</span>
                  <span className="font-mono font-bold">+ {calculatedTax.toFixed(2)} €</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-base font-bold text-white">Bruttopreis ({100 + taxRate}%):</span>
                  <span className="text-2xl font-extrabold font-mono text-indigo-400">
                    {calculatedGross.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-mono block mb-1.5">
                    Bruttopreis (€) (inkl. MwSt):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={grossPrice}
                    onChange={(e) => setGrossPrice(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Häufiger Denkfehler:</strong> Der Bruttopreis entspricht <strong>119%</strong> (nicht 100%). Daher darf man nicht einfach 19% abziehen, sondern muss durch <strong>1,19</strong> teilen!
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Enthaltene MwSt (19% auf Netto):</span>
                  <span className="font-mono text-indigo-400 font-bold">{bruttoTaxContained.toFixed(2)} €</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-base font-bold text-white">Reiner Nettobetrag:</span>
                  <span className="text-2xl font-extrabold font-mono text-emerald-400">
                    {bruttoToNettoResult.toFixed(2)} €
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded">
                  Rechnung: {grossPrice} € ÷ 1,{taxRate} = {bruttoToNettoResult.toFixed(2)} €
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scenario 3: Trinkgeld */}
      {activeTab === 'trinkgeld' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase font-mono block mb-1.5">
                Rechnungsbetrag (€):
              </label>
              <input
                type="number"
                min="1"
                value={billAmount}
                onChange={(e) => setBillAmount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-lg focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase font-mono block mb-1.5">
                Trinkgeld-Prozentsatz:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipPercent(t)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      tipPercent === t
                        ? 'bg-amber-600 border-amber-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase font-mono block mb-1.5">
                Aufteilen auf Personen:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="font-mono text-sm font-bold text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  {peopleCount} {peopleCount === 1 ? 'Person' : 'Personen'}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-sm text-slate-400">
              <span>Trinkgeld ({tipPercent}%):</span>
              <span className="font-mono font-bold text-amber-400">+{tipAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-base font-bold text-white">
              <span>Gesamtbetrag:</span>
              <span className="font-mono text-xl">{totalWithTip.toFixed(2)} €</span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-slate-300 block">Pro Person zahlen:</span>
                <span className="text-xs text-slate-500">Gleichmäßig auf {peopleCount} geteilt</span>
              </div>
              <span className="text-2xl font-extrabold font-mono text-amber-400">
                {perPerson.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

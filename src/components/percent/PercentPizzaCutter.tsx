import React, { useState } from 'react';
import { Sparkles, Check, Edit3 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const PercentPizzaCutter: React.FC = () => {
  const [totalSlices, setTotalSlices] = useState<number>(4); // Cut into 2, 4, 5, 8, 10 pieces
  const [selectedSlices, setSelectedSlices] = useState<number>(1);
  const [pizzaGrundwert, setPizzaGrundwert] = useState<number>(400); // 400 g
  const [unit, setUnit] = useState<string>('Gramm');

  const fractionPercent = (selectedSlices / totalSlices) * 100;
  const decimal = (selectedSlices / totalSlices).toFixed(2);
  const prozentwert = (pizzaGrundwert * selectedSlices) / totalSlices;

  const handleSliceClick = (sliceIdx: number) => {
    sounds.playSlice();
    if (sliceIdx + 1 === selectedSlices) {
      setSelectedSlices(Math.max(1, selectedSlices - 1));
    } else {
      setSelectedSlices(sliceIdx + 1);
    }
  };

  const handlePresetSelect = (n: number) => {
    sounds.playPop();
    setTotalSlices(n);
    setSelectedSlices(1);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              Brüche ➔ Prozent im Kopf
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Pizza- & Schoko-Teiler mit beliebigem Grundwert
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gib der Pizza oder Tafel einen <strong>beliebigen Gesamtwert</strong> (z.B. 400g oder 12€) und schneide sie in Stücke!
          </p>
        </div>

        {/* Slice Preset Options */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-medium">
          {[
            { n: 2, label: 'Halbieren (in 2)' },
            { n: 4, label: 'Vierteln (in 4)' },
            { n: 5, label: 'Fünfteln (in 5)' },
            { n: 8, label: 'Achteln (in 8)' },
            { n: 10, label: 'Zehnteln (in 10)' }
          ].map((item) => (
            <button
              key={item.n}
              onClick={() => handlePresetSelect(item.n)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                totalSlices === item.n
                  ? 'bg-rose-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Grundwert input for Pizza */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <Edit3 className="w-4 h-4 text-rose-400" />
          Grundwert der gesamten Pizza/Tafel (100%):
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[
            { val: 400, u: 'Gramm' },
            { val: 12, u: '€' },
            { val: 800, u: 'kcal' },
            { val: 100, u: 'Stück' }
          ].map((preset) => (
            <button
              key={preset.u}
              onClick={() => {
                sounds.playPop();
                setPizzaGrundwert(preset.val);
                setUnit(preset.u);
              }}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                pizzaGrundwert === preset.val && unit === preset.u
                  ? 'bg-rose-600 border-rose-400 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {preset.val} {preset.u}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 font-mono">Freie Eingabe:</span>
          <input
            type="number"
            min="1"
            max="100000"
            value={pizzaGrundwert}
            onChange={(e) => {
              setPizzaGrundwert(Math.max(1, Number(e.target.value)));
              sounds.playPop();
            }}
            className="w-24 bg-slate-950 border border-slate-600 rounded-lg px-2 py-1 text-white font-mono text-sm font-bold focus:outline-none focus:border-rose-400"
          />
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-20 bg-slate-950 border border-slate-600 rounded-lg px-2 py-1 text-rose-300 font-mono text-xs font-bold focus:outline-none focus:border-rose-400 text-center"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive SVG Pizza / Food */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-3xl border border-slate-800 relative">
          <div className="relative w-64 h-64 select-none">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
              {Array.from({ length: totalSlices }, (_, i) => {
                const sliceAngle = 360 / totalSlices;
                const startAngle = i * sliceAngle - 90;
                const endAngle = (i + 1) * sliceAngle - 90;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = 100 + 85 * Math.cos(startRad);
                const y1 = 100 + 85 * Math.sin(startRad);
                const x2 = 100 + 85 * Math.cos(endRad);
                const y2 = 100 + 85 * Math.sin(endRad);

                const isSelected = i < selectedSlices;
                const largeArc = sliceAngle > 180 ? 1 : 0;

                const pathData = `M 100 100 L ${x1} ${y1} A 85 85 0 ${largeArc} 1 ${x2} ${y2} Z`;

                return (
                  <path
                    key={i}
                    d={pathData}
                    onClick={() => handleSliceClick(i)}
                    className="cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-95"
                    fill={
                      isSelected
                        ? totalSlices === 2
                          ? '#06b6d4'
                          : totalSlices === 4
                          ? '#f43f5e'
                          : '#8b5cf6'
                        : '#1e293b'
                    }
                    stroke="#0f172a"
                    strokeWidth="3"
                  />
                );
              })}

              {/* Pizza Center Label */}
              <circle cx="100" cy="100" r="30" fill="#090d16" stroke="#334155" strokeWidth="2" />
              <text
                x="100"
                y="105"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {selectedSlices}/{totalSlices}
              </text>
            </svg>
          </div>

          <span className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            Klicke auf Stücke, um mehr oder weniger zu schneiden!
          </span>
        </div>

        {/* 4 Cards: Bruch, Dezimal, Prozent, Absoluter Wert */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-sm font-bold text-slate-300">
            Drei Schreibweisen + berechneter Wert deines Grundwerts:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Fraction */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[9px] uppercase font-mono text-slate-500 block">Bruch:</span>
              <div className="text-xl font-extrabold text-white font-mono">
                {selectedSlices}/{totalSlices}
              </div>
            </div>

            {/* Decimal */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-[9px] uppercase font-mono text-slate-500 block">Dezimal:</span>
              <div className="text-xl font-extrabold text-cyan-400 font-mono">
                {decimal}
              </div>
            </div>

            {/* Percentage */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-rose-500/40 bg-rose-950/20 text-center space-y-1">
              <span className="text-[9px] uppercase font-mono text-rose-400 font-bold block">Prozent:</span>
              <div className="text-xl font-extrabold text-rose-400 font-mono">
                {fractionPercent.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%
              </div>
            </div>

            {/* Calculated Real Value */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-center space-y-1">
              <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold block">Wert:</span>
              <div className="text-xl font-extrabold text-emerald-300 font-mono truncate">
                {prozentwert.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
              </div>
              <span className="text-[9px] text-emerald-200/80 block truncate">
                {unit}
              </span>
            </div>
          </div>

          {/* Quick Mental Bridge Tips */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
            <div className="font-bold text-rose-300 flex items-center gap-1.5 text-sm">
              <Check className="w-4 h-4" />
              Kopf-Rechen-Merkregel mit Grundwert {pizzaGrundwert} {unit}:
            </div>
            <ul className="space-y-1 list-disc list-inside text-slate-300">
              <li><strong>½ (Hälfte)</strong> = 50% = <strong>{(pizzaGrundwert * 0.5).toFixed(1)} {unit}</strong></li>
              <li><strong>¼ (Viertel)</strong> = 25% = <strong>{(pizzaGrundwert * 0.25).toFixed(1)} {unit}</strong></li>
              <li><strong>¾ (Dreiviertel)</strong> = 75% = <strong>{(pizzaGrundwert * 0.75).toFixed(1)} {unit}</strong></li>
              <li><strong>⅒ (Zehntel)</strong> = 10% = <strong>{(pizzaGrundwert * 0.1).toFixed(1)} {unit}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

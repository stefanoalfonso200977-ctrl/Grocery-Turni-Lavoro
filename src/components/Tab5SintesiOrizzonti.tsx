import React from 'react';
import { PredictionResult } from '../types';

interface Tab5Props {
  result: PredictionResult;
}

export const Tab5SintesiOrizzonti: React.FC<Tab5Props> = ({ result }) => {
  const { sintesiOrizzonti, rangeW1Str, range2WStr } = result;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Sintesi Multi-Orizzonte: Settimana 1, 2 Settimane, Mese e Trimestre
        </h3>
        <p className="text-xs text-slate-500">
          Proiezioni strategiche di fabbisogno turni e budget costo del lavoro basate sui ritmi bisettimanali effettivi.
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1100px] text-xs">
          <thead>
            <tr className="bg-slate-800 text-white font-semibold">
              <th className="py-3 px-3">Sottoreparto / Voce</th>
              <th className="py-3 px-3">Dotazione Giornaliera</th>
              <th className="py-3 px-3 text-right bg-blue-900/40">Sett. 1 Colli</th>
              <th className="py-3 px-3 text-center bg-blue-900/40">Sett. 1 Turni</th>
              <th className="py-3 px-3 text-right bg-blue-900/40">Sett. 1 Costo</th>
              <th className="py-3 px-3 text-right bg-indigo-900/50 font-bold">2W Colli</th>
              <th className="py-3 px-3 text-right bg-indigo-900/50">2W Turni Teo</th>
              <th className="py-3 px-3 text-center bg-indigo-900/50 font-bold">2W Turni Reali</th>
              <th className="py-3 px-3 text-right bg-indigo-900/50 font-bold">2W Costo Reale</th>
              <th className="py-3 px-3 text-center bg-amber-900/40">Mese (30gg) Turni</th>
              <th className="py-3 px-3 text-right bg-amber-900/40 font-bold">Mese Costo (€)</th>
              <th className="py-3 px-3 text-center bg-purple-900/40">Trim. (13 Sett.) Turni</th>
              <th className="py-3 px-3 text-right bg-purple-900/40 font-bold">Trim. Costo (€)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {sintesiOrizzonti.map((item, idx) => {
              const isJolly = item.isJolly;
              const isTotal = item.isTotal;

              let rowClass = 'hover:bg-slate-50/80';
              if (isJolly) rowClass = 'bg-amber-50/80 font-medium text-amber-950 border-t border-amber-200';
              if (isTotal) rowClass = 'bg-emerald-100 font-bold text-emerald-950 border-t-2 border-emerald-500';

              return (
                <tr key={idx} className={rowClass}>
                  <td className={`py-2.5 px-3 ${isTotal ? 'font-black text-sm' : 'font-semibold'}`}>
                    {item.label}
                  </td>
                  <td className="py-2.5 px-3 font-medium">{item.dotazione}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {typeof item.colliW1 === 'number' ? item.colliW1.toLocaleString('it-IT') : item.colliW1}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">{item.turniW1}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    € {item.costoW1.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-indigo-50/30">
                    {typeof item.colli2W === 'number' ? item.colli2W.toLocaleString('it-IT') : item.colli2W}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono bg-indigo-50/30">
                    {typeof item.teo2W === 'number' ? item.teo2W.toFixed(2) : item.teo2W}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold bg-indigo-50/40 text-slate-900">
                    {item.turni2W}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-indigo-50/40 text-slate-900">
                    € {item.costo2W.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold bg-amber-50/30">
                    {item.turniMese}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-amber-50/30">
                    € {item.costoMese.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold bg-purple-50/30">
                    {item.turniTrim}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-purple-50/30">
                    € {item.costoTrim.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

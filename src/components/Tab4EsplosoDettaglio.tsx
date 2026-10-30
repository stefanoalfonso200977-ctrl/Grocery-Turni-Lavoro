import React, { useState } from 'react';
import { PredictionResult, DEPARTMENTS, Department } from '../types';
import { Filter } from 'lucide-react';

interface Tab4Props {
  result: PredictionResult;
}

export const Tab4EsplosoDettaglio: React.FC<Tab4Props> = ({ result }) => {
  const { dfStaff2w, range2WStr } = result;

  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([1, 2]);
  const [selectedDepts, setSelectedDepts] = useState<Department[]>([...DEPARTMENTS]);

  const toggleWeek = (w: number) => {
    if (selectedWeeks.includes(w)) {
      if (selectedWeeks.length > 1) setSelectedWeeks(selectedWeeks.filter(x => x !== w));
    } else {
      setSelectedWeeks([...selectedWeeks, w]);
    }
  };

  const toggleDept = (d: Department) => {
    if (selectedDepts.includes(d)) {
      if (selectedDepts.length > 1) setSelectedDepts(selectedDepts.filter(x => x !== d));
    } else {
      setSelectedDepts([...selectedDepts, d]);
    }
  };

  const filteredRows = dfStaff2w.filter(
    r =>
      r.giornoNum < 6 && // escludi domeniche
      selectedWeeks.includes(r.settimanaNum) &&
      selectedDepts.includes(r.sottoreparto)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Dettaglio Giornaliero Ore, Produttività e Costi per Singolo Sottoreparto
          </h3>
          <p className="text-xs text-slate-500">
            Visualizzazione analitica disaggregata per reparto e turno giornaliero ({range2WStr}).
          </p>
        </div>
      </div>

      {/* Pannello Filtri */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtri:</span>
        </div>

        {/* Filtro Settimana */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-700">Settimana:</span>
          {[1, 2].map(w => {
            const active = selectedWeeks.includes(w);
            return (
              <button
                key={w}
                onClick={() => toggleWeek(w)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition border ${
                  active
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Settimana {w}
              </button>
            );
          })}
        </div>

        {/* Filtro Sottoreparto */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-700">Sottoreparto:</span>
          {DEPARTMENTS.map(d => {
            const active = selectedDepts.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDept(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition border ${
                  active
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div className="ml-auto text-xs text-slate-400">
          Mostrando <strong className="text-slate-700">{filteredRows.length}</strong> righe
        </div>
      </div>

      {/* Tabella Esploso */}
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1250px] text-xs">
          <thead>
            <tr className="bg-slate-800 text-white font-semibold">
              <th className="py-3 px-3">Settimana</th>
              <th className="py-3 px-3 text-center">Data</th>
              <th className="py-3 px-3">Giorno</th>
              <th className="py-3 px-3">Sottoreparto</th>
              <th className="py-3 px-3 text-right bg-blue-900/60 font-bold">Colli L</th>
              <th className="py-3 px-3 text-center">Resa Target</th>
              <th className="py-3 px-3 text-right">Ore Richieste</th>
              <th className="py-3 px-3 text-right">FTE (3h)</th>
              <th className="py-3 px-3 text-center bg-emerald-900/60 font-bold">Addetti (0.50)</th>
              <th className="py-3 px-3 text-right">Ore Presidiate</th>
              <th className="py-3 px-3 text-right">Bilancio Ore</th>
              <th className="py-3 px-3 text-right">Prod. Oraria</th>
              <th className="py-3 px-3 text-right">Prod. Turno</th>
              <th className="py-3 px-3 text-right">Saturazione</th>
              <th className="py-3 px-3 text-right">Costo Teo</th>
              <th className="py-3 px-3 text-right bg-rose-900/60 font-bold">Costo Presidio</th>
              <th className="py-3 px-3 text-right">€ / Collo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {filteredRows.map((r, idx) => {
              const bilancioPositive = r.bilancioOreMobilita > 0;
              return (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-medium text-slate-800">{r.settimanaLabel}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{r.dataStr}</td>
                  <td className="py-2.5 px-3 font-medium">{r.giornoNome}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{r.sottoreparto}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/40 text-blue-950">
                    {r.colliL.toLocaleString('it-IT')}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">{r.resaTargetOraria} c/h</td>
                  <td className="py-2.5 px-3 text-right font-mono">{r.oreRichieste.toFixed(2)} h</td>
                  <td className="py-2.5 px-3 text-right font-mono">{r.fteTeorici.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center font-bold bg-emerald-50 text-emerald-900">
                    {r.addettiSoglia050}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{r.orePresidiate050.toFixed(1)} h</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        bilancioPositive
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {bilancioPositive ? `+${r.bilancioOreMobilita.toFixed(2)} h` : `${r.bilancioOreMobilita.toFixed(2)} h`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">{r.prodEffettivaOraria.toFixed(2)} c/h</td>
                  <td className="py-2.5 px-3 text-right font-mono">{r.prodEffettivaTurno.toFixed(1)} c/t</td>
                  <td className="py-2.5 px-3 text-right font-mono">{r.saturazionePresidioPct.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right font-mono">€ {r.costoTeoricoEuro.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold bg-rose-50/40 text-slate-900">
                    € {r.costoPresidio050Euro.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                    € {r.costoUnitarioCollo050.toFixed(4)}
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

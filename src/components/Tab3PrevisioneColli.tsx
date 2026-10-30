import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PredictionResult, DEPARTMENTS } from '../types';

interface Tab3Props {
  result: PredictionResult;
}

const DEPT_COLORS: Record<string, string> = {
  ALIMENTARI: '#3B82F6', // blue
  CHIMICA: '#10B981',    // emerald
  LIQUIDI: '#6366F1',    // indigo
  PETFOOD: '#F59E0B',    // amber
  PROFUMERIA: '#EC4899'  // pink
};

export const Tab3PrevisioneColli: React.FC<Tab3Props> = ({ result }) => {
  const { riepilogo14gg, range2WStr } = result;
  const [chartMode, setChartMode] = useState<'stacked' | 'grouped'>('stacked');

  const chartData = riepilogo14gg
    .filter(r => r.giornoNum < 6)
    .map(r => ({
      name: `${r.giornoNome.substring(0, 3)} ${r.dataStr.substring(0, 5)}`,
      settimana: r.settimanaLabel,
      ALIMENTARI: r.colliPerDept.ALIMENTARI,
      CHIMICA: r.colliPerDept.CHIMICA,
      LIQUIDI: r.colliPerDept.LIQUIDI,
      PETFOOD: r.colliPerDept.PETFOOD,
      PROFUMERIA: r.colliPerDept.PROFUMERIA,
      totale: r.totaleColliGiorno
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Previsione Colli Effettivi da Allestire (Target Colonna L)
          </h3>
          <p className="text-xs text-slate-500">
            Dettaglio volumi giornalieri calcolati dal modello ML a 2 stadi per ciascuno dei 5 sottoreparti ({range2WStr}).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setChartMode('stacked')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              chartMode === 'stacked'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grafico Impilato
          </button>
          <button
            onClick={() => setChartMode('grouped')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              chartMode === 'grouped'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grafico Raggruppato
          </button>
        </div>
      </div>

      {/* Grafico Recharts */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Distribuzione Volumi Colli Giornalieri per Sottoreparto
        </h4>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any, name: any) => [`${Number(value).toLocaleString('it-IT')} colli`, name]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {DEPARTMENTS.map(dept => (
                <Bar
                  key={dept}
                  dataKey={dept}
                  stackId={chartMode === 'stacked' ? 'a' : undefined}
                  fill={DEPT_COLORS[dept]}
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabella Volumi */}
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-white font-semibold">
              <th className="py-3 px-3">Settimana</th>
              <th className="py-3 px-3 text-center">Data</th>
              <th className="py-3 px-3">Giorno</th>
              {DEPARTMENTS.map(dept => (
                <th key={dept} className="py-3 px-3 text-right">
                  {dept}
                </th>
              ))}
              <th className="py-3 px-3 text-right bg-blue-900/70 font-bold">TOTALE COLLI GIORNO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {riepilogo14gg.map((r, idx) => (
              <tr
                key={idx}
                className={r.giornoNum === 6 ? 'bg-slate-50 text-slate-400 italic' : 'hover:bg-slate-50/80'}
              >
                <td className="py-2.5 px-3 font-medium">{r.settimanaLabel}</td>
                <td className="py-2.5 px-3 text-center font-mono">{r.dataStr}</td>
                <td className="py-2.5 px-3 font-medium">{r.giornoNome}</td>
                {DEPARTMENTS.map(dept => (
                  <td key={dept} className="py-2.5 px-3 text-right font-mono">
                    {r.giornoNum === 6 ? '-' : r.colliPerDept[dept].toLocaleString('it-IT')}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-right font-mono font-bold bg-blue-50/50 text-blue-950">
                  {r.giornoNum === 6 ? '-' : r.totaleColliGiorno.toLocaleString('it-IT')}
                </td>
              </tr>
            ))}

            {/* Totale 2 Settimane */}
            <tr className="bg-emerald-100 font-bold border-t-2 border-emerald-500 text-emerald-950">
              <td className="py-3 px-3 font-black">TOTALE 2 SETTIMANE</td>
              <td className="py-3 px-3 text-center font-mono">{range2WStr}</td>
              <td className="py-3 px-3">12 gg lav.</td>
              {DEPARTMENTS.map(dept => {
                const sumDept = result.prod2w.find(p => p.sottoreparto === dept)?.colliBisettimanali || 0;
                return (
                  <td key={dept} className="py-3 px-3 text-right font-mono font-black">
                    {sumDept.toLocaleString('it-IT')}
                  </td>
                );
              })}
              <td className="py-3 px-3 text-right font-mono font-black bg-blue-200 text-blue-950">
                {result.kpi.totColli2w.toLocaleString('it-IT')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

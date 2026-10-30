import React from 'react';
import { PredictionResult, DEPARTMENTS } from '../types';

interface Tab1Props {
  result: PredictionResult;
}

export const Tab1TurniCosti: React.FC<Tab1Props> = ({ result }) => {
  const { riepilogo14gg, range2WStr, rangeW1Str, rangeW2Str } = result;

  const w1Rows = riepilogo14gg.filter(r => r.settimanaNum === 1);
  const w2Rows = riepilogo14gg.filter(r => r.settimanaNum === 2);

  const renderSubtotalRow = (wRows: typeof riepilogo14gg, wLabel: string, rangeStr: string) => {
    const s050 = wRows.reduce((a, b) => a + b.sommaAddettiReparto050, 0);
    const oreScoperte = wRows.reduce((a, b) => a + b.oreNetteScoperte, 0);
    const jolly = wRows.reduce((a, b) => a + b.addettiJollyMobilita, 0);
    const teo = wRows.reduce((a, b) => a + b.turniTeoriciTotaliFte, 0);
    const opt = wRows.reduce((a, b) => a + b.squadraOttimaleReale, 0);
    const oreReali = wRows.reduce((a, b) => a + b.oreRealiSquadra, 0);
    const costoTeo = wRows.reduce((a, b) => a + b.costoLavoroTeoricoEuro, 0);
    const costoReale = wRows.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0);
    const totColli = wRows.reduce((a, b) => a + b.totaleColliGiorno, 0);
    const prodMedia = oreReali > 0 ? totColli / oreReali : 0;

    return (
      <tr className="bg-slate-100/90 font-semibold border-y-2 border-slate-300 text-slate-800 text-xs">
        <td className="py-2.5 px-3 text-slate-900 font-bold">{wLabel.toUpperCase()}</td>
        <td className="py-2.5 px-3 text-center">{rangeStr}</td>
        <td className="py-2.5 px-3">6 gg lav.</td>
        {DEPARTMENTS.map(d => {
          const sumArr = wRows.reduce((a, b) => a + (b.arr050PerDept[d] || 0), 0);
          const sumFte = wRows.reduce((a, b) => a + (b.ftePerDept[d] || 0), 0);
          return (
            <td key={d} className="py-2.5 px-3 text-center">
              {sumArr} <span className="text-[10px] text-slate-500 font-normal">({sumFte.toFixed(2)})</span>
            </td>
          );
        })}
        <td className="py-2.5 px-3 text-center bg-blue-50/70 text-blue-900">{s050}</td>
        <td className="py-2.5 px-3 text-right">{oreScoperte.toFixed(2)} h</td>
        <td className="py-2.5 px-3 text-center bg-amber-50 text-amber-900 font-bold">{jolly}</td>
        <td className="py-2.5 px-3 text-right">{teo.toFixed(2)}</td>
        <td className="py-2.5 px-3 text-center bg-emerald-100 text-emerald-900 font-bold">{opt}</td>
        <td className="py-2.5 px-3 text-right">{oreReali.toFixed(0)} h</td>
        <td className="py-2.5 px-3 text-right">{prodMedia.toFixed(2)} c/h</td>
        <td className="py-2.5 px-3 text-right">€ {costoTeo.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td className="py-2.5 px-3 text-right bg-rose-50/70 text-rose-900 font-bold">€ {costoReale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    );
  };

  const renderGrandTotalRow = () => {
    const s050 = riepilogo14gg.reduce((a, b) => a + b.sommaAddettiReparto050, 0);
    const oreScoperte = riepilogo14gg.reduce((a, b) => a + b.oreNetteScoperte, 0);
    const jolly = riepilogo14gg.reduce((a, b) => a + b.addettiJollyMobilita, 0);
    const teo = riepilogo14gg.reduce((a, b) => a + b.turniTeoriciTotaliFte, 0);
    const opt = riepilogo14gg.reduce((a, b) => a + b.squadraOttimaleReale, 0);
    const oreReali = riepilogo14gg.reduce((a, b) => a + b.oreRealiSquadra, 0);
    const costoTeo = riepilogo14gg.reduce((a, b) => a + b.costoLavoroTeoricoEuro, 0);
    const costoReale = riepilogo14gg.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0);
    const totColli = riepilogo14gg.reduce((a, b) => a + b.totaleColliGiorno, 0);
    const prodMedia = oreReali > 0 ? totColli / oreReali : 0;

    return (
      <tr className="bg-emerald-50/90 font-bold border-t-2 border-emerald-500 text-slate-900 text-xs">
        <td className="py-3 px-3 text-emerald-950">TOTALE 2 SETTIMANE</td>
        <td className="py-3 px-3 text-center text-emerald-900">{range2WStr}</td>
        <td className="py-3 px-3 text-emerald-900">12 gg lav.</td>
        {DEPARTMENTS.map(d => {
          const sumArr = riepilogo14gg.reduce((a, b) => a + (b.arr050PerDept[d] || 0), 0);
          const sumFte = riepilogo14gg.reduce((a, b) => a + (b.ftePerDept[d] || 0), 0);
          return (
            <td key={d} className="py-3 px-3 text-center">
              {sumArr} <span className="text-[10px] text-slate-500 font-normal">({sumFte.toFixed(2)})</span>
            </td>
          );
        })}
        <td className="py-3 px-3 text-center bg-blue-100 text-blue-950 font-black">{s050}</td>
        <td className="py-3 px-3 text-right">{oreScoperte.toFixed(2)} h</td>
        <td className="py-3 px-3 text-center bg-amber-100 text-amber-950 font-black">{jolly}</td>
        <td className="py-3 px-3 text-right">{teo.toFixed(2)}</td>
        <td className="py-3 px-3 text-center bg-emerald-200 text-emerald-950 font-black">{opt}</td>
        <td className="py-3 px-3 text-right">{oreReali.toFixed(0)} h</td>
        <td className="py-3 px-3 text-right">{prodMedia.toFixed(2)} c/h</td>
        <td className="py-3 px-3 text-right">€ {costoTeo.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td className="py-3 px-3 text-right bg-rose-100 text-rose-950 font-black">€ {costoReale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Tabellone Rilascio Turni Bisettimanale ({range2WStr})
          </h3>
          <p className="text-xs text-slate-500">
            Presidi per sottoreparto con regola di arrotondamento soglia 0,50, copertura jolly mobilità interna e costo squadra reale.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-200 border border-amber-300 inline-block"></span>
            Jolly Mobilità
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300 inline-block"></span>
            Squadra Ottimale Reale
          </span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-800 text-white text-xs font-semibold">
              <th className="py-3 px-3">Settimana</th>
              <th className="py-3 px-3 text-center">Data</th>
              <th className="py-3 px-3">Giorno</th>
              <th className="py-3 px-3 text-center">ALIMENTARI</th>
              <th className="py-3 px-3 text-center">CHIMICA</th>
              <th className="py-3 px-3 text-center">LIQUIDI</th>
              <th className="py-3 px-3 text-center">PETFOOD</th>
              <th className="py-3 px-3 text-center">PROFUMERIA</th>
              <th className="py-3 px-3 text-center bg-blue-900/60">Somma 0.50</th>
              <th className="py-3 px-3 text-right">Ore Scoperte</th>
              <th className="py-3 px-3 text-center bg-amber-700/60">Jolly Mob.</th>
              <th className="py-3 px-3 text-right">FTE Teo</th>
              <th className="py-3 px-3 text-center bg-emerald-800/80">Squadra Reale</th>
              <th className="py-3 px-3 text-right">Ore Reali</th>
              <th className="py-3 px-3 text-right">Prod. Squadra</th>
              <th className="py-3 px-3 text-right">Costo Teo</th>
              <th className="py-3 px-3 text-right bg-rose-900/60">Costo Reale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
            {/* Settimana 1 */}
            {w1Rows.map((r, idx) => (
              <tr
                key={idx}
                className={r.giornoNum === 6 ? 'bg-slate-50 text-slate-400 italic' : 'hover:bg-slate-50/80'}
              >
                <td className="py-2.5 px-3 font-medium text-slate-800">{r.settimanaLabel}</td>
                <td className="py-2.5 px-3 text-center font-mono">{r.dataStr}</td>
                <td className="py-2.5 px-3 font-medium">{r.giornoNome}</td>
                {DEPARTMENTS.map(d => (
                  <td key={d} className="py-2.5 px-3 text-center">
                    {r.giornoNum === 6 ? (
                      '-'
                    ) : (
                      <>
                        <span className="font-semibold text-slate-800">{r.arr050PerDept[d]}</span>{' '}
                        <span className="text-[10px] text-slate-400">({r.ftePerDept[d]?.toFixed(2)})</span>
                      </>
                    )}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-center font-bold bg-blue-50/50 text-blue-950">
                  {r.giornoNum === 6 ? 0 : r.sommaAddettiReparto050}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {r.giornoNum === 6 ? '-' : `${r.oreNetteScoperte.toFixed(2)} h`}
                </td>
                <td className="py-2.5 px-3 text-center font-bold bg-amber-50 text-amber-900">
                  {r.giornoNum === 6 ? 0 : r.addettiJollyMobilita}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {r.giornoNum === 6 ? '-' : r.turniTeoriciTotaliFte.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-center font-bold bg-emerald-50 text-emerald-900">
                  {r.squadraOttimaleReale}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {r.oreRealiSquadra.toFixed(0)} h
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {r.giornoNum === 6 ? '-' : `${r.produttivitaMediaSquadra.toFixed(2)} c/h`}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  € {r.costoLavoroTeoricoEuro.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold font-mono bg-rose-50/40 text-slate-900">
                  € {r.costoLavoroSquadraRealeEuro.toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Subtotale W1 */}
            {renderSubtotalRow(w1Rows, 'Subtotale Settimana 1', rangeW1Str)}

            {/* Settimana 2 */}
            {w2Rows.map((r, idx) => (
              <tr
                key={idx}
                className={r.giornoNum === 6 ? 'bg-slate-50 text-slate-400 italic' : 'hover:bg-slate-50/80'}
              >
                <td className="py-2.5 px-3 font-medium text-slate-800">{r.settimanaLabel}</td>
                <td className="py-2.5 px-3 text-center font-mono">{r.dataStr}</td>
                <td className="py-2.5 px-3 font-medium">{r.giornoNome}</td>
                {DEPARTMENTS.map(d => (
                  <td key={d} className="py-2.5 px-3 text-center">
                    {r.giornoNum === 6 ? (
                      '-'
                    ) : (
                      <>
                        <span className="font-semibold text-slate-800">{r.arr050PerDept[d]}</span>{' '}
                        <span className="text-[10px] text-slate-400">({r.ftePerDept[d]?.toFixed(2)})</span>
                      </>
                    )}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-center font-bold bg-blue-50/50 text-blue-950">
                  {r.giornoNum === 6 ? 0 : r.sommaAddettiReparto050}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {r.giornoNum === 6 ? '-' : `${r.oreNetteScoperte.toFixed(2)} h`}
                </td>
                <td className="py-2.5 px-3 text-center font-bold bg-amber-50 text-amber-900">
                  {r.giornoNum === 6 ? 0 : r.addettiJollyMobilita}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {r.giornoNum === 6 ? '-' : r.turniTeoriciTotaliFte.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-center font-bold bg-emerald-50 text-emerald-900">
                  {r.squadraOttimaleReale}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {r.oreRealiSquadra.toFixed(0)} h
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {r.giornoNum === 6 ? '-' : `${r.produttivitaMediaSquadra.toFixed(2)} c/h`}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  € {r.costoLavoroTeoricoEuro.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold font-mono bg-rose-50/40 text-slate-900">
                  € {r.costoLavoroSquadraRealeEuro.toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Subtotale W2 */}
            {renderSubtotalRow(w2Rows, 'Subtotale Settimana 2', rangeW2Str)}

            {/* Totale 2 Settimane */}
            {renderGrandTotalRow()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { PredictionResult } from '../types';

interface Tab2Props {
  result: PredictionResult;
}

export const Tab2Produttivita: React.FC<Tab2Props> = ({ result }) => {
  const { prod2w, riepilogo14gg, range2WStr, rangeW1Str, rangeW2Str } = result;

  const w1Summary = riepilogo14gg.filter(r => r.settimanaNum === 1);
  const w2Summary = riepilogo14gg.filter(r => r.settimanaNum === 2);

  // Jolly stats
  const oreScoperte2W = riepilogo14gg.reduce((a, b) => a + b.oreNetteScoperte, 0);
  const turniJW1 = w1Summary.reduce((a, b) => a + b.addettiJollyMobilita, 0);
  const costoJW1 = w1Summary.reduce((a, b) => a + b.costoLavoroJollyEuro, 0);
  const turniJW2 = w2Summary.reduce((a, b) => a + b.addettiJollyMobilita, 0);
  const costoJW2 = w2Summary.reduce((a, b) => a + b.costoLavoroJollyEuro, 0);
  const turniJ2W = turniJW1 + turniJW2;
  const costoJ2W = costoJW1 + costoJW2;
  const oreJ2W = turniJ2W * 3; // 3h shift
  const satJ2W = oreJ2W > 0 ? (oreScoperte2W / oreJ2W) * 100 : 0;

  // Totals
  const totColliW1 = w1Summary.reduce((a, b) => a + b.totaleColliGiorno, 0);
  const totTurniW1 = w1Summary.reduce((a, b) => a + b.squadraOttimaleReale, 0);
  const totCostoW1 = w1Summary.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0);

  const totColliW2 = w2Summary.reduce((a, b) => a + b.totaleColliGiorno, 0);
  const totTurniW2 = w2Summary.reduce((a, b) => a + b.squadraOttimaleReale, 0);
  const totCostoW2 = w2Summary.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0);

  const totColli2W = prod2w.reduce((a, b) => a + b.colliBisettimanali, 0);
  const totOreRic2W = prod2w.reduce((a, b) => a + b.oreRichieste2W, 0);
  const totFte2W = prod2w.reduce((a, b) => a + b.turniTeorici2W, 0);
  const totTurniReali2W = riepilogo14gg.reduce((a, b) => a + b.squadraOttimaleReale, 0);
  const totOreReali2W = riepilogo14gg.reduce((a, b) => a + b.oreRealiSquadra, 0);
  const prodMediaOraria2W = totOreReali2W > 0 ? totColli2W / totOreReali2W : 0;
  const prodMediaTurno2W = totTurniReali2W > 0 ? totColli2W / totTurniReali2W : 0;
  const satTot2W = totOreReali2W > 0 ? (totOreRic2W / totOreReali2W) * 100 : 0;
  const totCostoTeo2W = prod2w.reduce((a, b) => a + b.costoTeorico2WEuro, 0);
  const totCostoReale2W = riepilogo14gg.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0);
  const costoColloReale2W = totColli2W > 0 ? totCostoReale2W / totColli2W : 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Analisi Produttività e Costo del Lavoro per Sottoreparto ({rangeW1Str} + {rangeW2Str})
        </h3>
        <p className="text-xs text-slate-500">
          Sintesi comparativa Settimana 1, Settimana 2 e Totale 2 Settimane con indicatori di saturazione del presidio e costo per collo.
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1200px] text-xs">
          <thead>
            <tr className="bg-slate-800 text-white font-semibold">
              <th className="py-3 px-3">Sottoreparto / Voce</th>
              <th className="py-3 px-3 text-center">Resa Target</th>
              <th className="py-3 px-3 text-right">Media Colli/Gg</th>
              <th className="py-3 px-3 text-right bg-blue-900/50">Sett 1 Colli</th>
              <th className="py-3 px-3 text-center bg-blue-900/50">Sett 1 Turni</th>
              <th className="py-3 px-3 text-right bg-blue-900/50">Sett 1 Costo</th>
              <th className="py-3 px-3 text-right bg-indigo-900/50">Sett 2 Colli</th>
              <th className="py-3 px-3 text-center bg-indigo-900/50">Sett 2 Turni</th>
              <th className="py-3 px-3 text-right bg-indigo-900/50">Sett 2 Costo</th>
              <th className="py-3 px-3 text-right font-bold bg-slate-900">2W Colli</th>
              <th className="py-3 px-3 text-right">2W Ore Ric.</th>
              <th className="py-3 px-3 text-right">2W Turni Teo</th>
              <th className="py-3 px-3 text-center bg-emerald-900/70">2W Turni Reali</th>
              <th className="py-3 px-3 text-right">2W Ore Pres.</th>
              <th className="py-3 px-3 text-right">Prod. Oraria</th>
              <th className="py-3 px-3 text-right">Prod. Turno</th>
              <th className="py-3 px-3 text-right">Saturazione</th>
              <th className="py-3 px-3 text-right">Costo Teo</th>
              <th className="py-3 px-3 text-right bg-rose-900/70">Costo Reale</th>
              <th className="py-3 px-3 text-right bg-slate-900">€ / Collo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {prod2w.map(p => (
              <tr key={p.sottoreparto} className="hover:bg-slate-50/80">
                <td className="py-2.5 px-3 font-semibold text-slate-900">{p.sottoreparto}</td>
                <td className="py-2.5 px-3 text-center font-mono">{p.resaTargetOraria} c/h</td>
                <td className="py-2.5 px-3 text-right font-mono">{p.mediaColliGiornoLav.toFixed(1)}</td>
                <td className="py-2.5 px-3 text-right font-mono bg-blue-50/30">{p.colliSett1.toLocaleString('it-IT')}</td>
                <td className="py-2.5 px-3 text-center font-bold bg-blue-50/30">{p.turni050Sett1}</td>
                <td className="py-2.5 px-3 text-right font-mono bg-blue-50/30">€ {p.costo050Sett1Euro.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-mono bg-indigo-50/30">{p.colliSett2.toLocaleString('it-IT')}</td>
                <td className="py-2.5 px-3 text-center font-bold bg-indigo-50/30">{p.turni050Sett2}</td>
                <td className="py-2.5 px-3 text-right font-mono bg-indigo-50/30">€ {p.costo050Sett2Euro.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold bg-slate-50 text-slate-900">{p.colliBisettimanali.toLocaleString('it-IT')}</td>
                <td className="py-2.5 px-3 text-right font-mono">{p.oreRichieste2W.toFixed(1)} h</td>
                <td className="py-2.5 px-3 text-right font-mono">{p.turniTeorici2W.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-center font-bold bg-emerald-50 text-emerald-900">{p.turniPresidio050_2W}</td>
                <td className="py-2.5 px-3 text-right font-mono">{p.orePresidio050_2W.toFixed(0)} h</td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold">{p.prodEffettivaOraria050.toFixed(2)} c/h</td>
                <td className="py-2.5 px-3 text-right font-mono">{p.prodEffettivaTurno050.toFixed(1)} c/t</td>
                <td className="py-2.5 px-3 text-right font-mono font-medium">
                  <span className={p.saturazioneMediaPresidioPct > 100 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                    {p.saturazioneMediaPresidioPct.toFixed(1)}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono">€ {p.costoTeorico2WEuro.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold bg-rose-50/40 text-slate-900">
                  € {p.costoPresidio050_2WEuro.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  € {p.costoPerColloPresidio050Euro.toFixed(4)}
                </td>
              </tr>
            ))}

            {/* Jolly Mobilità */}
            <tr className="bg-amber-50/80 font-semibold border-t border-amber-200 text-amber-950">
              <td className="py-2.5 px-3 font-bold">JOLLY MOBILITÀ INTERNA (Copertura Resti)</td>
              <td className="py-2.5 px-3 text-center">-</td>
              <td className="py-2.5 px-3 text-right">-</td>
              <td className="py-2.5 px-3 text-right font-mono">-</td>
              <td className="py-2.5 px-3 text-center font-bold">{turniJW1}</td>
              <td className="py-2.5 px-3 text-right font-mono">€ {costoJW1.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-right font-mono">-</td>
              <td className="py-2.5 px-3 text-center font-bold">{turniJW2}</td>
              <td className="py-2.5 px-3 text-right font-mono">€ {costoJW2.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-right font-mono">-</td>
              <td className="py-2.5 px-3 text-right font-mono">{oreScoperte2W.toFixed(1)} h</td>
              <td className="py-2.5 px-3 text-right font-mono">{(oreScoperte2W / 3).toFixed(2)}</td>
              <td className="py-2.5 px-3 text-center font-bold bg-amber-100 text-amber-950">{turniJ2W}</td>
              <td className="py-2.5 px-3 text-right font-mono">{oreJ2W.toFixed(0)} h</td>
              <td className="py-2.5 px-3 text-right font-mono">-</td>
              <td className="py-2.5 px-3 text-right font-mono">-</td>
              <td className="py-2.5 px-3 text-right font-mono">{satJ2W.toFixed(1)}%</td>
              <td className="py-2.5 px-3 text-right font-mono">-</td>
              <td className="py-2.5 px-3 text-right font-mono font-bold">€ {costoJ2W.toFixed(2)}</td>
              <td className="py-2.5 px-3 text-right font-mono">-</td>
            </tr>

            {/* Totale Squadra Grocery */}
            <tr className="bg-emerald-100/90 font-bold border-t-2 border-emerald-500 text-emerald-950">
              <td className="py-3 px-3 font-black">TOTALE SQUADRA GROCERY (2W)</td>
              <td className="py-3 px-3 text-center font-mono">{(totColli2W / totOreRic2W).toFixed(1)} c/h</td>
              <td className="py-3 px-3 text-right font-mono">{(totColli2W / 12).toFixed(1)}</td>
              <td className="py-3 px-3 text-right font-mono">{totColliW1.toLocaleString('it-IT')}</td>
              <td className="py-3 px-3 text-center">{totTurniW1}</td>
              <td className="py-3 px-3 text-right font-mono">€ {totCostoW1.toFixed(2)}</td>
              <td className="py-3 px-3 text-right font-mono">{totColliW2.toLocaleString('it-IT')}</td>
              <td className="py-3 px-3 text-center">{totTurniW2}</td>
              <td className="py-3 px-3 text-right font-mono">€ {totCostoW2.toFixed(2)}</td>
              <td className="py-3 px-3 text-right font-mono font-black">{totColli2W.toLocaleString('it-IT')}</td>
              <td className="py-3 px-3 text-right font-mono">{totOreRic2W.toFixed(1)} h</td>
              <td className="py-3 px-3 text-right font-mono">{totFte2W.toFixed(2)}</td>
              <td className="py-3 px-3 text-center font-black bg-emerald-200">{totTurniReali2W}</td>
              <td className="py-3 px-3 text-right font-mono">{totOreReali2W.toFixed(0)} h</td>
              <td className="py-3 px-3 text-right font-mono font-black">{prodMediaOraria2W.toFixed(2)} c/h</td>
              <td className="py-3 px-3 text-right font-mono">{prodMediaTurno2W.toFixed(1)} c/t</td>
              <td className="py-3 px-3 text-right font-mono">{satTot2W.toFixed(1)}%</td>
              <td className="py-3 px-3 text-right font-mono">€ {totCostoTeo2W.toFixed(2)}</td>
              <td className="py-3 px-3 text-right font-mono font-black bg-rose-100">€ {totCostoReale2W.toFixed(2)}</td>
              <td className="py-3 px-3 text-right font-mono font-black">€ {costoColloReale2W.toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

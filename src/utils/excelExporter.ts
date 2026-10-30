import * as XLSX from 'xlsx';
import { PredictionResult, DEPARTMENTS } from '../types';

/**
 * Esporta il report Excel completo a 5 fogli esattamente corrispondente
 * alla struttura del modello Python v3:
 * 1_Turni_2_Settimane_e_Costi
 * 2_Sintesi_1W_2W_Mese_Trim
 * 3_Previsione_Colli_14gg_Col_L
 * 4_Dettaglio_14gg_Ore_Costi
 * 5_Produttivita_e_Costi_2_Sett
 */
export function exportFullExcelReport(result: PredictionResult, fileName?: string) {
  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // FOGLIO 1: 1_Turni_2_Settimane_e_Costi
  // -------------------------------------------------------------
  const f1Data: (string | number)[][] = [
    [`PIANIFICAZIONE RILASCIO TURNI BISETTIMANALE (${result.range2WStr}): ADDETTI, MOBILITÀ E COSTO LAVORO`],
    [`Settimana 1: ${result.rangeW1Str} | Settimana 2: ${result.rangeW2Str}`],
    [],
    [
      'Settimana', 'Data', 'Giorno',
      'ALIMENTARI (0.50 | FTE)', 'CHIMICA (0.50 | FTE)', 'LIQUIDI (0.50 | FTE)',
      'PETFOOD (0.50 | FTE)', 'PROFUMERIA (0.50 | FTE)',
      'Somma Addetti (0.50)', 'Ore Nette Scoperte', 'Addetti Jolly Mobilità',
      'Turni Teorici FTE', 'SQUADRA OTTIMALE REALE', 'Ore Reali Squadra',
      'Costo Lavoro Teorico (€)', 'Costo Lavoro Reale Squadra (€)'
    ]
  ];

  [1, 2].forEach(wIdx => {
    const wRows = result.riepilogo14gg.filter(r => r.settimanaNum === wIdx);
    wRows.forEach(r => {
      f1Data.push([
        r.settimanaLabel,
        r.dataStr,
        r.giornoNome,
        `${r.arr050PerDept.ALIMENTARI} (${r.ftePerDept.ALIMENTARI.toFixed(2)})`,
        `${r.arr050PerDept.CHIMICA} (${r.ftePerDept.CHIMICA.toFixed(2)})`,
        `${r.arr050PerDept.LIQUIDI} (${r.ftePerDept.LIQUIDI.toFixed(2)})`,
        `${r.arr050PerDept.PETFOOD} (${r.ftePerDept.PETFOOD.toFixed(2)})`,
        `${r.arr050PerDept.PROFUMERIA} (${r.ftePerDept.PROFUMERIA.toFixed(2)})`,
        r.sommaAddettiReparto050,
        r.oreNetteScoperte,
        r.addettiJollyMobilita,
        r.turniTeoriciTotaliFte,
        r.squadraOttimaleReale,
        r.oreRealiSquadra,
        r.costoLavoroTeoricoEuro,
        r.costoLavoroSquadraRealeEuro
      ]);
    });

    // Subtotale
    const s050 = wRows.reduce((a, b) => a + b.sommaAddettiReparto050, 0);
    const oreScoperte = Math.round(wRows.reduce((a, b) => a + b.oreNetteScoperte, 0) * 100) / 100;
    const jolly = wRows.reduce((a, b) => a + b.addettiJollyMobilita, 0);
    const teo = Math.round(wRows.reduce((a, b) => a + b.turniTeoriciTotaliFte, 0) * 100) / 100;
    const opt = wRows.reduce((a, b) => a + b.squadraOttimaleReale, 0);
    const oreReali = Math.round(wRows.reduce((a, b) => a + b.oreRealiSquadra, 0) * 100) / 100;
    const costoTeo = Math.round(wRows.reduce((a, b) => a + b.costoLavoroTeoricoEuro, 0) * 100) / 100;
    const costoReale = Math.round(wRows.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0) * 100) / 100;

    f1Data.push([
      `SUBTOTALE SETTIMANA ${wIdx}`,
      wIdx === 1 ? result.rangeW1Str : result.rangeW2Str,
      '6 gg lav.',
      `${wRows.reduce((a, b) => a + b.arr050PerDept.ALIMENTARI, 0)} (${wRows.reduce((a, b) => a + b.ftePerDept.ALIMENTARI, 0).toFixed(2)})`,
      `${wRows.reduce((a, b) => a + b.arr050PerDept.CHIMICA, 0)} (${wRows.reduce((a, b) => a + b.ftePerDept.CHIMICA, 0).toFixed(2)})`,
      `${wRows.reduce((a, b) => a + b.arr050PerDept.LIQUIDI, 0)} (${wRows.reduce((a, b) => a + b.ftePerDept.LIQUIDI, 0).toFixed(2)})`,
      `${wRows.reduce((a, b) => a + b.arr050PerDept.PETFOOD, 0)} (${wRows.reduce((a, b) => a + b.ftePerDept.PETFOOD, 0).toFixed(2)})`,
      `${wRows.reduce((a, b) => a + b.arr050PerDept.PROFUMERIA, 0)} (${wRows.reduce((a, b) => a + b.ftePerDept.PROFUMERIA, 0).toFixed(2)})`,
      s050, oreScoperte, jolly, teo, opt, oreReali, costoTeo, costoReale
    ]);
  });

  // Totale 2 settimane
  const totS050 = result.riepilogo14gg.reduce((a, b) => a + b.sommaAddettiReparto050, 0);
  const totOreScoperte = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.oreNetteScoperte, 0) * 100) / 100;
  const totJolly = result.riepilogo14gg.reduce((a, b) => a + b.addettiJollyMobilita, 0);
  const totTeo = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.turniTeoriciTotaliFte, 0) * 100) / 100;
  const totOpt = result.riepilogo14gg.reduce((a, b) => a + b.squadraOttimaleReale, 0);
  const totOreReali = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.oreRealiSquadra, 0) * 100) / 100;
  const totCostoTeo = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.costoLavoroTeoricoEuro, 0) * 100) / 100;
  const totCostoReale = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0) * 100) / 100;

  f1Data.push([
    'TOTALE 2 SETTIMANE (RILASCIO TURNI)',
    result.range2WStr,
    '12 gg lav.',
    `${result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.ALIMENTARI, 0)} (${result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.ALIMENTARI, 0).toFixed(2)})`,
    `${result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.CHIMICA, 0)} (${result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.CHIMICA, 0).toFixed(2)})`,
    `${result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.LIQUIDI, 0)} (${result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.LIQUIDI, 0).toFixed(2)})`,
    `${result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.PETFOOD, 0)} (${result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.PETFOOD, 0).toFixed(2)})`,
    `${result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.PROFUMERIA, 0)} (${result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.PROFUMERIA, 0).toFixed(2)})`,
    totS050, totOreScoperte, totJolly, totTeo, totOpt, totOreReali, totCostoTeo, totCostoReale
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(f1Data);
  XLSX.utils.book_append_sheet(wb, ws1, '1_Turni_2_Settimane_e_Costi');

  // -------------------------------------------------------------
  // FOGLIO 2: 2_Sintesi_1W_2W_Mese_Trim
  // -------------------------------------------------------------
  const f2Data: (string | number)[][] = [
    [`SINTESI MULTI-ORIZZONTE: SETTIMANA 1 (${result.rangeW1Str}), 2 SETTIMANE (${result.range2WStr}), MESE E TRIMESTRE`],
    [],
    [
      'Sottoreparto / Voce', 'Dotazione Giornaliera',
      `Sett. 1 Colli`, 'Sett. 1 Turni Reali', 'Sett. 1 Costo Reale (€)',
      `2 Sett. Colli`, '2 Sett. Turni Teorici', '2 Sett. Turni Reali', '2 Sett. Costo Reale (€)',
      'Mese (30gg) Turni Reali', 'Mese (30gg) Costo Reale (€)',
      'Trimestre (13 Sett.) Turni Reali', 'Trimestre Costo Reale (€)'
    ]
  ];

  result.sintesiOrizzonti.forEach(item => {
    f2Data.push([
      item.label,
      item.dotazione,
      item.colliW1,
      item.turniW1,
      item.costoW1,
      item.colli2W,
      item.teo2W,
      item.turni2W,
      item.costo2W,
      item.turniMese,
      item.costoMese,
      item.turniTrim,
      item.costoTrim
    ]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(f2Data);
  XLSX.utils.book_append_sheet(wb, ws2, '2_Sintesi_1W_2W_Mese_Trim');

  // -------------------------------------------------------------
  // FOGLIO 3: 3_Previsione_Colli_14gg_Col_L
  // -------------------------------------------------------------
  const f3Data: (string | number)[][] = [
    [`PREVISIONE BISETTIMANALE (${result.range2WStr}) COLLI EFFETTIVI DA ALLESTIRE (DA COLONNA L)`],
    [],
    ['Settimana', 'Data', 'Giorno', 'ALIMENTARI', 'CHIMICA', 'LIQUIDI', 'PETFOOD', 'PROFUMERIA', 'TOTALE COLLI GIORNO']
  ];

  [1, 2].forEach(wIdx => {
    const wRows = result.riepilogo14gg.filter(r => r.settimanaNum === wIdx);
    wRows.forEach(r => {
      f3Data.push([
        r.settimanaLabel,
        r.dataStr,
        r.giornoNome,
        r.colliPerDept.ALIMENTARI,
        r.colliPerDept.CHIMICA,
        r.colliPerDept.LIQUIDI,
        r.colliPerDept.PETFOOD,
        r.colliPerDept.PROFUMERIA,
        r.totaleColliGiorno
      ]);
    });

    // Subtotale
    f3Data.push([
      `SUBTOTALE SETTIMANA ${wIdx}`,
      wIdx === 1 ? result.rangeW1Str : result.rangeW2Str,
      '6 gg lav.',
      Math.round(wRows.reduce((a, b) => a + b.colliPerDept.ALIMENTARI, 0) * 10) / 10,
      Math.round(wRows.reduce((a, b) => a + b.colliPerDept.CHIMICA, 0) * 10) / 10,
      Math.round(wRows.reduce((a, b) => a + b.colliPerDept.LIQUIDI, 0) * 10) / 10,
      Math.round(wRows.reduce((a, b) => a + b.colliPerDept.PETFOOD, 0) * 10) / 10,
      Math.round(wRows.reduce((a, b) => a + b.colliPerDept.PROFUMERIA, 0) * 10) / 10,
      Math.round(wRows.reduce((a, b) => a + b.totaleColliGiorno, 0) * 10) / 10
    ]);
  });

  // Totale
  f3Data.push([
    'TOTALE 2 SETTIMANE (14 GG)',
    result.range2WStr,
    '12 gg lav.',
    Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.ALIMENTARI, 0) * 10) / 10,
    Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.CHIMICA, 0) * 10) / 10,
    Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.LIQUIDI, 0) * 10) / 10,
    Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.PETFOOD, 0) * 10) / 10,
    Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.PROFUMERIA, 0) * 10) / 10,
    Math.round(result.riepilogo14gg.reduce((a, b) => a + b.totaleColliGiorno, 0) * 10) / 10
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet(f3Data);
  XLSX.utils.book_append_sheet(wb, ws3, '3_Previsione_Colli_14gg_Col_L');

  // -------------------------------------------------------------
  // FOGLIO 4: 4_Dettaglio_14gg_Ore_Costi
  // -------------------------------------------------------------
  const f4Data: (string | number)[][] = [
    [`DETTAGLIO GIORNALIERO BISETTIMANALE (${result.range2WStr}) PER SOTTOREPARTO: ORE, PRODUTTIVITÀ E COSTI`],
    [],
    [
      'Settimana', 'Data', 'Giorno', 'Data Estesa', 'Sottoreparto', 'Colli Previsti (Col. L)',
      'Resa Target (c/h)', 'Capacità Turno (c/3h)', 'Ore Richieste', 'FTE Teorici (3h)',
      'Addetti (Soglia 0,50)', 'Ore Presidiate (0,50)', 'Bilancio Ore Mobilità',
      'Produttività Eff. (c/h)', 'Produttività Eff. (c/turno)',
      'Costo Lavoro Teorico (€)', 'Costo Lavoro Presidio 0,50 (€)', 'Costo per Collo Teorico (€)'
    ]
  ];

  result.dfStaff2w.filter(r => r.giornoNum < 6).forEach(r => {
    f4Data.push([
      r.settimanaLabel,
      r.dataStr,
      r.giornoNome,
      r.dataEstesa,
      r.sottoreparto,
      r.colliL,
      r.resaTargetOraria,
      r.capacitaTargetTurno,
      r.oreRichieste,
      r.fteTeorici,
      r.addettiSoglia050,
      r.orePresidiate050,
      r.bilancioOreMobilita,
      r.prodEffettivaOraria,
      r.prodEffettivaTurno,
      r.costoTeoricoEuro,
      r.costoPresidio050Euro,
      r.costoUnitarioColloTeorico
    ]);
  });

  const ws4 = XLSX.utils.aoa_to_sheet(f4Data);
  XLSX.utils.book_append_sheet(wb, ws4, '4_Dettaglio_14gg_Ore_Costi');

  // -------------------------------------------------------------
  // FOGLIO 5: 5_Produttivita_e_Costi_2_Sett
  // -------------------------------------------------------------
  const f5Data: (string | number)[][] = [
    [`ANALISI PRODUTTIVITÀ E COSTO DEL LAVORO SU 2 SETTIMANE CONSECUTIVE (${result.range2WStr})`],
    [],
    [
      'Sottoreparto / Voce', 'Resa Target (c/h)', 'Media Colli / Gg Lav.',
      'Sett. 1 Colli', 'Sett. 1 Turni (0,50)', 'Sett. 1 Costo (€)',
      'Sett. 2 Colli', 'Sett. 2 Turni (0,50)', 'Sett. 2 Costo (€)',
      'TOTALE 2 SETT. Colli', 'TOTALE 2 SETT. Ore Richieste', 'TOTALE 2 SETT. Turni Teorici',
      'TOTALE 2 SETT. Turni Reali', 'TOTALE 2 SETT. Ore Presidiate',
      'Prod. Effettiva (Colli/h)', 'Prod. Effettiva (Colli/Turno)', 'Saturazione Presidio (%)',
      'TOTALE Costo Teorico (€)', 'TOTALE Costo Reale (€)', 'Costo per Collo (€/collo)'
    ]
  ];

  result.prod2w.forEach(p => {
    f5Data.push([
      p.sottoreparto,
      p.resaTargetOraria,
      p.mediaColliGiornoLav,
      p.colliSett1,
      p.turni050Sett1,
      p.costo050Sett1Euro,
      p.colliSett2,
      p.turni050Sett2,
      p.costo050Sett2Euro,
      p.colliBisettimanali,
      p.oreRichieste2W,
      p.turniTeorici2W,
      p.turniPresidio050_2W,
      p.orePresidio050_2W,
      p.prodEffettivaOraria050,
      p.prodEffettivaTurno050,
      `${p.saturazioneMediaPresidioPct}%`,
      p.costoTeorico2WEuro,
      p.costoPresidio050_2WEuro,
      p.costoPerColloTeoricoEuro
    ]);
  });

  const ws5 = XLSX.utils.aoa_to_sheet(f5Data);
  XLSX.utils.book_append_sheet(wb, ws5, '5_Produttivita_e_Costi_2_Sett');

  // Trigger download in browser
  const outName = fileName || `Report_Previsionale_Bisettimanale_Grocery_${result.range2WStr.replace(/\s+/g, '_').replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, outName);
}

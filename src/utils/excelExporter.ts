import ExcelJS from 'exceljs';
import { PredictionResult, OperationalParams, DEPARTMENTS } from '../types';

/**
 * Esporta il report Excel professionale a 5 fogli con formattazione grafica completa:
 * - Titoli in evidenza con indicazione costo orario CCNL e intervalli storici/previsionali
 * - Header tabelle in Blu Notte Istituzionale (#1B365D) con testo bianco in grassetto
 * - Subtotali Settimana 1 e 2 evidenziati in celeste chiaro (#EBF3FB) con font bold
 * - Totale 2 Settimane evidenziato in verde pastello (#E2F0D9) con doppia bordatura inferiore
 * - Formattazione numerica valute (€) e decimali, larghezze colonne auto-calibrate
 * 
 * Fogli generati:
 * 1. 1_Turni_2_Settimane_e_Costi (esattamente corrispondente all'immagine di riferimento)
 * 2. 2_Sintesi_1W_2W_Mese_Trim
 * 3. 3_Previsione_Colli_14gg_Col_L
 * 4. 4_Dettaglio_14gg_Ore_Costi
 * 5. 5_Produttivita_e_Costi_2_Sett
 */
export async function exportFullExcelReport(
  result: PredictionResult,
  params?: OperationalParams,
  sourceFileName?: string
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Grocery Planning AI Studio';
  wb.lastModifiedBy = 'Grocery Planning AI Studio';
  wb.created = new Date();
  wb.modified = new Date();

  const costoOrarioVal = params?.costoOrario ?? 12.80;
  const costoOrarioStr = `€ ${costoOrarioVal.toFixed(2).replace('.', ',')}/h`;
  const fileLabel = sourceFileName || 'distinta_ordini.xlsx';

  // Palette Stili
  const navyHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1B365D' }
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 10,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  const subtotalFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEBF3FB' }
  };

  const grandTotalFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2F0D9' }
  };

  const titleFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 13,
    bold: true,
    color: { argb: 'FF0F2942' }
  };

  const subtitleFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 9.5,
    italic: true,
    color: { argb: 'FF475569' }
  };

  const standardFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 10,
    color: { argb: 'FF1E293B' }
  };

  const boldFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 10,
    bold: true,
    color: { argb: 'FF0F172A' }
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
  };

  const subtotalBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF94A3B8' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
  };

  const grandTotalBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF475569' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'double', color: { argb: 'FF0F172A' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
  };

  // =========================================================================
  // FOGLIO 1: 1_Turni_2_Settimane_e_Costi (Conforme all'immagine utente)
  // =========================================================================
  const ws1 = wb.addWorksheet('1_Turni_2_Settimane_e_Costi', {
    views: [{ showGridLines: true }]
  });

  // Titolo e Sottotitolo
  ws1.addRow([`PIANIFICAZIONE RILASCIO TURNI BISETTIMANALE (${result.range2WStr}): ADDETTI, MOBILITÀ E COSTO LAVORO (${costoOrarioStr})`]);
  ws1.getRow(1).getCell(1).font = titleFont;
  ws1.getRow(1).height = 24;

  ws1.addRow([`File Sorgente: ${fileLabel} (Storico: ${result.rangeStoricoStr}) | Settimana 1: ${result.rangeW1Str} | Settimana 2: ${result.rangeW2Str}`]);
  ws1.getRow(2).getCell(1).font = subtitleFont;
  ws1.getRow(2).height = 18;

  ws1.addRow([]); // Riga vuota 3

  // Intestazione Colonne Foglio 1
  const f1Headers = [
    'Settimana',
    'Data',
    'Giorno',
    'ALIMENTARI (Soglia 0,50 | FTE)',
    'CHIMICA (Soglia 0,50 | FTE)',
    'LIQUIDI (Soglia 0,50 | FTE)',
    'PETFOOD (Soglia 0,50 | FTE)',
    'PROFUMERIA (Soglia 0,50 | FTE)',
    'Somma Addetti (Soglia 0,50)',
    'Ore Nette Scoperte',
    'Addetti Jolly Mobilità',
    'Turni Teorici FTE',
    'SQUADRA OTTIMALE REALE',
    'Ore Reali Squadra',
    'Costo Lavoro Teorico (€)',
    'Costo Lavoro Reale Squadra (€)'
  ];

  const headerRow1 = ws1.addRow(f1Headers);
  headerRow1.height = 30;
  headerRow1.eachCell(cell => {
    cell.fill = navyHeaderFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  });

  // Righe Dati e Subtotali Settimana 1 e 2
  [1, 2].forEach(wIdx => {
    const wRows = result.riepilogo14gg.filter(r => r.settimanaNum === wIdx);

    wRows.forEach(r => {
      const row = ws1.addRow([
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

      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = standardFont;
        cell.border = thinBorder;
        if (colNum <= 3) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNum >= 4 && colNum <= 8) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colNum >= 9 && colNum <= 14) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          if (colNum === 10 || colNum === 12 || colNum === 14) {
            cell.numFmt = '#,##0.00';
          } else {
            cell.numFmt = '#,##0';
          }
        } else {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '€ #,##0.00';
        }
      });
    });

    // Subtotale Settimana
    const sumAlimArr = wRows.reduce((a, b) => a + b.arr050PerDept.ALIMENTARI, 0);
    const sumAlimFte = wRows.reduce((a, b) => a + b.ftePerDept.ALIMENTARI, 0).toFixed(2);

    const sumChimArr = wRows.reduce((a, b) => a + b.arr050PerDept.CHIMICA, 0);
    const sumChimFte = wRows.reduce((a, b) => a + b.ftePerDept.CHIMICA, 0).toFixed(2);

    const sumLiqArr = wRows.reduce((a, b) => a + b.arr050PerDept.LIQUIDI, 0);
    const sumLiqFte = wRows.reduce((a, b) => a + b.ftePerDept.LIQUIDI, 0).toFixed(2);

    const sumPetArr = wRows.reduce((a, b) => a + b.arr050PerDept.PETFOOD, 0);
    const sumPetFte = wRows.reduce((a, b) => a + b.ftePerDept.PETFOOD, 0).toFixed(2);

    const sumProfArr = wRows.reduce((a, b) => a + b.arr050PerDept.PROFUMERIA, 0);
    const sumProfFte = wRows.reduce((a, b) => a + b.ftePerDept.PROFUMERIA, 0).toFixed(2);

    const sub050 = wRows.reduce((a, b) => a + b.sommaAddettiReparto050, 0);
    const subOreScoperte = Math.round(wRows.reduce((a, b) => a + b.oreNetteScoperte, 0) * 100) / 100;
    const subJolly = wRows.reduce((a, b) => a + b.addettiJollyMobilita, 0);
    const subTeo = Math.round(wRows.reduce((a, b) => a + b.turniTeoriciTotaliFte, 0) * 100) / 100;
    const subOpt = wRows.reduce((a, b) => a + b.squadraOttimaleReale, 0);
    const subOreReali = Math.round(wRows.reduce((a, b) => a + b.oreRealiSquadra, 0) * 100) / 100;
    const subCostoTeo = Math.round(wRows.reduce((a, b) => a + b.costoLavoroTeoricoEuro, 0) * 100) / 100;
    const subCostoReale = Math.round(wRows.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0) * 100) / 100;

    const subRow = ws1.addRow([
      `SUBTOTALE SETTIMANA ${wIdx}`,
      wIdx === 1 ? result.rangeW1Str : result.rangeW2Str,
      '6 gg lav. su 7',
      `${sumAlimArr} (${sumAlimFte})`,
      `${sumChimArr} (${sumChimFte})`,
      `${sumLiqArr} (${sumLiqFte})`,
      `${sumPetArr} (${sumPetFte})`,
      `${sumProfArr} (${sumProfFte})`,
      sub050,
      subOreScoperte,
      subJolly,
      subTeo,
      subOpt,
      subOreReali,
      subCostoTeo,
      subCostoReale
    ]);

    subRow.height = 22;
    subRow.eachCell((cell, colNum) => {
      cell.fill = subtotalFill;
      cell.font = boldFont;
      cell.border = subtotalBorder;
      if (colNum <= 3) {
        cell.alignment = { horizontal: colNum === 1 ? 'left' : 'center', vertical: 'middle' };
      } else if (colNum >= 4 && colNum <= 8) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNum >= 9 && colNum <= 14) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (colNum === 10 || colNum === 12 || colNum === 14) {
          cell.numFmt = '#,##0.00';
        } else {
          cell.numFmt = '#,##0';
        }
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '€ #,##0.00';
      }
    });
  });

  // TOTALE 2 SETTIMANE (RILASCIO TURNI)
  const totAlimArr = result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.ALIMENTARI, 0);
  const totAlimFte = result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.ALIMENTARI, 0).toFixed(2);

  const totChimArr = result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.CHIMICA, 0);
  const totChimFte = result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.CHIMICA, 0).toFixed(2);

  const totLiqArr = result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.LIQUIDI, 0);
  const totLiqFte = result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.LIQUIDI, 0).toFixed(2);

  const totPetArr = result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.PETFOOD, 0);
  const totPetFte = result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.PETFOOD, 0).toFixed(2);

  const totProfArr = result.riepilogo14gg.reduce((a, b) => a + b.arr050PerDept.PROFUMERIA, 0);
  const totProfFte = result.riepilogo14gg.reduce((a, b) => a + b.ftePerDept.PROFUMERIA, 0).toFixed(2);

  const grand050 = result.riepilogo14gg.reduce((a, b) => a + b.sommaAddettiReparto050, 0);
  const grandOreScoperte = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.oreNetteScoperte, 0) * 100) / 100;
  const grandJolly = result.riepilogo14gg.reduce((a, b) => a + b.addettiJollyMobilita, 0);
  const grandTeo = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.turniTeoriciTotaliFte, 0) * 100) / 100;
  const grandOpt = result.riepilogo14gg.reduce((a, b) => a + b.squadraOttimaleReale, 0);
  const grandOreReali = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.oreRealiSquadra, 0) * 100) / 100;
  const grandCostoTeo = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.costoLavoroTeoricoEuro, 0) * 100) / 100;
  const grandCostoReale = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0) * 100) / 100;

  const grandRow = ws1.addRow([
    'TOTALE 2 SETTIMANE (RILASCIO TURNI)',
    result.range2WStr,
    '12 gg lav. su 14',
    `${totAlimArr} (${totAlimFte})`,
    `${totChimArr} (${totChimFte})`,
    `${totLiqArr} (${totLiqFte})`,
    `${totPetArr} (${totPetFte})`,
    `${totProfArr} (${totProfFte})`,
    grand050,
    grandOreScoperte,
    grandJolly,
    grandTeo,
    grandOpt,
    grandOreReali,
    grandCostoTeo,
    grandCostoReale
  ]);

  grandRow.height = 24;
  grandRow.eachCell((cell, colNum) => {
    cell.fill = grandTotalFill;
    cell.font = boldFont;
    cell.border = grandTotalBorder;
    if (colNum <= 3) {
      cell.alignment = { horizontal: colNum === 1 ? 'left' : 'center', vertical: 'middle' };
    } else if (colNum >= 4 && colNum <= 8) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else if (colNum >= 9 && colNum <= 14) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      if (colNum === 10 || colNum === 12 || colNum === 14) {
        cell.numFmt = '#,##0.00';
      } else {
        cell.numFmt = '#,##0';
      }
    } else {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.numFmt = '€ #,##0.00';
    }
  });

  // Larghezze colonne calibrate Foglio 1
  ws1.columns = [
    { width: 17 }, // Settimana
    { width: 14 }, // Data
    { width: 15 }, // Giorno
    { width: 23 }, // Alimentari
    { width: 22 }, // Chimica
    { width: 22 }, // Liquidi
    { width: 22 }, // Petfood
    { width: 23 }, // Profumeria
    { width: 18 }, // Somma 0,50
    { width: 16 }, // Ore Scoperte
    { width: 15 }, // Jolly Mobilità
    { width: 16 }, // Turni Teorici FTE
    { width: 20 }, // SQUADRA OTTIMALE REALE
    { width: 16 }, // Ore Reali Squadra
    { width: 18 }, // Costo Teorico
    { width: 20 }  // Costo Reale
  ];

  // =========================================================================
  // FOGLIO 2: 2_Sintesi_1W_2W_Mese_Trim
  // =========================================================================
  const ws2 = wb.addWorksheet('2_Sintesi_1W_2W_Mese_Trim', {
    views: [{ showGridLines: true }]
  });

  ws2.addRow([`SINTESI MULTI-ORIZZONTE: SETTIMANA 1 (${result.rangeW1Str}), 2 SETTIMANE (${result.range2WStr}), MESE E TRIMESTRE`]);
  ws2.getRow(1).getCell(1).font = titleFont;
  ws2.getRow(1).height = 24;

  ws2.addRow([`Pianificazione fabbisogno turni e costo del lavoro CCNL (${costoOrarioStr}) su orizzonti temporali scalari`]);
  ws2.getRow(2).getCell(1).font = subtitleFont;
  ws2.getRow(2).height = 18;

  ws2.addRow([]);

  const f2Headers = [
    'Sottoreparto / Voce',
    'Dotazione Giornaliera',
    'Sett. 1 Colli',
    'Sett. 1 Turni Reali',
    'Sett. 1 Costo Reale (€)',
    '2 Sett. Colli',
    '2 Sett. Turni Teorici',
    '2 Sett. Turni Reali',
    '2 Sett. Costo Reale (€)',
    'Mese (30gg) Turni Reali',
    'Mese (30gg) Costo Reale (€)',
    'Trimestre (13 Sett.) Turni Reali',
    'Trimestre Costo Reale (€)'
  ];

  const headerRow2 = ws2.addRow(f2Headers);
  headerRow2.height = 30;
  headerRow2.eachCell(cell => {
    cell.fill = navyHeaderFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  });

  result.sintesiOrizzonti.forEach(item => {
    const isTotale = item.label.includes('TOTALE');
    const isJolly = item.label.includes('Jolly');
    const isSub = item.label.includes('Subtotale');

    const row = ws2.addRow([
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

    row.height = isTotale ? 24 : 20;
    row.eachCell((cell, colNum) => {
      cell.border = isTotale ? grandTotalBorder : thinBorder;
      if (isTotale) {
        cell.fill = grandTotalFill;
        cell.font = boldFont;
      } else if (isSub) {
        cell.fill = subtotalFill;
        cell.font = boldFont;
      } else {
        cell.font = standardFont;
      }

      if (colNum === 1) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNum === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNum === 5 || colNum === 9 || colNum === 11 || colNum === 13) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '€ #,##0.00';
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
  });

  ws2.columns = [
    { width: 28 },
    { width: 22 },
    { width: 14 },
    { width: 16 },
    { width: 18 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
    { width: 20 },
    { width: 22 },
    { width: 20 }
  ];

  // =========================================================================
  // FOGLIO 3: 3_Previsione_Colli_14gg_Col_L
  // =========================================================================
  const ws3 = wb.addWorksheet('3_Previsione_Colli_14gg_Col_L', {
    views: [{ showGridLines: true }]
  });

  ws3.addRow([`PREVISIONE BISETTIMANALE (${result.range2WStr}) COLLI EFFETTIVI DA ALLESTIRE (DA COLONNA L)`]);
  ws3.getRow(1).getCell(1).font = titleFont;
  ws3.getRow(1).height = 24;

  ws3.addRow([`Volumi previsionali giornalieri per sottoreparto elaborati dal modello Machine Learning a 2 stadi`]);
  ws3.getRow(2).getCell(1).font = subtitleFont;
  ws3.getRow(2).height = 18;

  ws3.addRow([]);

  const f3Headers = [
    'Settimana',
    'Data',
    'Giorno',
    'ALIMENTARI',
    'CHIMICA',
    'LIQUIDI',
    'PETFOOD',
    'PROFUMERIA',
    'TOTALE COLLI GIORNO'
  ];

  const headerRow3 = ws3.addRow(f3Headers);
  headerRow3.height = 30;
  headerRow3.eachCell(cell => {
    cell.fill = navyHeaderFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  });

  [1, 2].forEach(wIdx => {
    const wRows = result.riepilogo14gg.filter(r => r.settimanaNum === wIdx);
    wRows.forEach(r => {
      const row = ws3.addRow([
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
      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = standardFont;
        cell.border = thinBorder;
        if (colNum <= 3) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.0';
        }
      });
    });

    // Subtotale Foglio 3
    const subColliAlim = Math.round(wRows.reduce((a, b) => a + b.colliPerDept.ALIMENTARI, 0) * 10) / 10;
    const subColliChim = Math.round(wRows.reduce((a, b) => a + b.colliPerDept.CHIMICA, 0) * 10) / 10;
    const subColliLiq = Math.round(wRows.reduce((a, b) => a + b.colliPerDept.LIQUIDI, 0) * 10) / 10;
    const subColliPet = Math.round(wRows.reduce((a, b) => a + b.colliPerDept.PETFOOD, 0) * 10) / 10;
    const subColliProf = Math.round(wRows.reduce((a, b) => a + b.colliPerDept.PROFUMERIA, 0) * 10) / 10;
    const subColliTot = Math.round(wRows.reduce((a, b) => a + b.totaleColliGiorno, 0) * 10) / 10;

    const subRow3 = ws3.addRow([
      `SUBTOTALE SETTIMANA ${wIdx}`,
      wIdx === 1 ? result.rangeW1Str : result.rangeW2Str,
      '6 gg lav. su 7',
      subColliAlim,
      subColliChim,
      subColliLiq,
      subColliPet,
      subColliProf,
      subColliTot
    ]);
    subRow3.height = 22;
    subRow3.eachCell((cell, colNum) => {
      cell.fill = subtotalFill;
      cell.font = boldFont;
      cell.border = subtotalBorder;
      if (colNum <= 3) {
        cell.alignment = { horizontal: colNum === 1 ? 'left' : 'center', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0.0';
      }
    });
  });

  // Totale 2 Settimane Foglio 3
  const totColliAlim = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.ALIMENTARI, 0) * 10) / 10;
  const totColliChim = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.CHIMICA, 0) * 10) / 10;
  const totColliLiq = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.LIQUIDI, 0) * 10) / 10;
  const totColliPet = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.PETFOOD, 0) * 10) / 10;
  const totColliProf = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.colliPerDept.PROFUMERIA, 0) * 10) / 10;
  const totColliTot = Math.round(result.riepilogo14gg.reduce((a, b) => a + b.totaleColliGiorno, 0) * 10) / 10;

  const grandRow3 = ws3.addRow([
    'TOTALE 2 SETTIMANE (14 GG)',
    result.range2WStr,
    '12 gg lav. su 14',
    totColliAlim,
    totColliChim,
    totColliLiq,
    totColliPet,
    totColliProf,
    totColliTot
  ]);
  grandRow3.height = 24;
  grandRow3.eachCell((cell, colNum) => {
    cell.fill = grandTotalFill;
    cell.font = boldFont;
    cell.border = grandTotalBorder;
    if (colNum <= 3) {
      cell.alignment = { horizontal: colNum === 1 ? 'left' : 'center', vertical: 'middle' };
    } else {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.numFmt = '#,##0.0';
    }
  });

  ws3.columns = [
    { width: 17 },
    { width: 14 },
    { width: 15 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 20 }
  ];

  // =========================================================================
  // FOGLIO 4: 4_Dettaglio_14gg_Ore_Costi
  // =========================================================================
  const ws4 = wb.addWorksheet('4_Dettaglio_14gg_Ore_Costi', {
    views: [{ showGridLines: true }]
  });

  ws4.addRow([`DETTAGLIO GIORNALIERO BISETTIMANALE (${result.range2WStr}) PER SOTTOREPARTO: ORE, PRODUTTIVITÀ E COSTI`]);
  ws4.getRow(1).getCell(1).font = titleFont;
  ws4.getRow(1).height = 24;

  ws4.addRow([`Esploso analitico delle 60 combinazioni giorno-reparto (6 gg/settimana x 5 sottoreparti x 2 settimane)`]);
  ws4.getRow(2).getCell(1).font = subtitleFont;
  ws4.getRow(2).height = 18;

  ws4.addRow([]);

  const f4Headers = [
    'Settimana',
    'Data',
    'Giorno',
    'Data Estesa',
    'Sottoreparto',
    'Colli Previsti (Col. L)',
    'Resa Target (c/h)',
    'Capacità Turno (c/3h)',
    'Ore Richieste',
    'FTE Teorici (3h)',
    'Addetti (Soglia 0,50)',
    'Ore Presidiate (0,50)',
    'Bilancio Ore Mobilità',
    'Produttività Eff. (c/h)',
    'Produttività Eff. (c/turno)',
    'Costo Lavoro Teorico (€)',
    'Costo Lavoro Presidio 0,50 (€)',
    'Costo per Collo Teorico (€)'
  ];

  const headerRow4 = ws4.addRow(f4Headers);
  headerRow4.height = 30;
  headerRow4.eachCell(cell => {
    cell.fill = navyHeaderFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  });

  result.dfStaff2w.filter(r => r.giornoNum < 6).forEach(r => {
    const row = ws4.addRow([
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
    row.height = 19;
    row.eachCell((cell, colNum) => {
      cell.font = standardFont;
      cell.border = thinBorder;
      if (colNum <= 3) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNum === 4 || colNum === 5) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNum >= 6 && colNum <= 15) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        if (colNum === 10 || colNum === 11) {
          cell.numFmt = '#,##0';
        } else {
          cell.numFmt = '#,##0.00';
        }
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '€ #,##0.00';
      }
    });
  });

  ws4.columns = [
    { width: 14 },
    { width: 12 },
    { width: 12 },
    { width: 22 },
    { width: 16 },
    { width: 20 },
    { width: 16 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 20 },
    { width: 20 },
    { width: 22 },
    { width: 20 }
  ];

  // =========================================================================
  // FOGLIO 5: 5_Produttivita_e_Costi_2_Sett
  // =========================================================================
  const ws5 = wb.addWorksheet('5_Produttivita_e_Costi_2_Sett', {
    views: [{ showGridLines: true }]
  });

  ws5.addRow([`ANALISI PRODUTTIVITÀ E COSTO DEL LAVORO SU 2 SETTIMANE CONSECUTIVE (${result.range2WStr})`]);
  ws5.getRow(1).getCell(1).font = titleFont;
  ws5.getRow(1).height = 24;

  ws5.addRow([`Riepilogo consolidato per sottoreparto: rese orarie target, saturazione presidio ed efficienza di costo`]);
  ws5.getRow(2).getCell(1).font = subtitleFont;
  ws5.getRow(2).height = 18;

  ws5.addRow([]);

  const f5Headers = [
    'Sottoreparto / Voce',
    'Resa Target (c/h)',
    'Media Colli / Gg Lav.',
    'Sett. 1 Colli',
    'Sett. 1 Turni (0,50)',
    'Sett. 1 Costo (€)',
    'Sett. 2 Colli',
    'Sett. 2 Turni (0,50)',
    'Sett. 2 Costo (€)',
    'TOTALE 2 SETT. Colli',
    'TOTALE 2 SETT. Ore Richieste',
    'TOTALE 2 SETT. Turni Teorici',
    'TOTALE 2 SETT. Turni Reali',
    'TOTALE 2 SETT. Ore Presidiate',
    'Prod. Effettiva (Colli/h)',
    'Prod. Effettiva (Colli/Turno)',
    'Saturazione Presidio (%)',
    'TOTALE Costo Teorico (€)',
    'TOTALE Costo Reale (€)',
    'Costo per Collo (€/collo)'
  ];

  const headerRow5 = ws5.addRow(f5Headers);
  headerRow5.height = 30;
  headerRow5.eachCell(cell => {
    cell.fill = navyHeaderFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = thinBorder;
  });

  result.prod2w.forEach(p => {
    const isTotale = p.sottoreparto.includes('TOTALE');
    const row = ws5.addRow([
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

    row.height = isTotale ? 24 : 20;
    row.eachCell((cell, colNum) => {
      cell.border = isTotale ? grandTotalBorder : thinBorder;
      if (isTotale) {
        cell.fill = grandTotalFill;
        cell.font = boldFont;
      } else {
        cell.font = standardFont;
      }

      if (colNum === 1) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNum === 17) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNum === 6 || colNum === 9 || colNum === 18 || colNum === 19 || colNum === 20) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = colNum === 20 ? '€ #,##0.000' : '€ #,##0.00';
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = colNum === 2 || colNum === 4 || colNum === 5 || colNum === 7 || colNum === 8 || colNum === 10 || colNum === 13 ? '#,##0' : '#,##0.00';
      }
    });
  });

  ws5.columns = [
    { width: 22 },
    { width: 16 },
    { width: 18 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 22 },
    { width: 20 },
    { width: 20 },
    { width: 22 },
    { width: 20 },
    { width: 22 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 20 }
  ];

  // Scrittura file Excel nel browser
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanDates = result.range2WStr.replace(/[\/\s:]+/g, '-');
  a.download = `Report_Previsionale_Bisettimanale_Grocery_${cleanDates}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

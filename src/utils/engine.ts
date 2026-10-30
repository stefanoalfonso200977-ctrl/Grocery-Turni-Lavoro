import * as XLSX from 'xlsx';
import {
  Department,
  DEPARTMENTS,
  OperationalParams,
  DayForecastStaff,
  DailySummary14,
  DeptProdSummary2W,
  HorizonItem,
  PredictionResult,
  HistoricalRecord
} from '../types';

export const MESI_MAP: Record<string, number> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4,
  maggio: 5, giugno: 6, luglio: 7, agosto: 8,
  settembre: 9, ottobre: 10, novembre: 11, dicembre: 12
};

export const MESI_INV_MAP: Record<number, string> = {
  1: 'Gennaio', 2: 'Febbraio', 3: 'Marzo', 4: 'Aprile',
  5: 'Maggio', 6: 'Giugno', 7: 'Luglio', 8: 'Agosto',
  9: 'Settembre', 10: 'Ottobre', 11: 'Novembre', 12: 'Dicembre'
};

export const GIORNI_ITA = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
export const GIORNI_ABBR = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

/**
 * Regola di arrotondamento sottoreparto:
 * - Se parte decimale < 0.50 -> arrotondamento per DIFETTO (floor)
 * - Se parte decimale >= 0.50 -> arrotondamento per ECCESSO (ceil)
 */
export function arrotondaSoglia050(val: number): number {
  if (val <= 0) return 0;
  const parteDecimale = Math.round((val - Math.floor(val)) * 10000) / 10000;
  return parteDecimale < 0.5 ? Math.floor(val) : Math.ceil(val);
}

/**
 * Parsing robusto di numeri italiani o standard (gestione punto per migliaia e virgola decimale)
 */
export function parseItalianNumber(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  let s = String(val).trim();
  if (!s) return 0;

  // Rimozione simboli valuta, spazi, etc.
  s = s.replace(/[€\s]/g, '');

  // Formato tipo "1.234,50" -> 1234.50
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    // Formato tipo "12,5" -> 12.5
    s = s.replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    // Formato tipo "1.250" o "12.500" (migliaia con punto e senza decimali)
    s = s.replace(/\./g, '');
  }

  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/**
 * Parsing di date sia in formato esteso italiano ("Lunedì 12 Ottobre 2026")
 * sia in formato standard ISO o seriale Excel.
 */
export function parseDate(val: unknown): Date | null {
  if (!val) return null;

  if (val instanceof Date && !isNaN(val.getTime())) {
    return val;
  }

  if (typeof val === 'number') {
    // Seriale Excel: 1 = 1899-12-31, con bug leap year 1900
    // XLSX converte o gestisce seriali
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const days = Math.floor(val);
    const ms = Math.round((val - days) * 86400000);
    const d = new Date(excelEpoch.getTime() + days * 86400000 + ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const s = String(val).trim();
  const parts = s.split(/\s+/);

  // Es: "Lunedì 12 Ottobre 2026" oppure "12 Ottobre 2026"
  if (parts.length >= 3) {
    for (let i = 0; i < parts.length - 1; i++) {
      const meseKey = parts[i].toLowerCase();
      if (MESI_MAP[meseKey] && i > 0) {
        const giorno = parseInt(parts[i - 1], 10);
        const mese = MESI_MAP[meseKey];
        const anno = parseInt(parts[i + 1], 10);
        if (!isNaN(giorno) && !isNaN(anno) && anno > 2000) {
          const d = new Date(anno, mese - 1, giorno);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }
  }

  // Fallback DD/MM/YYYY o DD-MM-YYYY
  const dmMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmMatch) {
    const d = new Date(parseInt(dmMatch[3], 10), parseInt(dmMatch[2], 10) - 1, parseInt(dmMatch[1], 10));
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback standard Date.parse (es. YYYY-MM-DD)
  const dStandard = new Date(s);
  return isNaN(dStandard.getTime()) ? null : dStandard;
}

export function formatDataBreve(d: Date): string {
  const dow = (d.getDay() + 6) % 7;
  const gAbbr = GIORNI_ABBR[dow];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${gAbbr} ${dd}/${mm}/${yyyy}`;
}

export function formatDataStr(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDataEstesa(d: Date): string {
  const dow = (d.getDay() + 6) % 7;
  const gNome = GIORNI_ITA[dow];
  const dd = String(d.getDate()).padStart(2, '0');
  const mNome = MESI_INV_MAP[d.getMonth() + 1];
  const yyyy = d.getFullYear();
  return `${gNome} ${dd} ${mNome} ${yyyy}`;
}

/**
 * Normalizza il nome del sottoreparto supportando tutte le varianti
 * usate nella GDO italiana.
 */
export function normalizeDept(raw: unknown): Department | null {
  if (!raw) return null;
  const s = String(raw).trim().toUpperCase();

  // ALIMENTARI
  if (
    s.includes('ALIM') ||
    s.includes('DROGHERIA') ||
    s.includes('SECCO') ||
    s.includes('GROCERY') ||
    s.includes('FRESCH') ||
    s.includes('SURGELAT') ||
    s.includes('FOOD') && !s.includes('PET')
  ) {
    return 'ALIMENTARI';
  }

  // CHIMICA
  if (
    s.includes('CHIM') ||
    s.includes('DETERG') ||
    s.includes('PULIZIA') ||
    s.includes('CASA') ||
    s.includes('DETERSIV')
  ) {
    return 'CHIMICA';
  }

  // LIQUIDI
  if (
    s.includes('LIQ') ||
    s.includes('BEV') ||
    s.includes('DRINK') ||
    s.includes('ACQU') ||
    s.includes('BIRR') ||
    s.includes('VIN') ||
    s.includes('BIBIT')
  ) {
    return 'LIQUIDI';
  }

  // PETFOOD
  if (
    s.includes('PET') ||
    s.includes('ANIMAL') ||
    s.includes('CANE') ||
    s.includes('GATT')
  ) {
    return 'PETFOOD';
  }

  // PROFUMERIA
  if (
    s.includes('PROFUM') ||
    s.includes('COSM') ||
    s.includes('CURA') ||
    s.includes('IGIEN') ||
    s.includes('BELLEZZA') ||
    s.includes('PERSONAL')
  ) {
    return 'PROFUMERIA';
  }

  return null;
}



/**
 * Pipeline Previsionale Bisettimanale Completa:
 * 1. Raggruppa prima per (Data, Sottoreparto) calcolando la SOMMA GIORNALIERA dei colli
 *    (proprio come `df.groupby(['Data', 'Sottoreparto'])['Colli_Effettivi_L'].sum()` nel modello Python!).
 * 2. Applica la simulazione What-If:
 *    - Promo Prodotto COOP: aumenta la percentuale dei colli per le referenze aventi "COOP" in Colonna J.
 *    - Stagionalità: moltiplicatore percentuale di flessione o picco stagionale.
 * 3. Riconosce min e max date storiche e calcola l'inizio del piano bisettimanale.
 * 4. Addestra le stime temporali (dayAvg, lag1, lag7, roll3).
 * 5. Calcola turni, addetti soglia 0.50, jolly mobilità interna e costi lavoro.
 */
export function runUnifiedForecastPipeline(
  records: HistoricalRecord[],
  params: OperationalParams,
  isBaseline: boolean = false
): PredictionResult {
  if (records.length === 0) {
    throw new Error('Nessun record valido trovato per la pianificazione.');
  }

  // Conteggio referenze COOP totali
  const totalRecords = records.length;
  const coopRecords = records.filter(r => r.isCoop).length;
  const coopPct = totalRecords > 0 ? Math.round((coopRecords / totalRecords) * 1000) / 10 : 0;

  // 1. RAGGRUPPAMENTO GIORNALIERO: somma tutti i colli delle singole righe d'ordine per (Data, Sottoreparto)
  const dailyMap: Record<string, {
    dataIso: string;
    dateObj: Date;
    giornoNum: number;
    giornoNome: string;
    depts: Record<Department, number>;
  }> = {};

  const isPromoCoop = params.whatIf?.promoCoopAttiva;
  const promoCoopPct = params.whatIf?.promoCoopPercentuale || 0;
  const fattoreStag = params.whatIf?.fattoreStagionalita || 100;

  records.forEach(r => {
    const d = parseDate(r.data);
    if (!d) return;

    const dataIso = d.toISOString().split('T')[0];
    const dow = (d.getDay() + 6) % 7;
    const gNome = GIORNI_ITA[dow];

    if (!dailyMap[dataIso]) {
      dailyMap[dataIso] = {
        dataIso,
        dateObj: d,
        giornoNum: dow,
        giornoNome: gNome,
        depts: {
          ALIMENTARI: 0,
          CHIMICA: 0,
          LIQUIDI: 0,
          PETFOOD: 0,
          PROFUMERIA: 0
        }
      };
    }

    let valEffettivo = r.colliEffettiviBase !== undefined ? r.colliEffettiviBase : r.colliEffettivi;

    // SIMULATORE WHAT-IF: se promo COOP attiva e riga appartiene a prodotto COOP (colonna J)
    if (isPromoCoop && r.isCoop && promoCoopPct !== 0) {
      valEffettivo = valEffettivo * (1 + promoCoopPct / 100);
    }

    // SIMULATORE WHAT-IF: fattore di stagionalità
    if (fattoreStag !== 100) {
      valEffettivo = valEffettivo * (fattoreStag / 100);
    }

    if (r.sottoreparto && dailyMap[dataIso].depts[r.sottoreparto] !== undefined) {
      dailyMap[dataIso].depts[r.sottoreparto] += Math.round(valEffettivo);
    }
  });

  const dailyList = Object.values(dailyMap).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  if (dailyList.length === 0) {
    throw new Error('Nessuna data valida trovata nelle righe del file Excel.');
  }

  // 2. Rileva min e max date storiche
  const dataMinStorico = dailyList[0].dateObj;
  const dataMaxStorico = dailyList[dailyList.length - 1].dateObj;

  // Calcolo data di inizio piano bisettimanale: Lunedì immediatamente successivo alla data massima
  const maxDow = (dataMaxStorico.getDay() + 6) % 7; // 0=Lun, 6=Dom
  let giorniAlProssimoLunedi = (7 - maxDow) % 7;
  if (giorniAlProssimoLunedi === 0) {
    giorniAlProssimoLunedi = 7;
  }
  const dataInizioPiano = new Date(dataMaxStorico.getTime() + giorniAlProssimoLunedi * 86400000);
  dataInizioPiano.setHours(0, 0, 0, 0);

  // Calendario 14 giorni (2 settimane consecutive)
  const calendario14: Date[] = [];
  for (let i = 0; i < 14; i++) {
    calendario14.push(new Date(dataInizioPiano.getTime() + i * 86400000));
  }

  const inizioW1 = calendario14[0];
  const fineW1 = calendario14[6];
  const inizioW2 = calendario14[7];
  const fineW2 = calendario14[13];

  const rangeStoricoStr = `${formatDataStr(dataMinStorico)} - ${formatDataStr(dataMaxStorico)}`;
  const rangeW1Str = `${formatDataStr(inizioW1)} - ${formatDataStr(fineW1)}`;
  const rangeW2Str = `${formatDataStr(inizioW2)} - ${formatDataStr(fineW2)}`;
  const range2WStr = `${formatDataStr(inizioW1)} - ${formatDataStr(fineW2)}`;

  // 3. Calcolo medie giornaliere storiche per giorno della settimana (Lun..Sab) e stime temporali per reparto
  const deptDayAvg: Record<Department, Record<number, { sum: number; count: number }>> = {
    ALIMENTARI: {}, CHIMICA: {}, LIQUIDI: {}, PETFOOD: {}, PROFUMERIA: {}
  };
  const deptOverall: Record<Department, { sumColli: number; count: number; lag1: number; lag7: number; roll3: number }> = {
    ALIMENTARI: { sumColli: 0, count: 0, lag1: 450, lag7: 460, roll3: 455 },
    CHIMICA: { sumColli: 0, count: 0, lag1: 170, lag7: 175, roll3: 172 },
    LIQUIDI: { sumColli: 0, count: 0, lag1: 340, lag7: 345, roll3: 342 },
    PETFOOD: { sumColli: 0, count: 0, lag1: 115, lag7: 120, roll3: 118 },
    PROFUMERIA: { sumColli: 0, count: 0, lag1: 85, lag7: 90, roll3: 88 }
  };

  // Inizializza giorno-settimana per ogni dept
  DEPARTMENTS.forEach(dept => {
    for (let dow = 0; dow < 7; dow++) {
      deptDayAvg[dept][dow] = { sum: 0, count: 0 };
    }
  });

  // Aggrega sulle giornate storiche effettive
  dailyList.forEach(day => {
    if (day.giornoNum === 6) return; // ignora domeniche per le medie dei giorni feriali
    DEPARTMENTS.forEach(dept => {
      const colli = day.depts[dept] || 0;
      if (colli > 0) {
        deptDayAvg[dept][day.giornoNum].sum += colli;
        deptDayAvg[dept][day.giornoNum].count += 1;

        deptOverall[dept].sumColli += colli;
        deptOverall[dept].count += 1;
      }
    });
  });

  // Calcola Lag 1, Lag 7, Rolling 3 sulle ultime giornate storiche per ciascun reparto
  DEPARTMENTS.forEach(dept => {
    const deptDailyHistory = dailyList
      .filter(d => d.giornoNum < 6 && d.depts[dept] > 0)
      .map(d => d.depts[dept]);

    const len = deptDailyHistory.length;
    const overallMean = deptOverall[dept].count > 0
      ? deptOverall[dept].sumColli / deptOverall[dept].count
      : 400;

    deptOverall[dept].lag1 = len > 0 ? deptDailyHistory[len - 1] : overallMean;
    deptOverall[dept].lag7 = len >= 7 ? deptDailyHistory[len - 7] : overallMean;

    if (len >= 3) {
      deptOverall[dept].roll3 = (deptDailyHistory[len - 1] + deptDailyHistory[len - 2] + deptDailyHistory[len - 3]) / 3;
    } else {
      deptOverall[dept].roll3 = overallMean;
    }
  });

  // 4. Simulazione previsionale su 14 giorni
  const dfStaff2w: DayForecastStaff[] = [];
  const storiaPrevisioniW1: Record<Department, Record<number, number>> = {
    ALIMENTARI: {}, CHIMICA: {}, LIQUIDI: {}, PETFOOD: {}, PROFUMERIA: {}
  };
  const ultimiColliAttivi: Record<Department, number[]> = {
    ALIMENTARI: [deptOverall.ALIMENTARI.lag1, deptOverall.ALIMENTARI.roll3, deptOverall.ALIMENTARI.lag7],
    CHIMICA: [deptOverall.CHIMICA.lag1, deptOverall.CHIMICA.roll3, deptOverall.CHIMICA.lag7],
    LIQUIDI: [deptOverall.LIQUIDI.lag1, deptOverall.LIQUIDI.roll3, deptOverall.LIQUIDI.lag7],
    PETFOOD: [deptOverall.PETFOOD.lag1, deptOverall.PETFOOD.roll3, deptOverall.PETFOOD.lag7],
    PROFUMERIA: [deptOverall.PROFUMERIA.lag1, deptOverall.PROFUMERIA.roll3, deptOverall.PROFUMERIA.lag7]
  };

  calendario14.forEach((dataCorr, idx14) => {
    const wIdx = (idx14 < 7 ? 1 : 2) as 1 | 2;
    const wLabel = `Settimana ${wIdx}`;
    const rangeWCorr = wIdx === 1 ? rangeW1Str : rangeW2Str;
    const gNum = (dataCorr.getDay() + 6) % 7; // 0=Lun, 6=Dom
    const gNome = GIORNI_ITA[gNum];
    const dataStr = formatDataStr(dataCorr);
    const dataEstesa = formatDataEstesa(dataCorr);
    const dataBreve = formatDataBreve(dataCorr);
    const dataIso = dataCorr.toISOString().split('T')[0];
    const slotBisettimanale = `S${wIdx} - ${dataBreve}`;

    for (const dept of DEPARTMENTS) {
      let colliPred = 0.0;
      const resaTarget = params.reseOrarie[dept] || 40.0;
      const capacitaTurno = resaTarget * params.oreTurno;

      if (gNum === 6) {
        // Domenica chiuso / nessun allestimento
        colliPred = 0.0;
      } else {
        const stats = deptDayAvg[dept][gNum];
        const overallMean = deptOverall[dept].count > 0 ? deptOverall[dept].sumColli / deptOverall[dept].count : 300;
        const dayAvg = stats.count > 0 ? stats.sum / stats.count : overallMean;

        if (wIdx === 1) {
          // Stadio 2: blending modello storico
          const lag1 = deptOverall[dept].lag1;
          const roll3 = deptOverall[dept].roll3;
          colliPred = Math.max(0, 0.70 * dayAvg + 0.15 * lag1 + 0.15 * roll3);
          storiaPrevisioniW1[dept][gNum] = colliPred;
          ultimiColliAttivi[dept].push(colliPred);
        } else {
          // Settimana 2: proiezione bisettimanale autoregressiva
          const prevW1 = storiaPrevisioniW1[dept][gNum] || dayAvg;
          const uLen = ultimiColliAttivi[dept].length;
          const lastActive = ultimiColliAttivi[dept][uLen - 1];
          const last3Mean = (ultimiColliAttivi[dept][uLen - 1] + ultimiColliAttivi[dept][uLen - 2] + ultimiColliAttivi[dept][uLen - 3]) / 3;

          colliPred = Math.max(0, 0.60 * prevW1 + 0.25 * lastActive + 0.15 * last3Mean);
          ultimiColliAttivi[dept].push(colliPred);
        }
      }

      const colliRound = Math.round(colliPred * 10) / 10;
      const oreRichieste = Math.round((colliRound / resaTarget) * 100) / 100;
      const fte3h = Math.round((oreRichieste / params.oreTurno) * 100) / 100;
      const addetti050 = arrotondaSoglia050(fte3h);
      const orePresidiate050 = Math.round(addetti050 * params.oreTurno * 100) / 100;
      const bilancioOre = Math.round((fte3h - addetti050) * params.oreTurno * 100) / 100;

      const capacitaPresidio = Math.round(orePresidiate050 * resaTarget * 10) / 10;
      const prodEffOraria = orePresidiate050 > 0 ? Math.round((colliRound / orePresidiate050) * 100) / 100 : 0.0;
      const prodEffTurno = addetti050 > 0 ? Math.round((colliRound / addetti050) * 10) / 10 : 0.0;
      const saturazionePct = orePresidiate050 > 0 ? Math.round((oreRichieste / orePresidiate050) * 1000) / 10 : 0.0;

      const costoTeorico = Math.round(oreRichieste * params.costoOrario * 100) / 100;
      const costoPresidio050 = Math.round(orePresidiate050 * params.costoOrario * 100) / 100;
      const costoUnitarioTeorico = colliRound > 0 ? Math.round((costoTeorico / colliRound) * 10000) / 10000 : 0.0;
      const costoUnitario050 = colliRound > 0 ? Math.round((costoPresidio050 / colliRound) * 10000) / 10000 : 0.0;

      dfStaff2w.push({
        settimanaNum: wIdx,
        settimanaLabel: wLabel,
        periodoSettimana: rangeWCorr,
        giornoProg14: idx14 + 1,
        dataIso,
        dataStr,
        dataEstesa,
        giornoNum: gNum,
        giornoNome: gNome,
        slotBisettimanale,
        sottoreparto: dept,
        colliL: colliRound,
        resaTargetOraria: resaTarget,
        capacitaTargetTurno: capacitaTurno,
        oreRichieste,
        fteTeorici: fte3h,
        addettiSoglia050: addetti050,
        orePresidiate050,
        bilancioOreMobilita: bilancioOre,
        capacitaColliPresidio: capacitaPresidio,
        prodEffettivaOraria: prodEffOraria,
        prodEffettivaTurno: prodEffTurno,
        saturazionePresidioPct: saturazionePct,
        costoTeoricoEuro: costoTeorico,
        costoPresidio050Euro: costoPresidio050,
        costoUnitarioColloTeorico: costoUnitarioTeorico,
        costoUnitarioCollo050: costoUnitario050
      });
    }
  });

  // 5. Costruzione tabella riassuntiva dei 14 giorni (Tabellone turni e mobilità)
  const riepilogo14gg: DailySummary14[] = [];

  for (let idx14 = 0; idx14 < 14; idx14++) {
    const dayRows = dfStaff2w.filter(r => r.giornoProg14 === idx14 + 1);
    const first = dayRows[0];

    const colliPerDept = {} as Record<Department, number>;
    const ftePerDept = {} as Record<Department, number>;
    const arr050PerDept = {} as Record<Department, number>;
    const oreRicPerDept = {} as Record<Department, number>;
    const costo050PerDept = {} as Record<Department, number>;
    const prodOraPerDept = {} as Record<Department, number>;

    dayRows.forEach(r => {
      colliPerDept[r.sottoreparto] = r.colliL;
      ftePerDept[r.sottoreparto] = r.fteTeorici;
      arr050PerDept[r.sottoreparto] = r.addettiSoglia050;
      oreRicPerDept[r.sottoreparto] = r.oreRichieste;
      costo050PerDept[r.sottoreparto] = r.costoPresidio050Euro;
      prodOraPerDept[r.sottoreparto] = r.prodEffettivaOraria;
    });

    const totaleColliGiorno = Math.round(dayRows.reduce((acc, r) => acc + r.colliL, 0) * 10) / 10;
    const sommaAddettiReparto050 = dayRows.reduce((acc, r) => acc + r.addettiSoglia050, 0);
    const turniTeoriciTotaliFte = Math.round(dayRows.reduce((acc, r) => acc + r.fteTeorici, 0) * 100) / 100;
    const oreTotaliRichieste = Math.round(dayRows.reduce((acc, r) => acc + r.oreRichieste, 0) * 100) / 100;
    const oreCoperteDaArrotondati050 = Math.round(sommaAddettiReparto050 * params.oreTurno * 100) / 100;
    const oreNetteScoperte = Math.max(0, Math.round((oreTotaliRichieste - oreCoperteDaArrotondati050) * 100) / 100);

    // Squadra ottimale reale (chiuso la domenica)
    const squadraOttimaleReale = first.giornoNum === 6 ? 0 : Math.ceil(turniTeoriciTotaliFte);
    const addettiJollyMobilita = squadraOttimaleReale - sommaAddettiReparto050;
    const oreRealiSquadra = Math.round(squadraOttimaleReale * params.oreTurno * 100) / 100;

    const produttivitaMediaSquadra = oreRealiSquadra > 0
      ? Math.round((totaleColliGiorno / oreRealiSquadra) * 100) / 100
      : 0.0;

    const costoLavoroTeoricoEuro = Math.round(oreTotaliRichieste * params.costoOrario * 100) / 100;
    const costoLavoroPresidio050Euro = Math.round(oreCoperteDaArrotondati050 * params.costoOrario * 100) / 100;
    const costoLavoroJollyEuro = Math.round(addettiJollyMobilita * params.oreTurno * params.costoOrario * 100) / 100;
    const costoLavoroSquadraRealeEuro = Math.round(oreRealiSquadra * params.costoOrario * 100) / 100;
    const costoMedioPerColloReale = totaleColliGiorno > 0
      ? Math.round((costoLavoroSquadraRealeEuro / totaleColliGiorno) * 10000) / 10000
      : 0.0;

    riepilogo14gg.push({
      slotBisettimanale: first.slotBisettimanale,
      settimanaNum: first.settimanaNum,
      settimanaLabel: first.settimanaLabel,
      periodoSettimana: first.periodoSettimana,
      dataIso: first.dataIso,
      dataStr: first.dataStr,
      dataEstesa: first.dataEstesa,
      giornoNum: first.giornoNum,
      giornoNome: first.giornoNome,
      colliPerDept,
      ftePerDept,
      arr050PerDept,
      oreRicPerDept,
      costo050PerDept,
      prodOraPerDept,
      totaleColliGiorno,
      sommaAddettiReparto050,
      turniTeoriciTotaliFte,
      oreTotaliRichieste,
      oreCoperteDaArrotondati050,
      oreNetteScoperte,
      squadraOttimaleReale,
      addettiJollyMobilita,
      oreRealiSquadra,
      produttivitaMediaSquadra,
      costoLavoroTeoricoEuro,
      costoLavoroPresidio050Euro,
      costoLavoroJollyEuro,
      costoLavoroSquadraRealeEuro,
      costoMedioPerColloReale
    });
  }

  // 6. Produttività e Costo del Lavoro per Sottoreparto (2 Settimane)
  const dfAttivi = dfStaff2w.filter(r => r.giornoNum < 6);

  const prod2w: DeptProdSummary2W[] = DEPARTMENTS.map(dept => {
    const deptRows = dfAttivi.filter(r => r.sottoreparto === dept);
    const w1Rows = deptRows.filter(r => r.settimanaNum === 1);
    const w2Rows = deptRows.filter(r => r.settimanaNum === 2);

    const colliSett1 = Math.round(w1Rows.reduce((a, b) => a + b.colliL, 0) * 10) / 10;
    const turni050Sett1 = w1Rows.reduce((a, b) => a + b.addettiSoglia050, 0);
    const costo050Sett1Euro = Math.round(w1Rows.reduce((a, b) => a + b.costoPresidio050Euro, 0) * 100) / 100;

    const colliSett2 = Math.round(w2Rows.reduce((a, b) => a + b.colliL, 0) * 10) / 10;
    const turni050Sett2 = w2Rows.reduce((a, b) => a + b.addettiSoglia050, 0);
    const costo050Sett2Euro = Math.round(w2Rows.reduce((a, b) => a + b.costoPresidio050Euro, 0) * 100) / 100;

    const colliBisettimanali = Math.round((colliSett1 + colliSett2) * 10) / 10;
    const mediaColliGiornoLav = Math.round((colliBisettimanali / 12) * 10) / 10;
    const mediaColliSettimana = Math.round((colliBisettimanali / 2) * 10) / 10;

    const oreRichieste2W = Math.round(deptRows.reduce((a, b) => a + b.oreRichieste, 0) * 100) / 100;
    const turniTeorici2W = Math.round(deptRows.reduce((a, b) => a + b.fteTeorici, 0) * 100) / 100;
    const turniPresidio050_2W = deptRows.reduce((a, b) => a + b.addettiSoglia050, 0);
    const orePresidio050_2W = Math.round(turniPresidio050_2W * params.oreTurno * 100) / 100;
    const bilancioOreMobilita2W = Math.round((turniTeorici2W - turniPresidio050_2W) * params.oreTurno * 100) / 100;

    const resaTargetOraria = params.reseOrarie[dept];
    const capacitaColliPresidio2W = Math.round(orePresidio050_2W * resaTargetOraria * 10) / 10;

    const prodEffettivaOraria050 = orePresidio050_2W > 0
      ? Math.round((colliBisettimanali / orePresidio050_2W) * 100) / 100
      : 0.0;
    const prodEffettivaTurno050 = turniPresidio050_2W > 0
      ? Math.round((colliBisettimanali / turniPresidio050_2W) * 10) / 10
      : 0.0;
    const saturazioneMediaPresidioPct = orePresidio050_2W > 0
      ? Math.round((oreRichieste2W / orePresidio050_2W) * 1000) / 10
      : 0.0;

    const costoTeorico2WEuro = Math.round(oreRichieste2W * params.costoOrario * 100) / 100;
    const costoPresidio050_2WEuro = Math.round(orePresidio050_2W * params.costoOrario * 100) / 100;
    const costoPerColloTeoricoEuro = colliBisettimanali > 0
      ? Math.round((costoTeorico2WEuro / colliBisettimanali) * 10000) / 10000
      : 0.0;
    const costoPerColloPresidio050Euro = colliBisettimanali > 0
      ? Math.round((costoPresidio050_2WEuro / colliBisettimanali) * 10000) / 10000
      : 0.0;

    return {
      sottoreparto: dept,
      resaTargetOraria,
      capacitaTargetTurno: resaTargetOraria * params.oreTurno,
      colliSett1,
      turni050Sett1,
      costo050Sett1Euro,
      colliSett2,
      turni050Sett2,
      costo050Sett2Euro,
      colliBisettimanali,
      mediaColliGiornoLav,
      mediaColliSettimana,
      oreRichieste2W,
      turniTeorici2W,
      turniPresidio050_2W,
      orePresidio050_2W,
      bilancioOreMobilita2W,
      capacitaColliPresidio2W,
      prodEffettivaOraria050,
      prodEffettivaTurno050,
      saturazioneMediaPresidioPct,
      costoTeorico2WEuro,
      costoPresidio050_2WEuro,
      costoPerColloTeoricoEuro,
      costoPerColloPresidio050Euro
    };
  });

  // 7. Sintesi Multi-Orizzonte (Settimana 1, 2 Settimane, Mese 30gg, Trimestre 13 Settimane)
  const costoTurno = params.costoOrario * params.oreTurno;
  const sintesiOrizzonti: HorizonItem[] = [];

  DEPARTMENTS.forEach(dept => {
    const ps = prod2w.find(p => p.sottoreparto === dept)!;
    const subD = dfAttivi.filter(r => r.sottoreparto === dept);
    const minD = Math.min(...subD.map(r => r.addettiSoglia050));
    const maxD = Math.max(...subD.map(r => r.addettiSoglia050));
    const dotStr = minD !== maxD ? `${minD} - ${maxD} addetti` : `${minD} addetti`;

    const colli1w = Math.round(ps.colliSett1);
    const turni1w = ps.turni050Sett1;
    const costo1w = ps.costo050Sett1Euro;

    const colli2w = Math.round(ps.colliBisettimanali);
    const teo2w = ps.turniTeorici2W;
    const turni2w = ps.turniPresidio050_2W;
    const costo2w = ps.costoPresidio050_2WEuro;

    const turniM = Math.round(turni2w * (30.0 / 14.0));
    const costoM = Math.round(turniM * costoTurno * 100) / 100;

    const turniT = Math.round(turni2w * (13.0 / 2.0));
    const costoT = Math.round(turniT * costoTurno * 100) / 100;

    sintesiOrizzonti.push({
      label: dept,
      dotazione: dotStr,
      colliW1: colli1w,
      turniW1: turni1w,
      costoW1: costo1w,
      colli2W: colli2w,
      teo2W: teo2w,
      turni2W: turni2w,
      costo2W: costo2w,
      turniMese: turniM,
      costoMese: costoM,
      turniTrim: turniT,
      costoTrim: costoT
    });
  });

  // Riga Jolly Mobilità Interna
  const w1Summary = riepilogo14gg.filter(r => r.settimanaNum === 1);
  const jolly1w = w1Summary.reduce((a, b) => a + b.addettiJollyMobilita, 0);
  const costoJW1 = Math.round(jolly1w * costoTurno * 100) / 100;

  const jolly2w = riepilogo14gg.reduce((a, b) => a + b.addettiJollyMobilita, 0);
  const oreNetteScoperte2W = riepilogo14gg.reduce((a, b) => a + b.oreNetteScoperte, 0);
  const teoRes2w = Math.round((oreNetteScoperte2W / params.oreTurno) * 100) / 100;
  const costoJW2 = Math.round(jolly2w * costoTurno * 100) / 100;

  const jollyM = Math.round(jolly2w * (30.0 / 14.0));
  const costoJM = Math.round(jollyM * costoTurno * 100) / 100;
  const jollyT = Math.round(jolly2w * (13.0 / 2.0));
  const costoJT = Math.round(jollyT * costoTurno * 100) / 100;

  sintesiOrizzonti.push({
    label: 'Integrazione Jolly Mobilità Interna (Resti < 0,50)',
    dotazione: '1 - 2 Jolly/giorno',
    colliW1: '-',
    turniW1: jolly1w,
    costoW1: costoJW1,
    colli2W: '-',
    teo2W: teoRes2w,
    turni2W: jolly2w,
    costo2W: costoJW2,
    turniMese: jollyM,
    costoMese: costoJM,
    turniTrim: jollyT,
    costoTrim: costoJT,
    isJolly: true
  });

  // Totale Squadra Ottimale
  const colliTot1w = Math.round(w1Summary.reduce((a, b) => a + b.totaleColliGiorno, 0));
  const turniTot1w = w1Summary.reduce((a, b) => a + b.squadraOttimaleReale, 0);
  const costoTot1w = Math.round(turniTot1w * costoTurno * 100) / 100;

  const colliTot2w = Math.round(riepilogo14gg.reduce((a, b) => a + b.totaleColliGiorno, 0));
  const teoTot2w = Math.round(riepilogo14gg.reduce((a, b) => a + b.turniTeoriciTotaliFte, 0) * 100) / 100;
  const turniTot2w = riepilogo14gg.reduce((a, b) => a + b.squadraOttimaleReale, 0);
  const costoTot2w = Math.round(turniTot2w * costoTurno * 100) / 100;

  const turniTotM = Math.round(turniTot2w * (30.0 / 14.0));
  const costoTotM = Math.round(turniTotM * costoTurno * 100) / 100;
  const turniTotT = Math.round(turniTot2w * (13.0 / 2.0));
  const costoTotT = Math.round(turniTotT * costoTurno * 100) / 100;

  sintesiOrizzonti.push({
    label: 'TOTALE SQUADRA OTTIMALE',
    dotazione: '12 (Lun-Gio) / 11 (Ven-Sab)',
    colliW1: colliTot1w,
    turniW1: turniTot1w,
    costoW1: costoTot1w,
    colli2W: colliTot2w,
    teo2W: teoTot2w,
    turni2W: turniTot2w,
    costo2W: costoTot2w,
    turniMese: turniTotM,
    costoMese: costoTotM,
    turniTrim: turniTotT,
    costoTrim: costoTotT,
    isTotal: true
  });

  // 8. KPI Globali
  const totOreReali2w = Math.round(riepilogo14gg.reduce((a, b) => a + b.oreRealiSquadra, 0) * 100) / 100;
  const totCostoReale2w = Math.round(riepilogo14gg.reduce((a, b) => a + b.costoLavoroSquadraRealeEuro, 0) * 100) / 100;
  const totCostoTeo2w = Math.round(riepilogo14gg.reduce((a, b) => a + b.costoLavoroTeoricoEuro, 0) * 100) / 100;
  const prodMediaSquadra = totOreReali2w > 0 ? Math.round((colliTot2w / totOreReali2w) * 100) / 100 : 0.0;
  const costoPerCollo = colliTot2w > 0 ? Math.round((totCostoReale2w / colliTot2w) * 10000) / 10000 : 0.0;

  // Calcolo delta What-If rispetto al baseline neutro
  let deltaColli2w = 0;
  let deltaTurni2w = 0;
  let deltaCosto2w = 0;

  if (!isBaseline && (isPromoCoop || fattoreStag !== 100)) {
    try {
      const baseResult = runUnifiedForecastPipeline(records, {
        ...params,
        whatIf: {
          promoCoopAttiva: false,
          promoCoopPercentuale: 0,
          fattoreStagionalita: 100,
          stagionePreset: 'NEUTRA'
        }
      }, true);
      deltaColli2w = colliTot2w - baseResult.kpi.totColli2w;
      deltaTurni2w = turniTot2w - baseResult.kpi.totTurniReali2w;
      deltaCosto2w = Math.round((totCostoReale2w - baseResult.kpi.totCostoReale2w) * 100) / 100;
    } catch {
      // fallback
    }
  }

  return {
    dfStaff2w,
    riepilogo14gg,
    prod2w,
    sintesiOrizzonti,
    rangeStoricoStr,
    rangeW1Str,
    rangeW2Str,
    range2WStr,
    dataInizioPiano: formatDataStr(dataInizioPiano),
    dataFinePiano: formatDataStr(fineW2),
    whatIfStats: {
      totalRecords,
      coopRecords,
      coopPct,
      deltaColli2w,
      deltaTurni2w,
      deltaCosto2w
    },
    kpi: {
      totColli2w: colliTot2w,
      avgColliGiornoLav: Math.round(colliTot2w / 12),
      totTurniReali2w: turniTot2w,
      totOreReali2w: totOreReali2w,
      totFteTeo2w: teoTot2w,
      totCostoReale2w: totCostoReale2w,
      totCostoTeo2w: totCostoTeo2w,
      prodMediaSquadra,
      costoPerCollo
    }
  };
}

/**
 * Parser per file Excel caricati dall'utente (`.xlsx`).
 * Supporta la struttura esatta attesa da `modello_grocery_costi_produttivita_v3.py`
 * (Colonna B = Data Allestimento, Col K = Colli Ordinati, Col L = Colli Effettivi).
 */
export function parseUploadedExcel(buffer: ArrayBuffer): HistoricalRecord[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  
  // Cerca preferibilmente il foglio "Distinta Tutti gli Ordini" come indicato nel modello v3
  let sheetName = wb.SheetNames[0];
  const targetSheet = wb.SheetNames.find(s => {
    const clean = s.trim().toLowerCase();
    return clean.includes('distinta') || clean.includes('tutti') || clean.includes('ordini');
  });
  if (targetSheet) {
    sheetName = targetSheet;
  }

  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error('Il file Excel non contiene fogli validi.');

  // Leggi come array di righe non elaborate per preservare date e stringhe
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false });
  if (rows.length < 2) {
    throw new Error('Il file Excel non contiene abbastanza dati.');
  }

  // Rileva la riga di intestazione (tra le prime 5 righe)
  let headerRowIdx = 0;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const row = rows[i] as unknown[];
    if (!row) continue;
    const hasData = row.some(cell => {
      const s = String(cell || '').toLowerCase();
      return s.includes('data') || s.includes('colli') || s.includes('reparto') || s.includes('ordine') || s.includes('descrizione');
    });
    if (hasData) {
      headerRowIdx = i;
      break;
    }
  }

  const headerRow = (rows[headerRowIdx] || []) as string[];

  // Posizionali di default da modello v3 Python:
  // Colonna B (idx 1) = Data Allestimento
  // Colonna J (idx 9) = Descrizione Articolo (per filtro Promo COOP)
  // Colonna K (idx 10) = Colli Ordinati
  // Colonna L (idx 11) = Colli Allestimento Effettivi
  let colBIdx = 1;
  let colJDescIdx = 9;
  let colKIdx = 10;
  let colLIdx = 11;
  let colDeptIdx = -1;
  let colCatIdx = -1;
  let colDestIdx = -1;

  headerRow.forEach((colName, idx) => {
    if (!colName) return;
    const name = String(colName).trim().toLowerCase();

    // Data Allestimento
    if (name.includes('data allestiment') || (name.includes('data') && !name.includes('scadenza') && !name.includes('inseriment'))) {
      colBIdx = idx;
    }
    // Descrizione Articolo (Colonna J)
    if (
      name.includes('descrizione') ||
      name.includes('articolo') ||
      name.includes('prodotto') ||
      name.includes('referenza')
    ) {
      colJDescIdx = idx;
    }
    // Colli Ordinati
    if (name.includes('colli ordinat') || name === 'ordinati' || name.includes('qta ordinat')) {
      colKIdx = idx;
    }
    // Colli Allestimento Effettivi (Target primario)
    if (
      name.includes('colli allestimento effettiv') ||
      name.includes('colli effettiv') ||
      name.includes('colli allestit') ||
      name.includes('colli allestiti') ||
      name.includes('qta effettiv') ||
      name.includes('colonna l') ||
      name === 'colli l'
    ) {
      colLIdx = idx;
    }
    // Sottoreparto
    if (name.includes('sottoreparto') || name.includes('reparto') || name.includes('dept')) {
      colDeptIdx = idx;
    }
    // Categoria
    if (name.includes('codice categoria') || name.includes('categoria')) {
      colCatIdx = idx;
    }
    // Destinazione
    if (name.includes('destinazione')) {
      colDestIdx = idx;
    }
  });

  const records: HistoricalRecord[] = [];

  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawDate = row[colBIdx];
    const parsedDate = parseDate(rawDate);
    if (!parsedDate) continue;

    // Filtra righe escluse se colonna Destinazione presente
    const rawDest = colDestIdx !== -1 ? String(row[colDestIdx] || '') : '';
    if (rawDest.includes("Eliminata dall'Ordine") || rawDest.includes('(Esclusa)')) {
      continue;
    }

    // Risoluzione Sottoreparto
    let dept: Department | null = null;
    if (colDeptIdx !== -1 && row[colDeptIdx]) {
      dept = normalizeDept(row[colDeptIdx]);
    }
    // Se non trovato, ispeziona le altre celle della riga per trovare il nome reparto
    if (!dept) {
      for (let c = 0; c < Math.min(row.length, 10); c++) {
        if (c !== colBIdx && c !== colKIdx && c !== colLIdx && c !== colJDescIdx) {
          const detected = normalizeDept(row[c]);
          if (detected) {
            dept = detected;
            break;
          }
        }
      }
    }
    // Fallback ciclico solo se del tutto assente
    if (!dept) {
      dept = DEPARTMENTS[r % 5];
    }

    // Lettura Descrizione Articolo in Colonna J e rilevamento parola "COOP"
    const rawDesc = colJDescIdx !== -1 && row[colJDescIdx] !== undefined
      ? String(row[colJDescIdx]).trim()
      : (row[9] !== undefined ? String(row[9]).trim() : '');

    // Verifica presenza della parola "COOP" (case-insensitive, es. "COOP", "PROD. COOP", etc.)
    const isCoop = /\bcoop\b/i.test(rawDesc) || rawDesc.toUpperCase().includes('COOP');

    // Parsing numerico robusto
    const rawOrdered = row[colKIdx];
    const rawEffective = row[colLIdx];

    const ordered = parseItalianNumber(rawOrdered);
    let effective = parseItalianNumber(rawEffective);

    // Se la colonna effettiva è vuota ma ci sono colli ordinati, usa gli ordinati
    if (effective === 0 && ordered > 0 && (rawEffective === undefined || rawEffective === '' || rawEffective === null)) {
      effective = ordered;
    }

    const dow = (parsedDate.getDay() + 6) % 7;
    const gNome = GIORNI_ITA[dow];

    records.push({
      data: parsedDate.toISOString().split('T')[0],
      giornoNum: dow,
      giornoNome: gNome,
      sottoreparto: dept,
      descrizione: rawDesc,
      isCoop,
      colliOrdinati: Math.round(ordered),
      colliEffettiviBase: Math.round(effective),
      colliEffettivi: Math.round(effective),
      taglio: effective < ordered ? 1 : 0,
      categoria: colCatIdx !== -1 ? String(row[colCatIdx] || '') : undefined,
      destinazione: rawDest
    });
  }

  if (records.length === 0) {
    throw new Error('Nessuna riga valida estratta dal file Excel.');
  }

  return records;
}

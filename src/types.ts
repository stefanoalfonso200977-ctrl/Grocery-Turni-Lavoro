export type Department = 'ALIMENTARI' | 'CHIMICA' | 'LIQUIDI' | 'PETFOOD' | 'PROFUMERIA';

export const DEPARTMENTS: Department[] = ['ALIMENTARI', 'CHIMICA', 'LIQUIDI', 'PETFOOD', 'PROFUMERIA'];

export interface WhatIfSimulation {
  promoCoopAttiva: boolean;
  promoCoopPercentuale: number; // e.g. 20 (+20%)
  fattoreStagionalita: number;  // e.g. 100 = 100% (neutro), 115 = +15%
  stagionePreset: 'NEUTRA' | 'ALTA_STAGIONE' | 'FESTIVITA' | 'ESTATE' | 'BASSA_STAGIONE' | 'PERSONALIZZATA';
}

export interface OperationalParams {
  costoOrario: number;     // e.g. 12.80 €/h
  oreTurno: number;        // e.g. 3.0 h
  reseOrarie: Record<Department, number>; // c/h
  whatIf: WhatIfSimulation;
}

export interface DayForecastStaff {
  settimanaNum: 1 | 2;
  settimanaLabel: string;
  periodoSettimana: string;
  giornoProg14: number; // 1 to 14
  dataIso: string;
  dataStr: string;      // DD/MM/YYYY
  dataEstesa: string;   // Lunedì 19 Ottobre 2026
  giornoNum: number;    // 0 = Lun, 6 = Dom
  giornoNome: string;   // Lunedì, Martedì, etc.
  slotBisettimanale: string; // "S1 - Lun 19/10/2026"
  sottoreparto: Department;
  colliL: number;
  resaTargetOraria: number;
  capacitaTargetTurno: number;
  oreRichieste: number;
  fteTeorici: number;
  addettiSoglia050: number;
  orePresidiate050: number;
  bilancioOreMobilita: number;
  capacitaColliPresidio: number;
  prodEffettivaOraria: number;
  prodEffettivaTurno: number;
  saturazionePresidioPct: number;
  costoTeoricoEuro: number;
  costoPresidio050Euro: number;
  costoUnitarioColloTeorico: number;
  costoUnitarioCollo050: number;
}

export interface DailySummary14 {
  slotBisettimanale: string;
  settimanaNum: 1 | 2;
  settimanaLabel: string;
  periodoSettimana: string;
  dataIso: string;
  dataStr: string;
  dataEstesa: string;
  giornoNum: number;
  giornoNome: string;
  colliPerDept: Record<Department, number>;
  ftePerDept: Record<Department, number>;
  arr050PerDept: Record<Department, number>;
  oreRicPerDept: Record<Department, number>;
  costo050PerDept: Record<Department, number>;
  prodOraPerDept: Record<Department, number>;
  totaleColliGiorno: number;
  sommaAddettiReparto050: number;
  turniTeoriciTotaliFte: number;
  oreTotaliRichieste: number;
  oreCoperteDaArrotondati050: number;
  oreNetteScoperte: number;
  squadraOttimaleReale: number;
  addettiJollyMobilita: number;
  oreRealiSquadra: number;
  produttivitaMediaSquadra: number;
  costoLavoroTeoricoEuro: number;
  costoLavoroPresidio050Euro: number;
  costoLavoroJollyEuro: number;
  costoLavoroSquadraRealeEuro: number;
  costoMedioPerColloReale: number;
}

export interface DeptProdSummary2W {
  sottoreparto: Department;
  resaTargetOraria: number;
  capacitaTargetTurno: number;
  colliSett1: number;
  turni050Sett1: number;
  costo050Sett1Euro: number;
  colliSett2: number;
  turni050Sett2: number;
  costo050Sett2Euro: number;
  colliBisettimanali: number;
  mediaColliGiornoLav: number;
  mediaColliSettimana: number;
  oreRichieste2W: number;
  turniTeorici2W: number;
  turniPresidio050_2W: number;
  orePresidio050_2W: number;
  bilancioOreMobilita2W: number;
  capacitaColliPresidio2W: number;
  prodEffettivaOraria050: number;
  prodEffettivaTurno050: number;
  saturazioneMediaPresidioPct: number;
  costoTeorico2WEuro: number;
  costoPresidio050_2WEuro: number;
  costoPerColloTeoricoEuro: number;
  costoPerColloPresidio050Euro: number;
}

export interface HorizonItem {
  label: string;
  dotazione: string;
  colliW1: number | string;
  turniW1: number;
  costoW1: number;
  colli2W: number | string;
  teo2W: number | string;
  turni2W: number;
  costo2W: number;
  turniMese: number;
  costoMese: number;
  turniTrim: number;
  costoTrim: number;
  isJolly?: boolean;
  isTotal?: boolean;
}

export interface PredictionResult {
  dfStaff2w: DayForecastStaff[];
  riepilogo14gg: DailySummary14[];
  prod2w: DeptProdSummary2W[];
  sintesiOrizzonti: HorizonItem[];
  rangeStoricoStr: string;
  rangeW1Str: string;
  rangeW2Str: string;
  range2WStr: string;
  dataInizioPiano: string;
  dataFinePiano: string;
  whatIfStats?: {
    totalRecords: number;
    coopRecords: number;
    coopPct: number;
    deltaColli2w: number;
    deltaTurni2w: number;
    deltaCosto2w: number;
  };
  kpi: {
    totColli2w: number;
    avgColliGiornoLav: number;
    totTurniReali2w: number;
    totOreReali2w: number;
    totFteTeo2w: number;
    totCostoReale2w: number;
    totCostoTeo2w: number;
    prodMediaSquadra: number;
    costoPerCollo: number;
  };
}

export interface HistoricalRecord {
  data: string;
  giornoNum: number;
  giornoNome: string;
  sottoreparto: Department;
  descrizione?: string;
  isCoop: boolean;
  colliOrdinati: number;
  colliEffettiviBase: number;
  colliEffettivi: number;
  taglio: number;
  categoria?: string;
  tipoCarico?: string;
  piattaforma?: string;
  destinazione?: string;
}

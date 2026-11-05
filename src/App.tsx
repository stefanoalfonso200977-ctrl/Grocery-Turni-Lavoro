import React, { useState, useEffect, useMemo } from 'react';
import {
  OperationalParams,
  HistoricalRecord,
  PredictionResult,
  DEPARTMENTS
} from './types';
import {
  runUnifiedForecastPipeline,
  parseUploadedExcel
} from './utils/engine';
import {
  saveLastUploadedFile,
  loadLastUploadedFile,
  clearLastUploadedFile
} from './utils/storage';
import { exportFullExcelReport } from './utils/excelExporter';
import { Sidebar } from './components/Sidebar';
import { KpiCards } from './components/KpiCards';
import { Tab1TurniCosti } from './components/Tab1TurniCosti';
import { Tab2Produttivita } from './components/Tab2Produttivita';
import { Tab3PrevisioneColli } from './components/Tab3PrevisioneColli';
import { Tab4EsplosoDettaglio } from './components/Tab4EsplosoDettaglio';
import { Tab5SintesiOrizzonti } from './components/Tab5SintesiOrizzonti';
import {
  Calendar,
  FileSpreadsheet,
  Cpu,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const INITIAL_PARAMS: OperationalParams = {
  costoOrario: 12.80,
  oreTurno: 3.0,
  reseOrarie: {
    ALIMENTARI: 40.0,
    CHIMICA: 45.0,
    LIQUIDI: 35.0,
    PETFOOD: 40.0,
    PROFUMERIA: 30.0
  },
  whatIf: {
    promoCoopAttiva: false,
    promoCoopPercentuale: 20,
    fattoreStagionalita: 100,
    stagionePreset: 'NEUTRA'
  }
};

export const App: React.FC = () => {
  const [params, setParams] = useState<OperationalParams>(INITIAL_PARAMS);
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carica automaticamente l'ultimo file caricato dalla memoria persistente all'avvio
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await loadLastUploadedFile();
        if (mounted && stored && stored.records && stored.records.length > 0) {
          setRecords(stored.records);
          setFileName(stored.fileName);
        }
      } catch (err) {
        console.warn('Nessun file salvato in memoria o errore lettura:', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Calcolo pipeline previsionale reattivo a parametri o dati storici
  const result: PredictionResult | null = useMemo(() => {
    if (records.length === 0) return null;
    try {
      return runUnifiedForecastPipeline(records, params);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Errore durante il calcolo previsionale');
      return null;
    }
  }, [records, params]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const buffer = await file.arrayBuffer();
      const extractedRecords = parseUploadedExcel(buffer);
      setRecords(extractedRecords);
      setFileName(file.name);
      // Salva in memoria persistente (IndexedDB)
      await saveLastUploadedFile(file.name, extractedRecords);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Errore nel caricamento del file Excel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = async () => {
    try {
      await clearLastUploadedFile();
      setRecords([]);
      setFileName(null);
      setErrorMsg(null);
    } catch (err) {
      console.error('Errore durante la cancellazione del file:', err);
    }
  };

  const handleDownloadExcel = () => {
    if (!result) return;
    exportFullExcelReport(result, params, fileName || undefined);
  };

  const handleExportMLJson = () => {
    if (!result) return;
    const bundle = {
      timestamp: new Date().toISOString(),
      parametriOperativi: params,
      rangeStorico: result.rangeStoricoStr,
      rangePrevisione2w: result.range2WStr,
      kpi: result.kpi,
      totaleColli: result.kpi.totColli2w,
      totaleTurniReali: result.kpi.totTurniReali2w,
      budgetEuro: result.kpi.totCostoReale2w,
      produttivitaMediaSquadra: result.kpi.prodMediaSquadra
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modello_grocery_parametri_${result.range2WStr.replace(/\s+/g, '_').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      {/* Sidebar Parametri & Caricamento */}
      <Sidebar
        params={params}
        onParamsChange={setParams}
        onFileUpload={handleFileUpload}
        onClearFile={handleClearFile}
        fileName={fileName}
        recordsCount={records.length}
        isLoading={isLoading}
        whatIfStats={result?.whatIfStats}
      />

      {/* Area Principale */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Intestazione Principale */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  Sistema Previsionale Bisettimanale Colli, Turni e Costo del Lavoro
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                <strong>Modello Gradient Boosting a 2 Stadi</strong> | Pianificazione Rilascio Turni su{' '}
                <strong className="text-slate-700">2 Settimane Consecutive (14 gg)</strong> con aggiornamento automatico delle date.
              </p>
            </div>

            {/* Pulsanti Esportazione */}
            {result && (
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleDownloadExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  title="Scarica il file Excel completo con i 5 fogli di calcolo formattati"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Scarica Excel (5 Fogli)</span>
                </button>
                <button
                  onClick={handleExportMLJson}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  title="Esporta parametri e metriche in formato JSON"
                >
                  <Cpu className="w-4 h-4 text-purple-300" />
                  <span>Esporta Modello</span>
                </button>
              </div>
            )}
          </div>

          {/* Banner Storico e Range Previsionale */}
          {result && (
            <div className="mt-3 space-y-2">
              <div className="py-2 px-3 bg-emerald-50/80 border border-emerald-200/90 rounded-lg text-xs flex flex-wrap items-center gap-y-1 gap-x-4 text-emerald-950">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Storico Rilevato: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{result.rangeStoricoStr}</strong>
                </span>
                <span className="text-emerald-300">|</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Settimana 1: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{result.rangeW1Str}</strong>
                </span>
                <span className="text-emerald-300">|</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Settimana 2: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{result.rangeW2Str}</strong>
                </span>
                <span className="text-emerald-300">|</span>
                <span className="text-slate-600 font-medium">
                  Righe elaborate: <strong className="text-slate-900">{records.length.toLocaleString('it-IT')}</strong>
                </span>
              </div>

              {/* Banner Simulatore What-If se Attivo */}
              {(params.whatIf.promoCoopAttiva || params.whatIf.fattoreStagionalita !== 100) && result.whatIfStats && (
                <div className="py-2 px-3 bg-amber-50 border border-amber-300/80 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2 text-amber-950 font-medium">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold flex items-center gap-1 text-amber-900">
                      🎯 Simulazione What-If Attiva:
                    </span>
                    {params.whatIf.promoCoopAttiva && (
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold text-[11px] border border-red-200">
                        Promo COOP (+{params.whatIf.promoCoopPercentuale}%) su {result.whatIfStats.coopRecords.toLocaleString('it-IT')} referenze ({result.whatIfStats.coopPct}%)
                      </span>
                    )}
                    {params.whatIf.fattoreStagionalita !== 100 && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold text-[11px] border border-blue-200">
                        Stagionalità: {params.whatIf.fattoreStagionalita}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>
                      Impatto Colli: <strong className={result.whatIfStats.deltaColli2w >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {result.whatIfStats.deltaColli2w >= 0 ? `+${result.whatIfStats.deltaColli2w.toLocaleString('it-IT')}` : result.whatIfStats.deltaColli2w.toLocaleString('it-IT')} colli
                      </strong>
                    </span>
                    <span>
                      Turni: <strong className={result.whatIfStats.deltaTurni2w >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {result.whatIfStats.deltaTurni2w >= 0 ? `+${result.whatIfStats.deltaTurni2w}` : result.whatIfStats.deltaTurni2w}
                      </strong>
                    </span>
                    <span>
                      Budget: <strong className="text-slate-900 font-bold">
                        {result.whatIfStats.deltaCosto2w >= 0 ? `+€ ${result.whatIfStats.deltaCosto2w.toFixed(2)}` : `-€ ${Math.abs(result.whatIfStats.deltaCosto2w).toFixed(2)}`}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </header>

        {/* Contenuto Pagina */}
        <div className="p-6 space-y-6">
          {result ? (
            <>
              {/* KPI Cards */}
              <KpiCards kpi={result.kpi} />

              {/* Barra di Navigazione Tab */}
              <div className="border-b border-slate-200">
                <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto text-xs font-medium">
                  {[
                    { id: 1, label: '📅 1. Turni & Costi 14 Giorni' },
                    { id: 2, label: '📊 2. Produttività & Costi per Sottoreparto' },
                    { id: 3, label: '📦 3. Previsione Colli (Colonna L)' },
                    { id: 4, label: '🔍 4. Esploso Giornaliero Sottoreparti' },
                    { id: 5, label: '📈 5. Sintesi Multi-Orizzonte (Mese / Trimestre)' }
                  ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                          isActive
                            ? 'border-blue-600 text-blue-700 font-bold bg-white/70 rounded-t-lg'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Vista Tab Attivo */}
              <div className="mt-4">
                {activeTab === 1 && <Tab1TurniCosti result={result} />}
                {activeTab === 2 && <Tab2Produttivita result={result} />}
                {activeTab === 3 && <Tab3PrevisioneColli result={result} />}
                {activeTab === 4 && <Tab4EsplosoDettaglio result={result} />}
                {activeTab === 5 && <Tab5SintesiOrizzonti result={result} />}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                📂
              </div>
              <h3 className="text-base font-bold text-slate-800">Nessun file Excel caricato</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                Carica un file Excel delle distinte ordini (<code>.xlsx</code>) dal riquadro nella barra laterale sinistra per generare automaticamente il calendario delle 2 settimane successive, i turni e il report dei costi.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

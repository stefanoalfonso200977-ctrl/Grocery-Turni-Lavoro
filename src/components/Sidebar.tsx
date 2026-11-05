import React, { useRef } from 'react';
import { OperationalParams, DEPARTMENTS, Department, WhatIfSimulation } from '../types';
import {
  Sliders,
  DollarSign,
  Clock,
  Package,
  Upload,
  CheckCircle2,
  Trash2,
  HardDrive,
  TrendingUp,
  Tag,
  SunMedium
} from 'lucide-react';

interface SidebarProps {
  params: OperationalParams;
  onParamsChange: (newParams: OperationalParams) => void;
  onFileUpload: (file: File) => void;
  onClearFile?: () => void;
  fileName: string | null;
  recordsCount: number;
  isLoading: boolean;
  whatIfStats?: {
    totalRecords: number;
    coopRecords: number;
    coopPct: number;
    deltaColli2w: number;
    deltaTurni2w: number;
    deltaCosto2w: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  params,
  onParamsChange,
  onFileUpload,
  onClearFile,
  fileName,
  recordsCount,
  isLoading,
  whatIfStats
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCostoChange = (val: number) => {
    onParamsChange({ ...params, costoOrario: Math.max(8, Math.min(30, val)) });
  };

  const handleOreChange = (val: number) => {
    onParamsChange({ ...params, oreTurno: Math.max(1, Math.min(8, val)) });
  };

  const handleWhatIfChange = (updates: Partial<WhatIfSimulation>) => {
    onParamsChange({
      ...params,
      whatIf: {
        ...params.whatIf,
        ...updates
      }
    });
  };

  const handleResaChange = (dept: Department, val: number) => {
    onParamsChange({
      ...params,
      reseOrarie: {
        ...params.reseOrarie,
        [dept]: Math.max(10, Math.min(100, val))
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="w-84 xl:w-88 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen text-slate-800">
      {/* Intestazione Sidebar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            🛒
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Grocery AI Planning</h2>
            <p className="text-xs text-slate-500">Turni, Colli & Costo Lavoro</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6 text-sm">
        {/* Caricamento File Excel */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            📂 Distinta Ordini Excel
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/30 group"
          >
            <Upload className="w-6 h-6 mx-auto mb-1.5 text-slate-400 group-hover:text-blue-600 transition" />
            <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
              Carica file Excel (.xlsx)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Colonne B (Data) e L (Colli Effettivi)
            </p>
          </div>

          {fileName ? (
            <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5 text-xs text-emerald-900">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-semibold">{fileName}</span>
                </div>
                {onClearFile && (
                  <button
                    onClick={onClearFile}
                    title="Rimuovi file dalla memoria"
                    className="p-1 hover:bg-emerald-100 rounded text-emerald-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-700">
                <span className="flex items-center gap-1 font-medium">
                  <HardDrive className="w-3 h-3 text-emerald-600" />
                  In memoria persistente
                </span>
                <span className="font-bold">{recordsCount.toLocaleString('it-IT')} righe</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* SIMULATORE WHAT-IF: PROMO COOP & STAGIONALITÀ */}
        <div className="p-3 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-xl border border-amber-300/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-950 whitespace-nowrap shrink-0">
              <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Simulatore What-If</span>
            </div>
            <span className="text-[10px] font-semibold bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300 whitespace-nowrap shrink-0">
              Promo &amp; Stagioni
            </span>
          </div>

          {/* Barra Flag: Promo Prodotto COOP */}
          <div className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  Promo Prodotto COOP
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Filtro Colonna J (parola &quot;COOP&quot;)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={params.whatIf.promoCoopAttiva}
                  onChange={e => handleWhatIfChange({ promoCoopAttiva: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {whatIfStats && whatIfStats.totalRecords > 0 && (
              <div className="py-1 px-1.5 bg-red-50/70 border border-red-100 rounded text-[11px] text-red-800 flex items-center justify-between font-medium">
                <span>Referenze COOP rilevate:</span>
                <span className="font-bold">{whatIfStats.coopRecords.toLocaleString('it-IT')} ({whatIfStats.coopPct}%)</span>
              </div>
            )}

            {/* Slider % Aumento Prodotti COOP */}
            <div className={params.whatIf.promoCoopAttiva ? 'space-y-1 pt-1 border-t border-slate-100' : 'opacity-40 pointer-events-none space-y-1 pt-1 border-t border-slate-100'}>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700 font-medium text-[11px]">Aumento Colli Effettivi COOP:</span>
                <span className="font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                  +{params.whatIf.promoCoopPercentuale}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={params.whatIf.promoCoopPercentuale}
                onChange={e => handleWhatIfChange({ promoCoopPercentuale: parseInt(e.target.value, 10) || 0 })}
                className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>+5%</span>
                <span>+20%</span>
                <span>+50%</span>
                <span>+100%</span>
              </div>
            </div>
          </div>

          {/* Modulo Stagionalità */}
          <div className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                Fattore Stagionalità
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {params.whatIf.fattoreStagionalita}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => handleWhatIfChange({ fattoreStagionalita: 100, stagionePreset: 'NEUTRA' })}
                className={`px-1.5 py-1 rounded text-center font-medium border transition cursor-pointer ${
                  params.whatIf.fattoreStagionalita === 100 ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Neutro (100%)
              </button>
              <button
                type="button"
                onClick={() => handleWhatIfChange({ fattoreStagionalita: 115, stagionePreset: 'ALTA_STAGIONE' })}
                className={`px-1.5 py-1 rounded text-center font-medium border transition cursor-pointer ${
                  params.whatIf.fattoreStagionalita === 115 ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Alta Stag. (+15%)
              </button>
              <button
                type="button"
                onClick={() => handleWhatIfChange({ fattoreStagionalita: 125, stagionePreset: 'FESTIVITA' })}
                className={`px-1.5 py-1 rounded text-center font-medium border transition cursor-pointer ${
                  params.whatIf.fattoreStagionalita === 125 ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Festività (+25%)
              </button>
              <button
                type="button"
                onClick={() => handleWhatIfChange({ fattoreStagionalita: 90, stagionePreset: 'BASSA_STAGIONE' })}
                className={`px-1.5 py-1 rounded text-center font-medium border transition cursor-pointer ${
                  params.whatIf.fattoreStagionalita === 90 ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Bassa Stag. (-10%)
              </button>
            </div>

            <input
              type="range"
              min="70"
              max="150"
              step="5"
              value={params.whatIf.fattoreStagionalita}
              onChange={e => handleWhatIfChange({ fattoreStagionalita: parseInt(e.target.value, 10) || 100, stagionePreset: 'PERSONALIZZATA' })}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Parametri Operativi */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Parametri Operativi & Costi</span>
          </div>

          <div className="space-y-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  Costo Orario 4° Livello
                </label>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  € {params.costoOrario.toFixed(2)} /h
                </span>
              </div>
              <input
                type="number"
                min="8.0"
                max="30.0"
                step="0.10"
                value={params.costoOrario}
                onChange={e => handleCostoChange(parseFloat(e.target.value) || 12.8)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Default CCNL Commercio: € 12,80/h</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Durata Turno Allestitori
                </label>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  {params.oreTurno.toFixed(1)} ore
                </span>
              </div>
              <input
                type="number"
                min="1.0"
                max="8.0"
                step="0.5"
                value={params.oreTurno}
                onChange={e => handleOreChange(parseFloat(e.target.value) || 3.0)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Costo Turno Unitario:</span>
                <span className="font-semibold text-slate-800">
                  € {(params.costoOrario * params.oreTurno).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rese Orarie Target per Sottoreparto */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Rese Target (Colli / Ora)</span>
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            {DEPARTMENTS.map(dept => {
              const val = params.reseOrarie[dept];
              const capTurno = val * params.oreTurno;
              return (
                <div key={dept} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-700 block truncate">{dept}</span>
                    <span className="text-[10px] text-slate-400 block">Cap: {capTurno.toFixed(0)} c/turno</span>
                  </div>
                  <div className="flex items-center gap-1 w-24">
                    <input
                      type="number"
                      min="15"
                      max="90"
                      step="1"
                      value={val}
                      onChange={e => handleResaChange(dept, parseFloat(e.target.value) || 40)}
                      className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded text-right font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 shrink-0">c/h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box Regola 0,50 */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
          <div className="font-semibold flex items-center gap-1 text-blue-800">
            <span>ℹ️ Regola Soglia 0,50</span>
          </div>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            - Decimale &lt; 0,50 → Arrotondamento per <strong>DIFETTO</strong> (floor)<br />
            - Decimale ≥ 0,50 → Arrotondamento per <strong>ECCESSO</strong> (ceil)<br />
            I resti &lt; 0,50 sono coperti dai <strong>Jolly Mobilità</strong>.
          </p>
        </div>
      </div>
    </aside>
  );
};

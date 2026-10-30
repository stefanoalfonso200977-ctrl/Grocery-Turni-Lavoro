import React from 'react';
import { Package, Users, Euro, Zap } from 'lucide-react';
import { PredictionResult } from '../types';

interface KpiCardsProps {
  kpi: PredictionResult['kpi'];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpi }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Colli Previsti */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Colli Previsti (2 Sett.)
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          {kpi.totColli2w.toLocaleString('it-IT')} <span className="text-sm font-normal text-slate-500">colli</span>
        </div>
        <div className="mt-1 text-xs text-slate-500 font-medium">
          Media: <span className="font-semibold text-slate-700">{kpi.avgColliGiornoLav.toLocaleString('it-IT')}</span> colli/gg lav. (12 gg)
        </div>
      </div>

      {/* Turni Rilasciati */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Turni Rilasciati (14 gg)
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          {kpi.totTurniReali2w} <span className="text-sm font-normal text-slate-500">turni</span>
          <span className="text-xs font-normal text-slate-400 ml-1.5">({kpi.totOreReali2w.toFixed(0)} h)</span>
        </div>
        <div className="mt-1 text-xs text-slate-500 font-medium">
          FTE Teorici: <span className="font-semibold text-slate-700">{kpi.totFteTeo2w.toFixed(2)}</span> FTE
        </div>
      </div>

      {/* Budget Costo Lavoro */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Budget Costo Lavoro (2 Sett.)
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Euro className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          € {kpi.totCostoReale2w.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-1 text-xs text-slate-500 font-medium">
          Teorico: <span className="font-semibold text-slate-700">€ {kpi.totCostoTeo2w.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Produttività Media Squadra */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Produttività Media Squadra
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-slate-900">
          {kpi.prodMediaSquadra.toFixed(2)} <span className="text-sm font-normal text-slate-500">colli/h</span>
        </div>
        <div className="mt-1 text-xs text-slate-500 font-medium">
          Costo Unitario: <span className="font-semibold text-slate-700">€ {kpi.costoPerCollo.toFixed(4)}</span> / collo
        </div>
      </div>
    </div>
  );
};

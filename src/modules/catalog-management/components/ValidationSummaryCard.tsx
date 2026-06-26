import FormCard from "../../../shared/components/forms/FormCard";
import type { ValidationSummary } from "../types/catalogRestriction.types";

interface ValidationSummaryCardProps {
  summary: ValidationSummary;
}

export default function ValidationSummaryCard({ summary }: ValidationSummaryCardProps) {
  return (
    <FormCard title="Resumen de Validación" icon="📊" color="#27ae60">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs font-semibold text-green-700 uppercase">Nuevos</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{summary.newRecords}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-700 uppercase">Modificados</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{summary.modifiedRecords}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-700 uppercase">Inactivados</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{summary.inactivatedRecords}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs font-semibold text-red-700 uppercase">Bloqueados</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{summary.blockedRecords}</p>
        </div>
      </div>
      {summary.observations > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-700">
            ⚠️ <strong>{summary.observations}</strong> observación(es) detectada(s)
          </p>
        </div>
      )}
      {summary.criticalErrors > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            ✗ <strong>{summary.criticalErrors}</strong> error(es) detectado(s)
          </p>
        </div>
      )}
    </FormCard>
  );
}

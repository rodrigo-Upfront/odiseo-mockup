import { type ProjectStage, isPortalStage } from "../../../shared/data/projectStageConfig";
import { getImpactFieldsForStage } from "../../../shared/data/projectFieldImpactConfig";
import { AlertCircle, Info, ShieldAlert } from "lucide-react";

interface ProjectFieldImpactListProps {
  currentStage: ProjectStage;
}

export default function ProjectFieldImpactList({ currentStage }: ProjectFieldImpactListProps) {
  if (!isPortalStage(currentStage)) {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-500 italic">
        Esta etapa es de seguimiento externo. No hay campos operativos asignados a esta área dentro del portal.
      </div>
    );
  }

  const fields = getImpactFieldsForStage(currentStage as any);

  if (fields.length === 0) {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-500 italic">
        No hay campos específicos marcados con impacto para esta etapa.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <ShieldAlert size={16} className="text-brand-primary" />
        <h3 className="font-bold text-slate-800 text-sm uppercase">Matriz de Impacto</h3>
      </div>
      <div className="p-0">
        <table className="w-full text-sm">
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.fieldKey} className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                <td className="py-3 px-5 font-semibold text-slate-800 w-1/3 border-r border-slate-100">{f.label}</td>
                <td className="py-3 px-5 text-slate-600">{f.description}</td>
                <td className="py-3 px-5 w-24 text-center">
                  {f.impactLevel === "alta" && <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded"><AlertCircle size={12}/> Alto</span>}
                  {f.impactLevel === "media" && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded"><AlertCircle size={12}/> Medio</span>}
                  {f.impactLevel === "baja" && <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">Bajo</span>}
                  {f.impactLevel === "info" && <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded"><Info size={12}/> Info</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

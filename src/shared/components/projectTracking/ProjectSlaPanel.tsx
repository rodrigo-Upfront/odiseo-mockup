import { type ProjectSlaTracking } from "../../../shared/data/slaStorage";
import SlaStatusBadge from "../sla/SlaStatusBadge";
import { Clock } from "lucide-react";

interface ProjectSlaPanelProps {
  sla: ProjectSlaTracking | null;
  isPortalStage: boolean;
}

export default function ProjectSlaPanel({ sla, isPortalStage }: ProjectSlaPanelProps) {
  if (!isPortalStage) {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
        <h3 className="font-bold text-slate-600 text-sm mb-1 uppercase tracking-wide">SLA Operativo</h3>
        <p className="text-sm text-slate-500">
          El seguimiento del tiempo operativo (SLA) no aplica para etapas externas del Sistema Integral.
        </p>
      </div>
    );
  }

  if (!sla) {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
        <h3 className="font-bold text-slate-600 text-sm mb-1 uppercase tracking-wide">SLA Operativo</h3>
        <p className="text-sm text-slate-500">No hay un SLA activo asignado para esta etapa.</p>
      </div>
    );
  }

  const progress = Math.min(100, Math.max(0, (sla.elapsedDays / sla.slaDays) * 100)) || 0;
  
  let progressColor = "bg-green-500";
  if (sla.slaStatus === "Por vencer") progressColor = "bg-amber-500";
  if (sla.slaStatus === "Vencido") progressColor = "bg-red-500";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2 text-brand-primary">
          <Clock size={16} />
          <h3 className="font-bold text-sm uppercase tracking-wide">Acuerdo de Nivel de Servicio (SLA)</h3>
        </div>
        <SlaStatusBadge status={sla.slaStatus} />
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-xs font-bold text-slate-500 mb-1">Días Asignados</div>
            <div className="text-xl font-black text-slate-800">{sla.slaDays}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-xs font-bold text-slate-500 mb-1">Días Restantes</div>
            <div className={`text-xl font-black ${sla.remainingDays < 0 ? 'text-red-600' : 'text-brand-secondary'}`}>
              {sla.remainingDays}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Progreso del SLA</span>
            <span>{sla.elapsedDays} / {sla.slaDays} días consumidos</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressColor} transition-all duration-500 ease-out`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 text-xs text-slate-500 flex flex-col gap-1">
          <p><strong className="text-slate-700">Inicio:</strong> {new Date(sla.assignedAt).toLocaleString()}</p>
          <p><strong className="text-slate-700">Vencimiento:</strong> {new Date(sla.dueAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

import { type ProjectStage, getStageConfig, isPortalStage } from "../../../shared/data/projectStageConfig";
import { Info } from "lucide-react";

interface ProjectStageCardProps {
  currentStage: ProjectStage;
  stageUpdatedAt: string;
}

export default function ProjectStageCard({ currentStage, stageUpdatedAt }: ProjectStageCardProps) {
  const config = getStageConfig(currentStage);
  const isPortal = isPortalStage(currentStage);

  if (!config) return null;

  return (
    <div className={`rounded-xl p-5 border ${isPortal ? 'bg-brand-primary text-white border-[#002b43]' : 'bg-slate-100 text-slate-800 border-slate-200'} shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPortal ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}>
            Etapa Actual: {config.id}
          </span>
          {!isPortal && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Solo Lectura
            </span>
          )}
        </div>
        <div className={`text-xs ${isPortal ? 'text-white/70' : 'text-slate-500'}`}>
          Actualizado: {new Date(stageUpdatedAt).toLocaleString()}
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-1">{config.name}</h2>
      <p className={`text-sm mb-4 ${isPortal ? 'text-white/80' : 'text-slate-600'}`}>{config.description}</p>
      
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${isPortal ? 'bg-white/10' : 'bg-white border border-slate-200'}`}>
        <Info size={14} className={isPortal ? "text-brand-secondary" : "text-slate-400"} />
        Área Responsable: {config.responsibleArea}
      </div>
    </div>
  );
}

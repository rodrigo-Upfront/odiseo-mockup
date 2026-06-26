import { type ProjectStage, PORTAL_PROJECT_STAGES, SI_PROJECT_STAGES, isPortalStage } from "../../../shared/data/projectStageConfig";
import { Check } from "lucide-react";

interface ProjectStageStepperProps {
  currentStage: ProjectStage;
}

export default function ProjectStageStepper({ currentStage }: ProjectStageStepperProps) {
  const currentIsPortal = isPortalStage(currentStage);

  const getStageStatus = (stageId: ProjectStage) => {
    const isPortal = isPortalStage(stageId);

    // If we are currently in Portal and evaluating SI stage, it's pending
    if (currentIsPortal && !isPortal) return "pending";
    // If we are in SI and evaluating Portal stage, it's completed
    if (!currentIsPortal && isPortal) return "completed";

    // Both in same block (Portal vs SI)
    const stages = isPortal ? PORTAL_PROJECT_STAGES : SI_PROJECT_STAGES;
    const currentIndex = stages.findIndex(s => s.id === currentStage);
    const targetIndex = stages.findIndex(s => s.id === stageId);

    if (targetIndex < currentIndex) return "completed";
    if (targetIndex === currentIndex) return "current";
    return "pending";
  };

  const renderStages = (stages: any[], title: string, isPortalTracker: boolean) => (
    <div className={`w-full rounded-xl p-6 border ${isPortalTracker ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
      <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isPortalTracker ? 'text-slate-600' : 'text-slate-500'}`}>
        {title}
      </h3>
      <div className="flex items-start justify-between gap-1 relative">
        {/* Línea de conexión de fondo */}
        <div className="absolute top-5 left-[5%] right-[5%] h-[2px] bg-slate-200 -z-10" />

        {stages.map((stage, idx) => {
          const status = getStageStatus(stage.id);
          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center">
              {/* Icono del estado */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                status === "completed" ? "bg-[#27ae60] text-white shadow-md" :
                status === "current" ? "bg-white border-2 border-brand-primary text-brand-primary shadow-md" :
                "bg-white border-2 border-slate-200 text-slate-400"
              }`}>
                {status === "completed" ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span className="text-sm font-bold">{idx}</span>
                )}
              </div>

              {/* Nombre del estado */}
              <div className={`mt-3 text-center text-xs font-semibold px-1 max-w-[85px] leading-tight h-10 flex items-start justify-center ${
                status === "completed" ? "text-[#27ae60]" :
                status === "current" ? "text-brand-primary" :
                "text-slate-400"
              }`}>
                {stage.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-4">
      {renderStages(PORTAL_PROJECT_STAGES, "Tracking Portal Web (Operativo)", true)}
      {renderStages(SI_PROJECT_STAGES, "Seguimiento Sistema Integral (Externo)", false)}
    </div>
  );
}

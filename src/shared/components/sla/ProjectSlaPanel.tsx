import { getProjectSlaSummary, getProjectStatusHistory } from "../../data/slaStorage";
import SlaTimer from "./SlaTimer";
import SlaTimeline from "./SlaTimeline";
import SlaStatusBadge from "./SlaStatusBadge";

interface ProjectSlaPanelProps {
  projectCode: string;
}

export default function ProjectSlaPanel({ projectCode }: ProjectSlaPanelProps) {
  const trackingData = getProjectSlaSummary(projectCode);
  const currentSla = trackingData.length > 0 ? trackingData[0] : null;
  const history = getProjectStatusHistory().filter(h => h.projectCode === projectCode);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Panel SLA</h3>
        {currentSla && <SlaStatusBadge status={currentSla.slaStatus} />}
      </div>
      
      <div className="p-5">
        {currentSla ? (
          <div className="mb-6">
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Área responsable:</span>
                <span className="font-semibold text-gray-800">{currentSla.responsibleArea}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estado actual:</span>
                <span className="font-semibold text-gray-800">{currentSla.status}</span>
              </div>
            </div>
            
            <SlaTimer
              elapsedHours={currentSla.elapsedDays * 24}
              remainingHours={currentSla.remainingDays * 24}
              slaHours={currentSla.slaDays * 24}
              status={currentSla.slaStatus}
            />
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic mb-6">SLA no iniciado para este proyecto.</div>
        )}

        <div className="border-t border-gray-100 pt-5 mt-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Historial de Estados</h4>
          <SlaTimeline history={history} />
        </div>
      </div>
    </div>
  );
}

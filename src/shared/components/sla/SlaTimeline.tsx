import { type ProjectStatusHistory } from "../../data/slaStorage";

interface SlaTimelineProps {
  history: ProjectStatusHistory[];
}

export default function SlaTimeline({ history }: SlaTimelineProps) {
  if (!history || history.length === 0) {
    return <div className="text-sm text-gray-500 italic">No hay historial disponible.</div>;
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-3 mt-4 space-y-6">
      {history.map((item, index) => {
        const date = new Date(item.changedAt);
        return (
          <div key={item.id} className="relative pl-6">
            <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 border-2 border-white ${index === 0 ? 'bg-brand-primary' : 'bg-gray-300'}`} style={index === 0 ? { backgroundColor: '#00395A'} : {}} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">
                {item.fromStatus} → {item.toStatus}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">
                {item.responsibleArea} | {item.changedBy} | {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              {item.comment && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                  {item.comment}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

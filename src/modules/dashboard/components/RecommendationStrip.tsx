import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, FolderKanban, Package } from "lucide-react";
import { QUICK_RECOMMENDATIONS } from "../data/homeMockData";

export default function RecommendationStrip() {
  const navigate = useNavigate();

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "approved-bases":
        return {
          icon: <Package size={18} />,
          textColor: "text-[#003B5C]",
        };
      case "validated":
        return {
          icon: <CheckCircle2 size={18} />,
          textColor: "text-emerald-600",
        };
      case "portfolio":
        return {
          icon: <FolderKanban size={18} />,
          textColor: "text-slate-600",
        };
      default:
        return {
          icon: <Package size={18} />,
          textColor: "text-slate-600",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      {QUICK_RECOMMENDATIONS.map((rec) => {
        const { icon, textColor } = getIconAndColor(rec.type);

        return (
          <div
            key={rec.type}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className={`mt-0.5 flex-shrink-0 ${textColor}`}>{icon}</div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-slate-900 leading-tight">
                {rec.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{rec.description}</p>
            </div>

            <button
              type="button"
              onClick={() => navigate(rec.route)}
              className="text-xs font-medium text-[#003B5C] hover:text-[#00567f] transition-colors whitespace-nowrap flex items-center gap-1 flex-shrink-0 mt-0.5"
            >
              {rec.actionLabel}
              <ArrowRight size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { ArrowRight, Lightbulb, CheckCircle2, FolderKanban, Zap } from "lucide-react";
import InfoTooltip from "../../../shared/components/display/InfoTooltip";
import type { Recommendation } from "../data/homeMockData";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const navigate = useNavigate();

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "approved-bases":
        return {
          icon: <CheckCircle2 size={16} />,
          bgColor: "bg-slate-50 border-slate-200",
          textColor: "text-slate-600",
          badgeColor: "bg-slate-100 text-slate-600",
        };
      case "similar":
        return {
          icon: <Lightbulb size={16} />,
          bgColor: "bg-blue-50 border-blue-200",
          textColor: "text-blue-700",
          badgeColor: "bg-blue-100 text-blue-700",
        };
      case "validated":
        return {
          icon: <CheckCircle2 size={16} />,
          bgColor: "bg-green-50 border-green-200",
          textColor: "text-green-700",
          badgeColor: "bg-green-100 text-green-700",
        };
      case "portfolio":
        return {
          icon: <FolderKanban size={16} />,
          bgColor: "bg-amber-50 border-amber-200",
          textColor: "text-amber-700",
          badgeColor: "bg-amber-100 text-amber-700",
        };
      case "modified":
        return {
          icon: <Zap size={16} />,
          bgColor: "bg-purple-50 border-purple-200",
          textColor: "text-purple-700",
          badgeColor: "bg-purple-100 text-purple-700",
        };
      default:
        return {
          icon: <CheckCircle2 size={16} />,
          bgColor: "bg-slate-50 border-slate-200",
          textColor: "text-slate-600",
          badgeColor: "bg-slate-100 text-slate-600",
        };
    }
  };

  const { icon, bgColor, textColor, badgeColor } = getIconAndColor(
    recommendation.type
  );

  const handleAction = () => {
    navigate("/portfolio");
  };

  return (
    <div
      className={`flex items-start justify-between gap-2 rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow ${bgColor}`}
    >
      <div className="flex gap-2 flex-1">
        <div className={`mt-0.5 flex-shrink-0 ${textColor}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold text-sm leading-tight ${textColor}`}>
            {recommendation.title}
          </h3>
          {recommendation.badge && (
            <span
              className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor}`}
            >
              {recommendation.badge}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleAction}
          className={`inline-flex items-center gap-0.5 text-xs font-semibold ${textColor} hover:opacity-80 transition-opacity whitespace-nowrap`}
        >
          {recommendation.actionLabel}
          <ArrowRight size={12} />
        </button>
        <InfoTooltip content={recommendation.description} size="sm" />
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import InfoTooltip from "../../../shared/components/display/InfoTooltip";
import type { RecentRubro } from "../data/homeMockData";

interface RubroCardProps {
  rubro: RecentRubro;
  onExplore?: (rubro: RecentRubro) => void;
}

export default function RubroCard({ rubro, onExplore }: RubroCardProps) {
  const navigate = useNavigate();

  const handleExplore = () => {
    onExplore?.(rubro);
    navigate("/portfolio");
  };

  const tooltipContent = (
    <div className="space-y-1">
      <p className="break-words">
        <span className="font-semibold">Estructura:</span>{" "}
        {rubro.frequentStructure}
      </p>
      <p>
        <span className="font-semibold">Envoltura:</span>{" "}
        {rubro.frequentWrapping}
      </p>
    </div>
  );

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-2 flex-1">
        <InfoTooltip content={tooltipContent} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight">
            {rubro.name}
          </h3>
          <p className="text-xs text-slate-600">
            {rubro.productCount} productos
          </p>
        </div>
      </div>

      <button
        onClick={handleExplore}
        className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors whitespace-nowrap flex-shrink-0"
      >
        Explorar
        <ArrowRight size={12} />
      </button>
    </div>
  );
}

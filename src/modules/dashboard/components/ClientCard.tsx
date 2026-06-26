import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import InfoTooltip from "../../../shared/components/display/InfoTooltip";
import type { RecentClient } from "../data/homeMockData";

interface ClientCardProps {
  client: RecentClient;
  onCreateProduct?: (client: RecentClient) => void;
}

export default function ClientCard({
  client,
  onCreateProduct,
}: ClientCardProps) {
  const navigate = useNavigate();

  const handleCreateProduct = () => {
    onCreateProduct?.(client);
    navigate("/portfolio");
  };

  const tooltipContent = (
    <div className="space-y-1">
      <p>
        <span className="font-semibold">Último:</span> {client.lastProduct}
      </p>
      <p>
        <span className="font-semibold">Rubro:</span> {client.mainRubro}
      </p>
    </div>
  );

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-2 flex-1">
        <InfoTooltip content={tooltipContent} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight">
            {client.name}
          </h3>
          <p className="text-xs text-slate-600">
            {client.productsHighlighted} alta · {client.activePortfolios} portafolios
          </p>
        </div>
      </div>

      <button
        onClick={handleCreateProduct}
        className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors whitespace-nowrap flex-shrink-0"
      >
        Crear
        <ArrowRight size={12} />
      </button>
    </div>
  );
}

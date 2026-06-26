import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import EntityStatusBadge from "../../../shared/components/display/EntityStatusBadge";
import InfoTooltip from "../../../shared/components/display/InfoTooltip";
import Button from "../../../shared/components/ui/Button";
import type { WorkQueueItem } from "../data/homeMockData";

interface WorkQueueItemCardProps {
  item: WorkQueueItem;
}

export default function WorkQueueItemCard({ item }: WorkQueueItemCardProps) {
  const navigate = useNavigate();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pendiente referencia":
        return "danger";
      case "Pendiente validación":
        return "warning";
      case "En cotización":
        return "info";
      case "Pendiente aprobación":
        return "info";
      case "Observado":
        return "warning";
      case "Ficha completa":
      case "Validado":
        return "default";
      default:
        return "default";
    }
  };

  const handleNavigate = () => {
    if (item.code.startsWith("PP-")) {
      navigate(`/portfolio`);
    } else if (item.code.startsWith("PRJ-")) {
      navigate(`/products`);
    } else if (item.code.startsWith("PO-")) {
      navigate(`/portfolio`);
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors ${
        item.urgency === "high" ? "bg-red-50/40" : "bg-white"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-brand-primary">
            {item.code}
          </span>
          <InfoTooltip content={`Tipo: ${item.type}`} size="sm" />
        </div>
        <EntityStatusBadge
          status={item.status}
          variant={getStatusVariant(item.status)}
        />
      </div>

      <p className="text-xs text-slate-500 mb-1.5">{item.client}</p>
      <p className="text-sm text-slate-700 mb-3">{item.nextStep}</p>

      <div className="flex justify-end">
        <Button
          variant={item.urgency === "high" ? "primary" : "outline"}
          size="sm"
          rightIcon={<ChevronRight size={14} />}
          onClick={handleNavigate}
        >
          {item.actionLabel}
        </Button>
      </div>
    </div>
  );
}

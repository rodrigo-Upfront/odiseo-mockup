import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import EntityStatusBadge from "../../../shared/components/display/EntityStatusBadge";
import InfoTooltip from "../../../shared/components/display/InfoTooltip";
import Button from "../../../shared/components/ui/Button";
import type { WorkQueueItem } from "../data/homeMockData";

interface WorkQueueTableProps {
  items: WorkQueueItem[];
  maxItems?: number;
}

export default function WorkQueueTable({
  items,
  maxItems = 5,
}: WorkQueueTableProps) {
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

  const handleNavigate = (code: string) => {
    if (code.startsWith("PP-")) {
      navigate(`/portfolio`);
    } else if (code.startsWith("PRJ-")) {
      navigate(`/products`);
    } else if (code.startsWith("PO-")) {
      navigate(`/portfolio`);
    }
  };

  const displayItems = items.slice(0, maxItems);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3 bg-gray-50">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
          Mi Bandeja de Trabajo
        </h2>
        <span className="text-xs font-semibold text-slate-500">
          {displayItems.length} de {items.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white border-b border-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold">Código</th>
              <th className="px-4 py-2.5 text-left font-semibold">Cliente</th>
              <th className="px-4 py-2.5 text-left font-semibold">Estado</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Siguiente Paso
              </th>
              <th className="px-4 py-2.5 text-center font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayItems.map((item) => (
              <tr
                key={item.code}
                className={`hover:bg-slate-50 transition-colors ${
                  item.urgency === "high" ? "bg-red-50/30" : ""
                }`}
              >
                <td className="px-4 py-3 font-bold text-brand-primary cursor-pointer hover:text-brand-secondary flex items-center gap-1.5">
                  {item.code}
                  <InfoTooltip content={`Tipo: ${item.type}`} size="sm" />
                </td>
                <td className="px-4 py-3 text-slate-700 text-sm">
                  {item.client}
                </td>
                <td className="px-4 py-3">
                  <EntityStatusBadge
                    status={item.status}
                    variant={getStatusVariant(item.status)}
                  />
                </td>
                <td className="px-4 py-3 text-slate-600 text-sm max-w-xs">
                  {item.nextStep}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant={item.urgency === "high" ? "primary" : "outline"}
                    size="sm"
                    rightIcon={<ChevronRight size={14} />}
                    onClick={() => handleNavigate(item.code)}
                  >
                    {item.actionLabel}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {displayItems.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-slate-500 italic">
            No hay elementos pendientes en tu bandeja de trabajo
          </p>
        </div>
      )}
    </div>
  );
}

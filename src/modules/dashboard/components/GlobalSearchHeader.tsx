import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import InfoTooltip from "../../../shared/components/display/InfoTooltip";

interface GlobalSearchHeaderProps {
  onSearch?: (query: string) => void;
}

export default function GlobalSearchHeader({
  onSearch,
}: GlobalSearchHeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Portal Web ODISEO
        </h1>
        <InfoTooltip
          content="Reutiliza productos aprobados, clientes y rubros recientes para crear sin empezar desde cero."
          size="md"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar cliente, producto, SKU, portafolio o rubro..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none"
          />
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate("/portfolio")}
          className="whitespace-nowrap"
        >
          Crear Producto
        </Button>
      </div>
    </div>
  );
}

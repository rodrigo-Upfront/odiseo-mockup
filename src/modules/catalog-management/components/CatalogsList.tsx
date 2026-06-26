import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getCatalogValues } from "../../../shared/catalogs";
import type { CatalogDefinition } from "../../../shared/catalogs";

interface CatalogsListProps {
  catalogs: CatalogDefinition[];
  onSelectCatalog?: (catalogCode: string) => void;
}

export default function CatalogsList({ catalogs, onSelectCatalog }: CatalogsListProps) {
  const [sourceFilter, setSourceFilter] = useState<"all" | "ODISEO" | "SISTEMA_INTEGRAL">("all");

  const filteredCatalogs = useMemo(() => {
    if (sourceFilter === "all") return catalogs;
    return catalogs.filter((cat) =>
      sourceFilter === "SISTEMA_INTEGRAL"
        ? cat.ownerSystem === "SISTEMA_INTEGRAL"
        : cat.ownerSystem !== "SISTEMA_INTEGRAL"
    );
  }, [catalogs, sourceFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["all", "ODISEO", "SISTEMA_INTEGRAL"].map((filter) => (
          <button
            key={filter}
            onClick={() => setSourceFilter(filter as "all" | "ODISEO" | "SISTEMA_INTEGRAL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sourceFilter === filter
                ? "bg-brand-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {filter === "all" ? "Todos" : filter === "ODISEO" ? "ODISEO" : "Sistema Integral"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredCatalogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No hay catálogos disponibles</p>
          </div>
        ) : (
          filteredCatalogs.map((catalog) => <CatalogItem key={catalog.id} catalog={catalog} onSelect={onSelectCatalog} />)
        )}
      </div>
    </div>
  );
}

function CatalogItem({ catalog, onSelect }: { catalog: CatalogDefinition; onSelect?: (catalogCode: string) => void }) {
  const values = useMemo(
    () => getCatalogValues(catalog.code),
    [catalog.code]
  );

  const activeCount = values.filter((v) => v.status === "Activo").length;
  const inactiveCount = values.filter((v) => v.status === "Inactivo").length;
  const blockedCount = values.filter((v) => v.status === "Bloqueado").length;

  const isSistemaIntegral = catalog.ownerSystem === "SISTEMA_INTEGRAL";

  return (
    <div
      className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors cursor-pointer group"
      onClick={() => onSelect?.(catalog.code)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 text-sm group-hover:text-brand-primary transition-colors">
              {catalog.name}
            </h4>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
              isSistemaIntegral
                ? "bg-amber-100 text-amber-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {isSistemaIntegral ? "Sistema Integral" : "ODISEO"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Código: {catalog.code}
          </p>
        </div>
        <ChevronRight
          size={16}
          className="text-slate-400 group-hover:text-brand-primary transition-colors flex-shrink-0"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200">
        <div className="text-center">
          <div className="text-sm font-bold text-slate-900">{values.length}</div>
          <div className="text-xs text-slate-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-green-700">{activeCount}</div>
          <div className="text-xs text-green-600">Activos</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-slate-600">
            {inactiveCount + blockedCount}
          </div>
          <div className="text-xs text-slate-600">Inactivos</div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Download, ChevronDown } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";
import { getCurrentUser } from "../../../shared/data/userStorage";
import { getCatalogs } from "../../../shared/catalogs";
import { getAvailableRestrictions } from "../services/catalogRestrictionService";
import CatalogsList from "../components/CatalogsList";
import RestrictionsList from "../components/RestrictionsList";
import CatalogPreviewModal from "../components/CatalogPreviewModal";
import { exportAllCatalogs, exportAllRestrictions, exportAllData } from "../services/catalogExportService";

export default function ViewAllCatalogsPage() {
  const { setHeader, resetHeader } = useLayout();
  const currentUser = getCurrentUser();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedCatalogCode, setSelectedCatalogCode] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "ODISEO" | "SISTEMA_INTEGRAL">("all");

  const catalogs = useMemo(() => getCatalogs(), []);
  const restrictions = useMemo(() => getAvailableRestrictions(), []);

  const filteredCatalogs = useMemo(() => {
    if (sourceFilter === "all") return catalogs;
    return catalogs.filter((cat) =>
      sourceFilter === "SISTEMA_INTEGRAL"
        ? cat.ownerSystem === "SISTEMA_INTEGRAL"
        : cat.ownerSystem !== "SISTEMA_INTEGRAL"
    );
  }, [catalogs, sourceFilter]);

  const handleExportCatalogs = async () => {
    setIsExporting(true);
    try {
      await exportAllCatalogs();
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportRestrictions = async () => {
    setIsExporting(true);
    try {
      await exportAllRestrictions();
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await exportAllData();
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  useEffect(() => {
    setHeader({
      title: "Ver Todo",
      breadcrumbs: [
        { label: "Inicio", href: "/dashboard" },
        { label: "Ver Todo" },
      ],
    });
    return () => resetHeader();
  }, [setHeader, resetHeader]);

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <div className="p-6">
        {/* Header con botón de exportar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Catálogos y Restricciones
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Vista completa de todos los catálogos y restricciones disponibles en el sistema
            </p>
          </div>

          {/* Botón de Exportar con menú */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Exportar
              <ChevronDown size={16} className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <button
                  onClick={handleExportCatalogs}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 first:rounded-t-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold">Descargar catálogos</div>
                  <div className="text-xs text-slate-500">Exporta todos los catálogos en un archivo Excel</div>
                </button>

                <button
                  onClick={handleExportRestrictions}
                  disabled={isExporting || restrictions.length === 0}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold">Descargar restricciones</div>
                  <div className="text-xs text-slate-500">Exporta todas las restricciones en un archivo Excel</div>
                </button>

                <button
                  onClick={handleExportAll}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold">Descargar todo</div>
                  <div className="text-xs text-slate-500">Exporta catálogos y restricciones en un archivo</div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal: dos columnas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Catálogos a la izquierda */}
          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Catálogos</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {filteredCatalogs.length} catálogo{filteredCatalogs.length !== 1 ? "s" : ""} disponible{filteredCatalogs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <CatalogsList catalogs={filteredCatalogs} onSelectCatalog={setSelectedCatalogCode} />
            </div>
          </div>

          {/* Restricciones a la derecha */}
          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Restricciones</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {restrictions.length} restricción{restrictions.length !== 1 ? "es" : ""} disponible{restrictions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <RestrictionsList restrictions={restrictions} />
            </div>
          </div>
        </div>
      </div>

      <CatalogPreviewModal
        isOpen={!!selectedCatalogCode}
        catalogCode={selectedCatalogCode}
        onClose={() => setSelectedCatalogCode("")}
      />
    </div>
  );
}

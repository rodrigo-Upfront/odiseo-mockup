import { useState } from "react";
import FormCard from "../../../shared/components/forms/FormCard";
import CatalogSearch from "./CatalogSearch";
import RestrictionSearch from "./RestrictionSearch";
import type { ManagementType, CatalogItem, RestrictionItem } from "../types/catalogRestriction.types";

interface SourceAndParametersTabProps {
  type: ManagementType;
  selectedTarget: string;
  selectedTargetId: string;
  onTargetChange: (value: string) => void;
  onTargetIdChange: (id: string) => void;
  errors: Record<string, string>;
  submitAttempted: boolean;
  catalogSource?: "ODISEO" | "SISTEMA_INTEGRAL";
  onCatalogSourceChange?: (source: "ODISEO" | "SISTEMA_INTEGRAL") => void;
}

type TabType = "source" | "parameters";

export default function SourceAndParametersTab({
  type,
  selectedTarget,
  selectedTargetId,
  onTargetChange,
  onTargetIdChange,
  errors,
  submitAttempted,
  catalogSource = "ODISEO",
  onCatalogSourceChange,
}: SourceAndParametersTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>(type === "catalog" ? "source" : "parameters");

  const handleCatalogSelect = (catalog: CatalogItem) => {
    onTargetIdChange(catalog.code);
    if (onCatalogSourceChange) {
      onCatalogSourceChange(catalog.source);
    }
    // Auto-advance to parameters tab
    setActiveTab("parameters");
  };

  const handleRestrictionSelect = (restriction: RestrictionItem) => {
    onTargetIdChange(restriction.id);
    // Auto-advance to parameters tab
    setActiveTab("parameters");
  };

  return (
    <FormCard title="Configuración" icon="⚙️" color="#00395A">
      {/* Pestañas */}
      {type === "catalog" && (
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("source")}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "source"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Origen del catálogo *
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("parameters")}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "parameters"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Parámetros
          </button>
        </div>
      )}

      {/* Contenido de pestañas */}
      <div className="space-y-6">
        {/* Tab: Origen del catálogo */}
        {type === "catalog" && activeTab === "source" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Selecciona la fuente del catálogo que deseas gestionar
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onCatalogSourceChange?.("ODISEO")}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  catalogSource === "ODISEO"
                    ? "border-brand-primary bg-brand-secondary-soft"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    catalogSource === "ODISEO"
                      ? "border-brand-primary bg-brand-primary"
                      : "border-slate-300"
                  }`}>
                    {catalogSource === "ODISEO" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">ODISEO</p>
                    <p className="text-xs text-slate-600">Catálogos propios del portal</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onCatalogSourceChange?.("SISTEMA_INTEGRAL")}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  catalogSource === "SISTEMA_INTEGRAL"
                    ? "border-brand-primary bg-brand-secondary-soft"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    catalogSource === "SISTEMA_INTEGRAL"
                      ? "border-brand-primary bg-brand-primary"
                      : "border-slate-300"
                  }`}>
                    {catalogSource === "SISTEMA_INTEGRAL" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Sistema Integral</p>
                    <p className="text-xs text-slate-600">Catálogos sincronizados</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Botón para continuar */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("parameters")}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Tab: Parámetros */}
        {activeTab === "parameters" && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">
                {type === "catalog" ? "Seleccionar catálogo" : "Seleccionar restricción"} *
              </label>

              {type === "catalog" ? (
                <CatalogSearch
                  onSelect={handleCatalogSelect}
                  selectedCatalog={selectedTarget}
                  source={catalogSource}
                />
              ) : (
                <RestrictionSearch
                  onSelect={handleRestrictionSelect}
                  selectedRestriction={selectedTarget}
                />
              )}

              {submitAttempted && errors.targetId && (
                <p className="mt-2 text-sm text-red-600">{errors.targetId}</p>
              )}
            </div>

            {/* Botón para volver */}
            {type === "catalog" && (
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("source")}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ← Volver
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </FormCard>
  );
}

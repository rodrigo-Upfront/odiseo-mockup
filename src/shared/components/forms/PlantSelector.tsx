import { useMemo, useState, useEffect } from "react";
import { getCatalogValues, onCatalogChange } from "../../catalogs/catalog.service";

type PlantOption = "AF_LIMA" | "AF_CALI" | "AF_SANTIAGO" | "AF_SAN_LUIS";

type PlantSelectorProps = {
  value: PlantOption | "";
  onChange?: (value: PlantOption) => void;
  readOnly?: boolean;
  error?: string;
};

const PLANT_EMOJIS: Record<string, string> = {
  "AF-LIM": "🌴",
  "AF-CAL": "🏭",
  "AF-STN": "⛰️",
  "AF-SL": "🏢",
};

const mapItemToOption = (item: string): PlantOption | null => {
  if (item.includes("LIM")) return "AF_LIMA";
  if (item.includes("CAL")) return "AF_CALI";
  if (item.includes("STN")) return "AF_SANTIAGO";
  if (item.includes("SL")) return "AF_SAN_LUIS";
  return null;
};

export default function PlantSelector({
  value,
  onChange,
  readOnly = false,
  error,
}: PlantSelectorProps) {
  // Estado para forzar re-render cuando el catálogo cambia
  const [catalogVersion, setCatalogVersion] = useState(0);

  // Escuchar cambios en el catálogo
  useEffect(() => {
    const unsubscribe = onCatalogChange((catalogCode) => {
      if (catalogCode === "plant") {
        setCatalogVersion((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  const plants = useMemo(() => {
    const catalogValues = getCatalogValues("plant", { activeOnly: true });
    return catalogValues.map((v) => ({
      id: mapItemToOption(v.item) || ("AF_LIMA" as PlantOption),
      label: v.name,
      description: v.name,
      emoji: PLANT_EMOJIS[v.item] || "🏭",
      item: v.item,
    }));
  }, [catalogVersion]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {plants.map((plant) => (
          <button
            key={plant.id}
            type="button"
            onClick={() => !readOnly && onChange?.(plant.id as PlantOption)}
            disabled={readOnly}
            className={`relative flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 transition-all ${
              value === plant.id
                ? "border-brand-primary bg-blue-50/60"
                : "border-slate-200 bg-white hover:border-slate-300"
            } ${readOnly ? "cursor-default" : "cursor-pointer"} ${
              !readOnly && "hover:shadow-sm"
            }`}
          >
            {/* Radio Circle */}
            <div
              className={`absolute top-1.5 right-1.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                value === plant.id
                  ? "border-brand-primary bg-brand-primary"
                  : "border-slate-300 bg-white"
              }`}
            >
              {value === plant.id && (
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </div>

            {/* Icon */}
            <div className="text-xl leading-none">{plant.emoji}</div>

            {/* Label */}
            <span
              className={`text-xs font-semibold text-center leading-tight ${
                value === plant.id
                  ? "text-brand-primary"
                  : "text-slate-700"
              }`}
            >
              {plant.label}
            </span>


          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

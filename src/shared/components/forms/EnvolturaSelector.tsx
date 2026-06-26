import { useMemo, useState, useEffect } from "react";
import { getCatalogValues, onCatalogChange } from "../../catalogs/catalog.service";

type EnvolturaOption = "LAMINA" | "BOLSA" | "POUCH";

type EnvolturaSelectorProps = {
  value: EnvolturaOption | "";
  onChange?: (value: EnvolturaOption) => void;
  readOnly?: boolean;
  error?: string;
};

const ENVOLTURA_IMAGES: Record<string, string> = {
  "LÁMINA": "/assets/envolturas/lamina.png",
  "BOLSA": "/assets/envolturas/bolsa.png",
  "POUCH": "/assets/envolturas/pouch.png",
};

export default function EnvolturaSelector({
  value,
  onChange,
  readOnly = false,
  error,
}: EnvolturaSelectorProps) {
  // Estado para forzar re-render cuando el catálogo cambia
  const [catalogVersion, setCatalogVersion] = useState(0);

  // Escuchar cambios en el catálogo
  useEffect(() => {
    const unsubscribe = onCatalogChange((catalogCode) => {
      if (catalogCode === "wrapping_type") {
        setCatalogVersion((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  const envolturas = useMemo(() => {
    const catalogValues = getCatalogValues("wrapping_type", { activeOnly: true });
    return catalogValues.map((v) => {
      // Normalizar nombre para detectar tipo
      const normalizedName = (v.name || "").toLowerCase().trim();

      // Mapear item a formato compatible con Portfolio
      let id = "LAMINA"; // default
      if (normalizedName.includes("bolsa")) id = "BOLSA";
      else if (normalizedName.includes("pouch")) id = "POUCH";
      else if (normalizedName.includes("lamina") || normalizedName.includes("lámina")) id = "LAMINA";

      return {
        id,
        label: v.name,
        image: ENVOLTURA_IMAGES[v.name] || "/assets/envolturas/default.png",
        description: v.name,
        item: v.item,
      };
    });
  }, [catalogVersion]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {envolturas.map((envoltura) => (
          <button
            key={envoltura.id}
            type="button"
            onClick={() => !readOnly && onChange?.(envoltura.id as "LAMINA" | "BOLSA" | "POUCH")}
            disabled={readOnly}
            className={`relative flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 transition-all ${
              value === envoltura.id
                ? "border-brand-primary bg-blue-50/60"
                : "border-slate-200 bg-white hover:border-slate-300"
            } ${readOnly ? "cursor-default" : "cursor-pointer"} ${
              !readOnly && "hover:shadow-sm"
            }`}
          >
            {/* Radio Circle */}
            <div
              className={`absolute top-1.5 right-1.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                value === envoltura.id
                  ? "border-brand-primary bg-brand-primary"
                  : "border-slate-300 bg-white"
              }`}
            >
              {value === envoltura.id && (
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </div>

            {/* Image */}
            <div className="w-full h-24 flex-none flex items-center justify-center overflow-hidden bg-slate-50 rounded">
              <img
                src={envoltura.image}
                alt={envoltura.label}
                className="h-full w-full object-contain p-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>

            {/* Label */}
            <span
              className={`text-xs font-semibold text-center leading-tight ${
                value === envoltura.id
                  ? "text-brand-primary"
                  : "text-slate-700"
              }`}
            >
              {envoltura.label}
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

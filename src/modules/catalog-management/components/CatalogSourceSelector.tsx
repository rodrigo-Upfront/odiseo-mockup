interface CatalogSourceSelectorProps {
  value: "ODISEO" | "SISTEMA_INTEGRAL";
  onChange: (source: "ODISEO" | "SISTEMA_INTEGRAL") => void;
}

export default function CatalogSourceSelector({
  value,
  onChange,
}: CatalogSourceSelectorProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
          Origen del catálogo *
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Selecciona la fuente del catálogo que deseas gestionar
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("ODISEO")}
          className={`rounded-lg border-2 p-4 text-left transition-all ${
            value === "ODISEO"
              ? "border-brand-primary bg-brand-secondary-soft"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
              value === "ODISEO"
                ? "border-brand-primary bg-brand-primary"
                : "border-slate-300"
            }`}>
              {value === "ODISEO" && (
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
          onClick={() => onChange("SISTEMA_INTEGRAL")}
          className={`rounded-lg border-2 p-4 text-left transition-all ${
            value === "SISTEMA_INTEGRAL"
              ? "border-brand-primary bg-brand-secondary-soft"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
              value === "SISTEMA_INTEGRAL"
                ? "border-brand-primary bg-brand-primary"
                : "border-slate-300"
            }`}>
              {value === "SISTEMA_INTEGRAL" && (
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
    </div>
  );
}

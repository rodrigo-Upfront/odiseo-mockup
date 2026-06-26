import { Copy, ChevronDown } from "lucide-react";

interface FormatoPlanoBadgeProps {
  value: string;
  wrappingType: 'POUCH' | 'BOLSA' | 'LAMINA';
  isLoading?: boolean;
  onCopy?: () => void;
  onShowDetails?: () => void;
}

export function FormatoPlanoBadge({
  value,
  wrappingType,
  isLoading = false,
  onCopy,
  onShowDetails,
}: FormatoPlanoBadgeProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    onCopy?.();
  };

  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
      <label className="text-sm font-semibold text-slate-700 block mb-2">
        Formato de Plano (Calculado automáticamente)
      </label>

      <div className="bg-white rounded border border-slate-200 p-3 mb-3">
        {isLoading ? (
          <div className="text-sm text-slate-500">Calculando...</div>
        ) : value ? (
          <code className="text-sm text-slate-900 block overflow-x-auto font-mono">
            {value}
          </code>
        ) : (
          <div className="text-sm text-slate-400 italic">
            Responde las preguntas de configuración para calcular el formato
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={!value}
          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Copiar formato al portapapeles"
        >
          <Copy size={14} />
          Copiar
        </button>
        <button
          onClick={onShowDetails}
          disabled={!value}
          className="flex items-center gap-1 text-xs px-3 py-1.5 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Ver detalles del formato calculado"
        >
          <ChevronDown size={14} />
          Ver detalles
        </button>
      </div>
    </div>
  );
}

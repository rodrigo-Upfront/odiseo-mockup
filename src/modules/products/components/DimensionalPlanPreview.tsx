type DimensionalPlanPreviewProps = {
  wrappingType: string;
  blueprintFormat: string;
  width: string;
  repeat: string;
  perimeterMm: string;
  dimensionCrossCheckStatus: string;
  perimeterValidationStatus: string;
};

const getWrappingTypeColor = (wrappingType: string): string => {
  const lower = wrappingType?.toLowerCase() || "";
  if (lower.includes("lamina")) return "#6366f1";
  if (lower.includes("bolsa")) return "#8b5cf6";
  if (lower.includes("pouch")) return "#ec4899";
  return "#64748b";
};

const getWrappingTypeLabel = (wrappingType: string): string => {
  const lower = wrappingType?.toLowerCase() || "";
  if (lower.includes("lamina")) return "LÁMINA";
  if (lower.includes("bolsa")) return "BOLSA";
  if (lower.includes("pouch")) return "POUCH";
  return "FORMATO";
};

const FormatDiagramSVG = ({
  wrappingType,
  width,
  repeat,
}: {
  wrappingType: string;
  width: string;
  repeat: string;
}) => {
  const w = parseFloat(width) || 200;
  const r = parseFloat(repeat) || 300;

  // Normalize dimensions for SVG viewport (max 280 x 220)
  const maxDim = Math.max(w, r);
  const scale = maxDim > 0 ? 200 / maxDim : 1;
  const svgW = Math.min(w * scale + 20, 280);
  const svgH = Math.min(r * scale + 40, 220);

  const rectW = w * scale;
  const rectH = r * scale;
  const startX = (svgW - rectW) / 2;
  const startY = (svgH - rectH) / 2;

  const lower = wrappingType?.toLowerCase() || "";
  const isLamina = lower.includes("lamina");

  return (
    <svg width="100%" height="220" viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto">
      {/* Grid background */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={svgW} height={svgH} fill="url(#grid)" />

      {isLamina ? (
        <>
          {/* Main format rectangle - LÁMINA */}
          <rect
            x={startX}
            y={startY}
            width={rectW}
            height={rectH}
            fill="#f0f9ff"
            stroke="#0284c7"
            strokeWidth="2"
          />

          {/* Design pattern inside - diagonal stripes for design area */}
          <defs>
            <pattern id="design" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="4" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
            </pattern>
          </defs>
          <rect
            x={startX + 10}
            y={startY + 10}
            width={Math.max(rectW - 20, 20)}
            height={Math.max(rectH - 20, 20)}
            fill="url(#design)"
            opacity="0.6"
          />

          {/* Width dimension - horizontal arrow */}
          <g>
            <line x1={startX - 10} y1={startY - 20} x2={startX + rectW + 10} y2={startY - 20} stroke="#475569" strokeWidth="1" />
            <path d={`M ${startX - 5} ${startY - 25} L ${startX - 10} ${startY - 20} L ${startX - 5} ${startY - 15}`} fill="none" stroke="#475569" strokeWidth="1" />
            <path d={`M ${startX + rectW + 5} ${startY - 25} L ${startX + rectW + 10} ${startY - 20} L ${startX + rectW + 5} ${startY - 15}`} fill="none" stroke="#475569" strokeWidth="1" />
            <text x={startX + rectW / 2} y={startY - 30} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">
              ANCHO
            </text>
          </g>

          {/* Repeat/Height dimension - vertical arrow */}
          <g>
            <line x1={startX - 30} y1={startY - 10} x2={startX - 30} y2={startY + rectH + 10} stroke="#475569" strokeWidth="1" />
            <path d={`M ${startX - 35} ${startY - 5} L ${startX - 30} ${startY - 10} L ${startX - 25} ${startY - 5}`} fill="none" stroke="#475569" strokeWidth="1" />
            <path d={`M ${startX - 35} ${startY + rectH + 5} L ${startX - 30} ${startY + rectH + 10} L ${startX - 25} ${startY + rectH + 5}`} fill="none" stroke="#475569" strokeWidth="1" />
            <text x={startX - 60} y={startY + rectH / 2} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold" transform={`rotate(-90 ${startX - 60} ${startY + rectH / 2})`}>
              REPETICIÓN
            </text>
          </g>
        </>
      ) : (
        <>
          {/* Generic pouch/bolsa representation */}
          <rect
            x={startX}
            y={startY}
            width={rectW}
            height={rectH}
            fill="#fdf2f8"
            stroke="#be185d"
            strokeWidth="2"
            rx="4"
          />
          <circle cx={startX + rectW / 2} cy={startY + 15} r="4" fill="#be185d" opacity="0.6" />
          <line x1={startX + 15} y1={startY + rectH / 2} x2={startX + rectW - 15} y2={startY + rectH / 2} stroke="#be185d" strokeWidth="1" opacity="0.4" />
        </>
      )}
    </svg>
  );
};

export default function DimensionalPlanPreview({
  wrappingType,
  blueprintFormat,
  width,
  repeat,
  perimeterMm,
  dimensionCrossCheckStatus,
  perimeterValidationStatus,
}: DimensionalPlanPreviewProps) {
  const wrapColor = getWrappingTypeColor(wrappingType);
  const wrapLabel = getWrappingTypeLabel(wrappingType);

  const getCrossCheckColor = (status: string): string => {
    if (status === "OK") return "#10b981";
    if (status === "NO_OK") return "#ef4444";
    return "#9ca3af";
  };

  const getPerimeterColor = (status: string): string => {
    if (status === "Validado") return "#10b981";
    if (status === "No validado") return "#f59e0b";
    return "#9ca3af";
  };

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      {/* Wrapping Type Badge */}
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: wrapColor }}
        >
          {wrapLabel[0]}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">TIPO DE ENVOLTURA</p>
          <p className="text-sm font-bold text-slate-900">{wrapLabel}</p>
        </div>
      </div>

      {/* Blueprint Format */}
      <div className="rounded-lg bg-slate-50 px-4 py-3 border border-slate-200">
        <p className="text-xs font-semibold text-slate-600">FORMATO DE PLANO</p>
        <p className="mt-1 text-sm font-bold text-slate-900">{blueprintFormat || "No seleccionado"}</p>
      </div>

      {/* Dimensional Diagram */}
      <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold text-slate-600">DIAGRAMA DIMENSIONAL</p>
        <FormatDiagramSVG wrappingType={wrappingType} width={width} repeat={repeat} />
      </div>

      {/* Dimension Values */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 px-3 py-2 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600">ANCHO</p>
          <p className="text-sm font-bold text-slate-900">{width || "—"} mm</p>
        </div>
        <div className="rounded-lg bg-blue-50 px-3 py-2 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600">REPETICIÓN</p>
          <p className="text-sm font-bold text-slate-900">{repeat || "—"} mm</p>
        </div>
      </div>

      {/* Validations & Perimeter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-xs font-semibold text-slate-600">VALIDACIÓN DE DIMENSIONES (CROSS CHECK)</span>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white ${
              dimensionCrossCheckStatus === "OK" ? "bg-green-500" : "bg-slate-400"
            }`}
          >
            {dimensionCrossCheckStatus === "OK" ? "✓" : "—"}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-xs font-semibold text-slate-600">VALIDACIÓN DE PERÍMETROS</span>
          <div
            className={`rounded px-2 py-1 text-xs font-bold text-white ${
              perimeterValidationStatus === "Validado"
                ? "bg-green-500"
                : perimeterValidationStatus === "No validado"
                  ? "bg-amber-500"
                  : "bg-slate-400"
            }`}
          >
            {perimeterValidationStatus || "Sin validar"}
          </div>
        </div>

        <div className="rounded-lg border-l-4 border-slate-300 bg-slate-50 px-3 py-2" style={{ borderLeftColor: wrapColor }}>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-600">PERÍMETRO CALCULADO</span>
            <span className="text-lg font-bold text-slate-900">{perimeterMm || "—"}</span>
          </div>
          <p className="text-xs text-slate-500">mm</p>
        </div>
      </div>
    </div>
  );
}

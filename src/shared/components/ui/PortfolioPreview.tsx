type PreviewItem = {
  label: string;
  value?: string;
};

type PortfolioPreviewProps = {
  codigo: string;
  completionPercentage: number;
  items: PreviewItem[];
  title?: string;
  subtitle?: string;
  emptyStateText?: string;
  emptyStateIcon?: string;
  className?: string;
};

function PreviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-2 border-b border-slate-100 pb-1 last:border-0">
      <span className="text-xs font-bold uppercase text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value || "—"}</span>
    </div>
  );
}

export default function PortfolioPreview({
  codigo,
  completionPercentage,
  items,
  title = "Vista rápida",
  subtitle = "Resumen del portafolio.",
  emptyStateText = "Complete identificación para previsualizar",
  emptyStateIcon = "◧",
  className = "",
}: PortfolioPreviewProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {title}
          </h3>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>

        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          {completionPercentage}%
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <PreviewRow label="Código" value={codigo} />
        {items.map((item, index) => (
          <PreviewRow key={index} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
}

export { PreviewRow };
export type { PreviewItem };

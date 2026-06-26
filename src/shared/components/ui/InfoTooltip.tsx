import { Info } from "lucide-react";
import { useState } from "react";

interface InfoTooltipProps {
  title?: string;
  content: string;
  className?: string;
}

export default function InfoTooltip({
  title = "Información",
  content,
  className = "",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={title}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 transition-colors hover:border-brand-primary hover:text-brand-primary"
      >
        <Info size={13} />
      </button>

      {open && (
        <span className="absolute left-1/2 top-7 z-50 w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs font-medium leading-relaxed text-slate-600 shadow-lg">
          {content}
        </span>
      )}
    </span>
  );
}

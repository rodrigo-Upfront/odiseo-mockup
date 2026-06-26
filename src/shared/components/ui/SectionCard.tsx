import type { ReactNode } from "react";
import SectionBadge from "./SectionBadge";
import InfoTooltip from "./InfoTooltip";

type SectionStatus = "pending" | "completed" | "error";

interface SectionCardProps {
  number: number;
  title: string;
  subtitle?: string;
  status: SectionStatus;
  icon?: string;
  color?: string;
  children: ReactNode;
  required?: boolean;
  infoTitle?: string;
  infoContent?: string;
}

export default function SectionCard({
  number,
  title,
  subtitle,
  status,
  icon,
  color = "#00395A",
  children,
  required = false,
  infoTitle,
  infoContent,
}: SectionCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5" style={{ borderLeftColor: color, borderLeftWidth: "3px" }}>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-[13px] font-semibold text-slate-900 leading-tight">{title}</h3>
              {required && <span className="text-[10px] text-red-600">*</span>}
              {infoContent && (
                <InfoTooltip title={infoTitle || title} content={infoContent} />
              )}
            </div>
            {subtitle && (
              <p className="mt-0 text-[11px] text-slate-400 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <SectionBadge status={status} />
        </div>
      </div>
      <div className="px-3 py-3">{children}</div>
    </div>
  );
}

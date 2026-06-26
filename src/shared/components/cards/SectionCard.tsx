import { type ReactNode } from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  headerAction?: ReactNode;
}

export default function SectionCard({
  title,
  subtitle,
  children,
  className = "",
  noPadding = false,
  headerAction,
}: SectionCardProps) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
        {headerAction && <div className="ml-4">{headerAction}</div>}
      </div>
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}

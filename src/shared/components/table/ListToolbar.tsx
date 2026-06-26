import type { ReactNode } from "react";

interface ListToolbarProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  filters?: ReactNode;
}

export default function ListToolbar({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  leftActions,
  rightActions,
  filters,
}: ListToolbarProps) {
  return (
    <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {leftActions}

          {onSearchChange && (
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-64 rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
          )}

          {rightActions}
        </div>
      </div>

      {filters && (
        <div className="border-t border-slate-100 pt-3">{filters}</div>
      )}
    </div>
  );
}

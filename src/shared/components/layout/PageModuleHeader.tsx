import type { ReactNode } from "react";

interface PageModuleHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: {
    onClick: () => void;
    label?: string;
  };
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  badges?: ReactNode;
  progress?: {
    percentage: number;
    label: string;
  };
  children?: ReactNode;
}

export default function PageModuleHeader({
  title,
  subtitle,
  backButton,
  breadcrumbs,
  badges,
  progress,
  children,
}: PageModuleHeaderProps) {
  return (
    <div className="mb-5 border-b border-slate-200 bg-white px-1 pb-5">
      {breadcrumbs && (
        <div className="mb-3 text-xs font-semibold text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              {index > 0 && (
                <span className="mx-2 text-slate-400">&gt;&gt;</span>
              )}
              {crumb.href ? (
                <span className="cursor-pointer hover:underline" style={{ color: "#00395A" }}>
                  {crumb.label}
                </span>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {backButton && (
              <button
                type="button"
                onClick={backButton.onClick}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                title={backButton.label || "Volver"}
              >
                ←
              </button>
            )}

            <h1 className="text-2xl font-extrabold uppercase tracking-wide text-slate-800">
              {title}
            </h1>

            {badges}
          </div>

          {subtitle && (
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          )}
        </div>

        {progress && (
          <div className="min-w-[220px] text-right">
            <div className="text-xs font-bold text-amber-600">
              {progress.label}
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-amber-500 transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

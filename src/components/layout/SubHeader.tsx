// src/components/layout/SubHeader.tsx

import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

interface Breadcrumb {
  label: string
  href?: string
  path?: string
}

interface SubHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  tabs?: ReactNode
  toolbar?: ReactNode
  breadcrumbs?: Breadcrumb[]
  badges?: ReactNode
  progress?: {
    percentage: number
    label: string
  }
}

const SubHeader = ({
  title,
  subtitle,
  actions,
  tabs,
  toolbar,
  breadcrumbs,
  badges,
  progress,
}: SubHeaderProps) => {
  /**
   * Modo nuevo:
   * Si existe toolbar, el toolbar ES TODO el subheader.
   * No se renderiza title/subtitle arriba para evitar duplicidad visual.
   */
  if (toolbar) {
    return (
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-gray-50/95 px-6 py-4 shadow-sm backdrop-blur">
        {toolbar}

        {tabs && (
          <div className="mt-4 flex gap-6 border-t border-slate-100 pt-3 text-sm font-medium text-slate-500">
            {tabs}
          </div>
        )}
      </div>
    )
  }

  /**
   * Modo clásico:
   * Para módulos que todavía no usan toolbar.
   */
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div className="px-8 py-5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center text-xs font-medium text-slate-500">
            <Link
              to="/inicio"
              className="transition-colors hover:text-brand-primary"
            >
              Inicio
            </Link>

            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1
              const to = crumb.href ?? crumb.path

              return (
                <div key={`${crumb.label}-${idx}`} className="flex items-center">
                  <ChevronRight size={12} className="mx-1 text-slate-400" />

                  {to && !isLast ? (
                    <Link
                      to={to}
                      className="transition-colors hover:text-brand-primary"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? "font-semibold text-brand-primary"
                          : "text-slate-500"
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </div>
              )
            })}
          </nav>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
                {title || "Inicio"}
              </h1>

              {badges && <div className="flex items-center gap-2">{badges}</div>}
            </div>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}

            {progress && (
              <div className="mt-3 max-w-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{progress.label}</span>
                  <span className="font-semibold text-slate-700">
                    {progress.percentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-primary transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(progress.percentage, 0),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-3">{actions}</div>
          )}
        </div>
      </div>

      {tabs && (
        <div className="flex gap-6 border-t border-slate-100 px-8 pt-3 text-sm font-medium text-slate-500">
          {tabs}
        </div>
      )}
    </div>
  )
}

export default SubHeader
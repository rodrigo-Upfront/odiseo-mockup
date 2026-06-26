import type { ReactNode } from "react";
import InfoTooltip from "../ui/InfoTooltip";

type FormCardProps = {
  title: string;
  icon: string;
  color: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  infoTitle?: string;
  infoContent?: string;
  action?: ReactNode;
};

export default function FormCard({
  title,
  icon,
  color,
  required = false,
  children,
  className = "",
  contentClassName = "",
  headerClassName = "",
  infoTitle,
  infoContent,
  action,
}: FormCardProps) {
  return (
    <section
      className={`overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div
        className={`flex items-center justify-between border-b border-slate-100 px-5 py-4 ${headerClassName}`}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {icon}
          </span>

          <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
            {title}
          </h2>

          {infoContent && (
            <InfoTooltip title={infoTitle || title} content={infoContent} />
          )}
        </div>

        <div className="flex items-center gap-3">
          {action && <div>{action}</div>}
          {required && <span className="text-red-500">*</span>}
        </div>
      </div>

      <div className={`p-5 ${contentClassName}`}>{children}</div>
    </section>
  );
}

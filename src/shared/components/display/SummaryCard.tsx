import type { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  colorClass?: string;
}

export default function SummaryCard({
  title,
  value,
  icon,
  subtitle,
  colorClass = "text-brand-primary",
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
        {icon && <div className={`p-2 rounded-lg bg-gray-50 ${colorClass}`}>{icon}</div>}
      </div>
      <div className="flex-1">
        <div className={`text-3xl font-extrabold ${colorClass}`}>{value}</div>
        {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}

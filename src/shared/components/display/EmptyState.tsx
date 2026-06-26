import { type ReactNode } from "react";
import { Search, InboxIcon, AlertCircle } from "lucide-react";

type EmptyStateType = "search" | "no-data" | "error";

interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  type = "no-data",
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case "search":
        return <Search size={48} className="text-slate-400" />;
      case "error":
        return <AlertCircle size={48} className="text-red-400" />;
      default:
        return <InboxIcon size={48} className="text-slate-400" />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 px-6 ${className}`}>
      <div className="mb-4">{icon || getDefaultIcon()}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-600 text-center mb-6 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

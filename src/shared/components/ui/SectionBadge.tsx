type SectionStatus = "pending" | "completed" | "error";

interface SectionBadgeProps {
  status: SectionStatus;
}

export default function SectionBadge({ status }: SectionBadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";

  const statusStyles = {
    pending: "bg-slate-100 text-slate-600",
    completed: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
  };

  const labels = {
    pending: "Pendiente",
    completed: "Completado",
    error: "Requiere atención",
  };

  return (
    <span className={`${baseClasses} ${statusStyles[status]}`}>
      {labels[status]}
    </span>
  );
}

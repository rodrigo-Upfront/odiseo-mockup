import { type ReactNode } from "react";

type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "approved"
  | "observed"
  | "rejected"
  | "neutral";

interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({
  status,
  label,
  icon,
  size = "md",
}: StatusBadgeProps) {
  const getStatusClass = () => {
    switch (status) {
      case "success":
      case "approved":
        return "bg-green-100 text-green-700";
      case "warning":
      case "observed":
        return "bg-orange-100 text-orange-700";
      case "error":
      case "rejected":
        return "bg-red-100 text-red-700";
      case "info":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1 text-sm";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${getSizeClass()} ${getStatusClass()}`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}

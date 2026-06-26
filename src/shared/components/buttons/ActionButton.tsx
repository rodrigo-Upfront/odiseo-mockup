import { type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "success" | "warning" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ActionButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  title?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export default function ActionButton({
  label,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  title,
  leftIcon,
  rightIcon,
  fullWidth = false,
}: ActionButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case "secondary":
        return "bg-slate-200 text-slate-900 hover:bg-slate-300";
      case "outline":
        return "border border-slate-300 text-slate-700 hover:bg-slate-50";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700";
      case "success":
        return "bg-emerald-600 text-white hover:bg-emerald-700";
      case "warning":
        return "bg-amber-600 text-white hover:bg-amber-700";
      case "ghost":
        return "text-slate-600 hover:bg-slate-100";
      default:
        return "bg-brand-primary text-white hover:bg-brand-primary-hover";
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-xs rounded-md";
      case "lg":
        return "px-6 py-3 text-base rounded-xl";
      case "icon":
        return "h-10 w-10 p-0 rounded-lg";
      default:
        return "px-4 py-2 text-sm rounded-lg";
    }
  };

  const displayIcon = icon || leftIcon;
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`${baseClasses} gap-2 ${getSizeClass()} ${getVariantClass()} ${widthClass} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {displayIcon && !loading && <span>{displayIcon}</span>}
      {label}
      {rightIcon && !loading && <span>{rightIcon}</span>}
    </button>
  );
}

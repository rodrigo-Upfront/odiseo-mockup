import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const AMCOR_COLORS = {
  navy: "#00395A",
  navyHover: "#002b43",
  blue: "#00A1DE",
  blueHover: "#186bb5",
  green: "#27ae60",
  greenHover: "#219653",
  red: "#e74c3c",
  redHover: "#c0392b",
  amber: "#f39c12",
  amberHover: "#d68910",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  disabled,
  style,
  ...props
}: ButtonProps) {
  
  const baseClasses = "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-10 px-4 text-sm rounded-lg",
    lg: "h-12 px-6 text-base rounded-xl",
    icon: "h-10 w-10 rounded-lg",
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return { backgroundColor: AMCOR_COLORS.navy, color: "white" };
      case "secondary":
        return { backgroundColor: AMCOR_COLORS.blue, color: "white" };
      case "success":
        return { backgroundColor: AMCOR_COLORS.green, color: "white" };
      case "danger":
        return { backgroundColor: AMCOR_COLORS.red, color: "white" };
      case "warning":
        return { backgroundColor: AMCOR_COLORS.amber, color: "white" };
      case "outline":
        return { backgroundColor: "transparent", color: AMCOR_COLORS.navy, border: `1px solid ${AMCOR_COLORS.navy}` };
      case "ghost":
        return { backgroundColor: "transparent", color: AMCOR_COLORS.navy };
      default:
        return { backgroundColor: AMCOR_COLORS.navy, color: "white" };
    }
  };

  const variantStyles = getVariantStyles();

  // Custom hover logic via classes where possible, or rely on tailwind defaults for standard cases if we can't inject hover into inline styles easily.
  // Given we use custom hex colors, inline styles are best for base, but tailwind is better for hover. We'll simulate hover using an overlay approach or just rely on CSS variables if we had them.
  // For simplicity, we'll use Tailwind arbitrary values in className combined with the style prop.
  
  let tailwindVariantClass = "";
  if (variant === "primary") tailwindVariantClass = "hover:bg-brand-primary-hover focus:ring-brand-primary";
  if (variant === "secondary") tailwindVariantClass = "hover:bg-[#186bb5] focus:ring-[#00A1DE]";
  if (variant === "success") tailwindVariantClass = "hover:bg-[#219653] focus:ring-[#27ae60]";
  if (variant === "danger") tailwindVariantClass = "hover:bg-[#c0392b] focus:ring-[#e74c3c]";
  if (variant === "warning") tailwindVariantClass = "hover:bg-[#d68910] focus:ring-[#f39c12]";
  if (variant === "outline") tailwindVariantClass = "hover:bg-slate-50 focus:ring-brand-primary";
  if (variant === "ghost") tailwindVariantClass = "hover:bg-slate-100 focus:ring-slate-300";

  const classes = [
    baseClasses,
    sizeClasses[size],
    tailwindVariantClass,
    fullWidth ? "w-full" : "",
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      className={classes}
      style={{ ...variantStyles, ...style }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
      
      {children}
      
      {!isLoading && rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
    </button>
  );
}

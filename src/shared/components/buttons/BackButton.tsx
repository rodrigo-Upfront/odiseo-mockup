import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackPath?: string;
  label?: string;
}

export default function BackButton({ fallbackPath, label = "Atrás" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      navigate(-1);
    } else if (fallbackPath) {
      // Fall back to a specific path if no history
      navigate(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary rounded-lg hover:bg-slate-100 transition-colors"
      title={label}
    >
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
}

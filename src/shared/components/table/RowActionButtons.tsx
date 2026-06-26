import { useNavigate } from "react-router-dom";

interface RowActionButtonsProps {
  viewPath: string;
  editPath: string;
  size?: "sm" | "md";
}

export default function RowActionButtons({
  viewPath,
  editPath,
  size = "sm",
}: RowActionButtonsProps) {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: "px-2 py-1 text-[11px]",
    md: "px-3 py-1.5 text-xs",
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => navigate(viewPath)}
        className={`rounded-md border border-slate-300 bg-white font-bold text-brand-primary transition-colors hover:border-brand-primary hover:bg-[#f6f8fb] ${sizeClasses[size]}`}
        title="Ver detalle"
      >
        Ver
      </button>

      <button
        type="button"
        onClick={() => navigate(editPath)}
        className={`rounded-md border border-brand-primary bg-brand-primary font-bold text-white transition-colors hover:bg-brand-primary-hover ${sizeClasses[size]}`}
        title="Editar"
      >
        Editar
      </button>
    </div>
  );
}

import { type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  backPath,
  actions,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4 flex-1">
          {showBackButton && (
            <button
              onClick={() => {
                if (backPath) {
                  navigate(backPath);
                } else {
                  navigate(-1);
                }
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Volver"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}

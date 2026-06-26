import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ModuleBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function ModuleBreadcrumb({ items }: ModuleBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 px-6 py-3 bg-slate-50 border-b border-slate-200 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={16} className="text-slate-400" />}
          {item.href ? (
            <Link to={item.href} className="text-blue-600 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

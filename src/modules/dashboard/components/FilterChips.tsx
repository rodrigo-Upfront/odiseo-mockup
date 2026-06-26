import { useNavigate } from "react-router-dom";

interface FilterChipsProps {
  label: string;
  items: string[];
  onSelect?: (item: string) => void;
  onViewAll?: () => void;
}

export default function FilterChips({
  label,
  items,
  onSelect,
  onViewAll,
}: FilterChipsProps) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    onViewAll?.();
    navigate("/portfolio");
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 4).map((item) => (
          <button
            key={item}
            onClick={() => onSelect?.(item)}
            className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700 cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            {item}
          </button>
        ))}
        <button
          onClick={handleViewAll}
          className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-400 cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-colors"
        >
          + Ver más
        </button>
      </div>
    </div>
  );
}

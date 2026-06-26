import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <ChevronDown
          size={20}
          className={`text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && <div className="px-6 py-4">{children}</div>}
    </div>
  );
}

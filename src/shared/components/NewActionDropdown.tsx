import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Plus } from "lucide-react";

export type NewActionOption = {
  label: string;
  description: string;
  enabled: boolean;
  icon: ReactNode;
  onClick: () => void;
};

interface NewActionDropdownProps {
  options: NewActionOption[];
}

export default function NewActionDropdown({
  options,
}: NewActionDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#003B5C] px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#00567f] hover:shadow-md"
      >
        <Plus size={17} />
        Nuevo
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[52px] z-50 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              Crear nuevo
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Selecciona qué deseas iniciar.
            </p>
          </div>

          <div className="p-2">
            {options.map((option) => (
              <button
                key={option.label}
                type="button"
                disabled={!option.enabled}
                onClick={option.enabled ? option.onClick : undefined}
                title={
                  option.enabled
                    ? option.description
                    : "Opción no disponible con el contexto actual."
                }
                className={[
                  "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                  option.enabled
                    ? "text-slate-700 hover:bg-slate-50"
                    : "cursor-not-allowed text-slate-400 opacity-60",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    option.enabled
                      ? "bg-[#003B5C]/10 text-[#003B5C]"
                      : "bg-slate-100 text-slate-400",
                  ].join(" ")}
                >
                  {option.icon}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>

                  <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                    {option.description}
                  </span>

                  {!option.enabled && (
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      No disponible
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

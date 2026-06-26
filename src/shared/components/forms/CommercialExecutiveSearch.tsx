import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { getCommercialExecutives } from "../../data/userStorage";

interface CommercialExecutiveSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (executiveId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export default function CommercialExecutiveSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Escribe para buscar ejecutivo...",
  disabled = false,
  error,
  label,
}: CommercialExecutiveSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const executives = useMemo(() => getCommercialExecutives(), []);

  const filteredExecutives = useMemo(() => {
    const search = value.trim().toLowerCase();
    if (!search) return [];

    return executives.filter((executive) => {
      const searchableText = [
        executive.code,
        executive.fullName,
        executive.email,
        executive.workerCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [value, executives]);

  const selectedExecutive = executives.find((e) => e.id === value);

  const handleSelect = (executiveId: string) => {
    onChange(executiveId);
    onSelect?.(executiveId);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={
              selectedExecutive
                ? `${selectedExecutive.code} - ${selectedExecutive.fullName}`
                : value
            }
            onChange={(e) => {
              const inputValue = e.target.value;
              if (selectedExecutive) {
                onChange("");
              } else {
                onChange(inputValue);
              }
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full rounded-lg border bg-white py-2 pl-9 pr-9 text-sm shadow-sm outline-none transition-colors placeholder:text-slate-400 ${
              disabled
                ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                : error
                  ? "border-red-300 text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-slate-200 text-slate-700 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            }`}
          />
          {selectedExecutive && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isOpen && value && !selectedExecutive && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {filteredExecutives.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredExecutives.map((executive) => (
                    <button
                      key={executive.id}
                      type="button"
                      onClick={() => handleSelect(executive.id)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-semibold text-slate-900">
                        {executive.fullName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {executive.code} • {executive.email}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No se encontraron ejecutivos comerciales
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!selectedExecutive && executives.length > 0 && !isOpen && (
        <p className="text-xs text-slate-500">
          {executives.length} ejecutivo(s) disponible(s)
        </p>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { getCommercialExecutives } from "../../data/userStorage";

interface CommercialExecutiveMultiSearchProps {
  value: string[]; // Array de IDs de ejecutivos
  onChange: (value: string[]) => void;
  onSelect?: (executiveIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export default function CommercialExecutiveMultiSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Escribe para buscar ejecutivo...",
  disabled = false,
  error,
  label,
}: CommercialExecutiveMultiSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const executives = useMemo(() => getCommercialExecutives(), []);

  const selectedExecutives = useMemo(() => {
    return executives.filter((executive) => value.includes(executive.id));
  }, [value, executives]);

  const filteredExecutives = useMemo(() => {
    const search = searchValue.trim().toLowerCase();
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

      return searchableText.includes(search) && !value.includes(executive.id);
    });
  }, [searchValue, executives, value]);

  const handleSelect = (executiveId: string) => {
    const newValues = [...value, executiveId];
    onChange(newValues);
    onSelect?.(newValues);
    setSearchValue("");
    setIsOpen(false);
  };

  const handleRemove = (executiveId: string) => {
    const newValues = value.filter((id) => id !== executiveId);
    onChange(newValues);
    onSelect?.(newValues);
  };

  const handleSearchChange = (inputValue: string) => {
    setSearchValue(inputValue);
    setIsOpen(true);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      {/* Ejecutivos seleccionados */}
      {selectedExecutives.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedExecutives.map((executive) => (
            <div
              key={executive.id}
              className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 text-sm"
            >
              <span className="font-medium text-brand-primary">
                {executive.fullName}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(executive.id)}
                disabled={disabled}
                className="text-brand-primary hover:text-brand-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Campo de búsqueda */}
      <div className="relative">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedExecutives.length > 0 ? "Agregar otro ejecutivo..." : placeholder}
            disabled={disabled}
            className={`w-full rounded-lg border bg-white py-2 pl-9 pr-9 text-sm shadow-sm outline-none transition-colors placeholder:text-slate-400 ${
              disabled
                ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                : error
                  ? "border-red-300 text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-slate-200 text-slate-700 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            }`}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown de resultados */}
        {isOpen && searchValue && (
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
                  {executives.some(e => !value.includes(e.id)) 
                    ? "No se encontraron ejecutivos comerciales" 
                    : "Todos los ejecutivos ya están seleccionados"}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      
      {!disabled && (
        <p className="text-xs text-slate-500">
          {selectedExecutives.length} ejecutivo(s) seleccionado(s) • {executives.length - selectedExecutives.length} disponible(s)
        </p>
      )}
    </div>
  );
}

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, AlertCircle } from "lucide-react";
import { searchSistemaIntegralUsers, type VendorMirror } from "../../data/vendorMirrorStorage";

interface SystemIntegrationUserSearchProps {
  onSelect: (vendor: VendorMirror) => void;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  onNoResults?: (hasNoResults: boolean) => void;
}

export default function SystemIntegrationUserSearch({
  onSelect,
  value,
  onChange,
  error,
  placeholder = "Buscar por código o nombre...",
  disabled = false,
  onNoResults,
}: SystemIntegrationUserSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!value.trim()) return [];
    return searchSistemaIntegralUsers(value).slice(0, 8);
  }, [value]);

  useEffect(() => {
    if (onNoResults) {
      onNoResults(value.trim() !== "" && results.length === 0);
    }
  }, [value, results.length, onNoResults]);

  const handleSelectResult = (vendor: VendorMirror) => {
    onSelect(vendor);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key === "ArrowDown") {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Usuario Sistema Integral *
      </label>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => value && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border px-9 py-2 text-sm transition-colors outline-none
            ${
              error
                ? "border-red-300 bg-red-50 text-red-900 placeholder:text-red-400"
                : "border-slate-200 bg-white text-slate-700 placeholder:text-slate-400"
            }
            ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-400" : "focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"}`}
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {isOpen && value && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-slate-200 bg-white shadow-lg max-h-80 overflow-y-auto">
          {results.map((vendor, index) => (
            <button
              key={vendor.id}
              type="button"
              onClick={() => handleSelectResult(vendor)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${
                index === selectedIndex ? "bg-brand-secondary-soft" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700">{vendor.code}</p>
                    <p className="font-semibold text-slate-900 text-sm">{vendor.name}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                    vendor.status === "Activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {vendor.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && value && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-slate-200 bg-white shadow-lg p-4 text-center">
          <p className="text-sm text-slate-500">
            No se encontraron usuarios en el Sistema Integral.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Podrás registrar los datos manualmente.
          </p>
        </div>
      )}
    </div>
  );
}

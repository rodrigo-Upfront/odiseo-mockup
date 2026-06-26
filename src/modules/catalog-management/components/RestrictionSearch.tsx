import { useState, useMemo, useRef, useEffect } from "react";
import { Search, AlertCircle } from "lucide-react";
import { getAvailableRestrictions } from "../services/catalogRestrictionService";
import type { RestrictionItem } from "../types/catalogRestriction.types";

interface RestrictionSearchProps {
  onSelect: (restriction: RestrictionItem) => void;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function RestrictionSearch({
  onSelect,
  value,
  onChange,
  error,
  placeholder = "Buscar restricción...",
  disabled = false,
}: RestrictionSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const restrictions = getAvailableRestrictions();
  const results = useMemo(() => {
    if (!value.trim()) return [];
    const searchTerm = value.toLowerCase();
    return restrictions.filter((r) => r.name.toLowerCase().includes(searchTerm));
  }, [value, restrictions]);

  const handleSelectResult = (restriction: RestrictionItem) => {
    onSelect(restriction);
    onChange(restriction.name);
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
      <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">
        Restricción a actualizar *
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
            ${
              disabled
                ? "cursor-not-allowed bg-slate-50 text-slate-400"
                : "focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            }`}
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
          {results.map((restriction, index) => (
            <button
              key={restriction.id}
              type="button"
              onClick={() => handleSelectResult(restriction)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${
                index === selectedIndex ? "bg-brand-secondary-soft" : "hover:bg-slate-50"
              }`}
            >
              <p className="font-semibold text-slate-900 text-sm">{restriction.name}</p>
            </button>
          ))}
        </div>
      )}

      {isOpen && value && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-slate-200 bg-white shadow-lg p-4 text-center">
          <p className="text-sm text-slate-500">No se encontró la restricción.</p>
        </div>
      )}
    </div>
  );
}

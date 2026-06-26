import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";

export type SmartCatalogOption = {
  id: number | string;
  code: string;
  name: string;
  meta?: string;
};

type SmartCatalogSearchProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SmartCatalogOption[];
  placeholder?: string;
  error?: string;
  emptyMessage?: string;
};

export default function SmartCatalogSearch({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  error,
  emptyMessage,
}: SmartCatalogSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => String(option.id) === value);

  const [query, setQuery] = useState(selectedOption?.name || "");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Sincronizar query con el valor del padre cuando hay una selección
  useEffect(() => {
    if (selectedOption) {
      setQuery(selectedOption.name);
    } else if (!value && query.trim() === "") {
      // Solo limpiar si tanto value como query están vacíos
      setQuery("");
    }
  }, [value, selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const dropdownHeight = 256; // max-h-64 = 16rem = 256px

      const shouldOpenUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      if (shouldOpenUp) {
        setDropdownPosition("top");
        setDropdownStyle({
          position: "fixed",
          bottom: viewportHeight - rect.top,
          left: rect.left,
          width: rect.width,
          maxHeight: "256px",
          zIndex: 9999,
        });
      } else {
        setDropdownPosition("bottom");
        setDropdownStyle({
          position: "fixed",
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
          maxHeight: "256px",
          zIndex: 9999,
        });
      }
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = [option.name, option.code, option.meta]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchableText.includes(search);
    });
  }, [options, query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange("");
    setSelectedIndex(-1);

    if (newValue.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          selectOption(filteredOptions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const selectOption = (option: SmartCatalogOption) => {
    onChange(String(option.id));
    setQuery(option.name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const showDropdown = isOpen && (query.trim().length === 0 || filteredOptions.length > 0);

  return (
    <div className="relative" ref={wrapperRef}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </span>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm shadow-sm outline-none transition-colors ${
            error
              ? "border-red-300 text-red-900 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-200 text-slate-700 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          } placeholder:text-slate-400`}
        />
      </div>

      {showDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={`block w-full border-b border-slate-100 px-3 py-2 text-left transition-colors last:border-0 ${
                    index === selectedIndex
                      ? "bg-brand-secondary-soft"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-800">
                    {option.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {option.code}
                    {option.meta ? ` · ${option.meta}` : ""}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-amber-700 bg-amber-50">
                {emptyMessage || "No se encontraron resultados."}
              </div>
            )}
          </div>,
          document.body
        )}

      {error && (
        <span className="mt-1 block text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
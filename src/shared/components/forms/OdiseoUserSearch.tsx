import { useState, useMemo, useRef, useEffect } from "react";
import { Search, AlertCircle, X } from "lucide-react";
import { searchOdiseoUsers, type User, ROLE_LABELS } from "../../data/userStorage";

interface OdiseoUserSearchProps {
  onSelect: (user: User) => void;
  value: string;
  onChange: (value: string) => void;
  selectedUser?: User | null;
  onClear?: () => void;
  onCreateNew?: () => void;
  onConfirmNew?: (name: string) => void;
  confirmedNew?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function OdiseoUserSearch({
  onSelect,
  value,
  onChange,
  selectedUser,
  onClear,
  onCreateNew,
  onConfirmNew,
  confirmedNew,
  error,
  placeholder = "Buscar usuario ODISEO por nombre, correo, código...",
  disabled = false,
}: OdiseoUserSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!value.trim()) return [];
    return searchOdiseoUsers(value).slice(0, 8);
  }, [value]);

  const handleSelectResult = (user: User) => {
    onSelect(user);
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
        Usuario ODISEO *
      </label>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        {(selectedUser || confirmedNew) && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClear?.();
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        <input
          ref={inputRef}
          type="text"
          value={selectedUser ? `${selectedUser.fullName} (${selectedUser.code})` : value}
          onChange={(e) => {
            if (!selectedUser && !confirmedNew) {
              onChange(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!selectedUser && !confirmedNew && value) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled || !!selectedUser || confirmedNew}
          className={`w-full rounded-lg border px-9 py-2 text-sm transition-colors outline-none
            ${
              error
                ? "border-red-300 bg-red-50 text-red-900 placeholder:text-red-400"
                : "border-slate-200 bg-white text-slate-700 placeholder:text-slate-400"
            }
            ${
              disabled || selectedUser || confirmedNew
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

      {!selectedUser && !confirmedNew && isOpen && value && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-red-200 bg-white shadow-lg max-h-80 overflow-y-auto">
          <div className="sticky top-0 bg-red-50 border-b border-red-200 px-4 py-2">
            <p className="text-xs font-semibold text-red-700 flex items-center gap-2">
              <span>⚠</span> Este usuario ya existe en ODISEO
            </p>
          </div>
          {results.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectResult(user)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${
                index === selectedIndex ? "bg-brand-secondary-soft" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{user.fullName}</p>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                    <span>{user.workerCode}</span>
                    <span>•</span>
                    <span>{user.area || "Sin área"}</span>
                    <span>•</span>
                    <span>{ROLE_LABELS[user.role]}</span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap mt-1 bg-blue-100 text-blue-700">
                  {user.code}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!selectedUser && !confirmedNew && isOpen && value && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-slate-200 bg-white shadow-lg p-4">
          <div className="text-center mb-4">
            <p className="text-sm font-semibold text-slate-700 flex items-center justify-center gap-2">
              <span className="text-green-500">✓</span> Usuario no encontrado en ODISEO
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Puede continuar con el registro de este nuevo usuario.
            </p>
          </div>
          {(onConfirmNew || onCreateNew) && (
            <button
              type="button"
              onClick={() => {
                if (onConfirmNew) {
                  onConfirmNew(value);
                } else if (onCreateNew) {
                  onCreateNew();
                  onChange("");
                }
              }}
              className="w-full rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors"
            >
              Confirmar como nuevo usuario ODISEO
            </button>
          )}
        </div>
      )}
    </div>
  );
}

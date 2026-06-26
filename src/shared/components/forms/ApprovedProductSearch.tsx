import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { searchApprovedProducts, type ApprovedProduct } from "../../data/approvedProductStorage";

interface ApprovedProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: ApprovedProduct) => void;
  portfolioCode?: string;
  productType?: "base" | "approved" | "portfolio_standard";
  placeholder?: string;
  disabled?: boolean;
}

export default function ApprovedProductSearch({
  value,
  onChange,
  onSelect,
  portfolioCode,
  productType,
  placeholder = "Buscar producto por código o nombre...",
  disabled = false,
}: ApprovedProductSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!value.trim() || !portfolioCode) return [];
    return searchApprovedProducts(value, portfolioCode, productType).slice(0, 8);
  }, [value, portfolioCode, productType]);

  const handleSelectResult = (product: ApprovedProduct) => {
    onChange(product.name);
    onSelect(product);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => value && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border px-9 py-2 text-sm transition-colors outline-none ${
            disabled
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-300 bg-white text-slate-700 placeholder:text-slate-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          }`}
          autoComplete="off"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && value && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {results.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {results.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectResult(product)}
                    className="w-full px-4 py-3 text-left transition hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">
                          {product.code}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {product.name}
                        </p>
                        <div className="mt-1 pt-1 border-t border-slate-100">
                          <p className="text-xs text-slate-500">
                            Versión: <span className="font-medium">{product.version || "—"}</span>
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap mt-1 ${
                        product.type === "approved" || product.type === "portfolio_standard"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {product.lifecycleLabel || (product.type === "approved" ? "Aprobado" : (product.type === "portfolio_standard" ? "Portafolio estándar" : "Base"))}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : portfolioCode ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No se encontraron productos en este portafolio
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                Selecciona un portafolio primero
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

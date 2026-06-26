import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { getPortfolioDisplayRecords } from "../../data/portfolioStorage";

interface PortfolioSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (portfolioCode: string) => void;
  portfolios?: any[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export default function PortfolioSearch({
  value,
  onChange,
  onSelect,
  portfolios: externalPortfolios,
  placeholder = "Buscar portafolio por código o nombre...",
  disabled = false,
  error,
  label,
}: PortfolioSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const portfolios = useMemo(() =>
    externalPortfolios ?? getPortfolioDisplayRecords(),
    [externalPortfolios]
  );

  const filteredPortfolios = useMemo(() => {
    const search = value.trim().toLowerCase();
    if (!search) return [];

    return portfolios.filter((portfolio) => {
      const code = portfolio.id || portfolio.codigo || portfolio.code || "";
      const name = portfolio.nom || portfolio.portfolioName || "";
      const client = portfolio.cli || portfolio.clientName || "";
      
      const searchableText = [code, name, client]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [value, portfolios]);

  const selectedPortfolio = portfolios.find(
    (p) => String(p.id || p.codigo || p.code) === value
  );

  const handleSelect = (portfolioCode: string) => {
    onChange(portfolioCode);
    onSelect?.(portfolioCode);
    setIsOpen(false);
  };

  const getPortfolioCode = (p: any) => String(p.id || p.codigo || p.code);
  const getPortfolioName = (p: any) => String(p.nom || p.portfolioName || "");

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
              selectedPortfolio
                ? `${getPortfolioCode(selectedPortfolio)} - ${getPortfolioName(selectedPortfolio)}`
                : value
            }
            onChange={(e) => {
              const inputValue = e.target.value;
              if (selectedPortfolio) {
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
          {selectedPortfolio && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isOpen && value && !selectedPortfolio && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {filteredPortfolios.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredPortfolios.map((portfolio) => {
                    const code = getPortfolioCode(portfolio);
                    const name = getPortfolioName(portfolio);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleSelect(code)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-semibold text-slate-900">
                          {name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex justify-between">
                          <span>Código: {code}</span>
                          <span>Cliente: {portfolio.cli || portfolio.clientName || "N/A"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No se encontraron portafolios
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!selectedPortfolio && portfolios.length > 0 && !isOpen && (
        <p className="text-xs text-slate-500">
          {portfolios.length} portafolio(s) disponible(s)
        </p>
      )}
    </div>
  );
}

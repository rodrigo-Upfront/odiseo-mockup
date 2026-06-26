import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { getAllClients, type Client } from "../../data/clientStorage";

interface ClientSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (client: Client) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export default function ClientSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Buscar cliente por código, nombre o RUC...",
  disabled = false,
  error,
  label,
}: ClientSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const clients = useMemo(() => getAllClients(), []);

  const filteredClients = useMemo(() => {
    const search = value.trim().toLowerCase();
    if (!search) return [];

    return clients.filter((client) => {
      const code = client.code || "";
      const name = client.businessName || "";
      const ruc = client.ruc || "";

      const searchableText = [code, name, ruc]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [value, clients]);

  const selectedClient = clients.find((c) => c.id === value);

  const handleSelect = (client: Client) => {
    onChange(client.id);
    onSelect?.(client);
    setIsOpen(false);
  };

  const getClientCode = (c: Client) => c.code;
  const getClientName = (c: Client) => c.businessName || "";

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
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
              selectedClient
                ? `${getClientCode(selectedClient)} - ${getClientName(selectedClient)}`
                : value
            }
            onChange={(e) => {
              const inputValue = e.target.value;
              if (selectedClient) {
                onChange("");
              } else {
                onChange(inputValue);
              }
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
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
          {selectedClient && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isOpen && value && !selectedClient && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {filteredClients.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredClients.map((client) => {
                    const code = getClientCode(client);
                    const name = getClientName(client);
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelect(client)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-semibold text-slate-900">
                          {name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex justify-between">
                          <span>Código: {code}</span>
                          <span>RUC: {client.ruc || "N/A"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No se encontraron clientes
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!selectedClient && clients.length > 0 && !isOpen && (
        <p className="text-xs text-slate-500">
          {clients.length} cliente(s) disponible(s)
        </p>
      )}
    </div>
  );
}

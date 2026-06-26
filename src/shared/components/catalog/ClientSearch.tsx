import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import type { Client } from "../../data/clientStorage";

type ClientSearchProps = {
  label: string;
  value: string; // Debe guardar Client.id, ejemplo: "CLI-000001"
  clients: Client[];
  onChange: (clientId: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
};

const DROPDOWN_MAX_HEIGHT = 256;

const normalizeText = (text?: string | number | null) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function ClientSearch({
  label,
  value,
  clients,
  onChange,
  onBlur,
  error,
  placeholder = "Escribe para buscar cliente...",
}: ClientSearchProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  const selectedClient = useMemo(() => {
    return clients.find((client) => client.id === value);
  }, [clients, value]);

  useEffect(() => {
    if (value && selectedClient) {
      setQuery(selectedClient.businessName);
      return;
    }

    if (!value) {
      setQuery("");
    }
  }, [value, selectedClient?.businessName]);

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const shouldOpenUp =
      spaceBelow < DROPDOWN_MAX_HEIGHT && rect.top > DROPDOWN_MAX_HEIGHT;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      maxHeight: `${DROPDOWN_MAX_HEIGHT}px`,
      zIndex: 9999,
      ...(shouldOpenUp
        ? { bottom: viewportHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideInput = wrapperRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);

      if (!clickedInsideInput && !clickedInsideDropdown) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredClients = useMemo(() => {
    const search = normalizeText(query);

    if (!search) return clients;

    return clients.filter((client) => {
      const searchText = normalizeText(
        [
          client.businessName,
          client.code,
          client.ruc,
          client.email,
          client.industry,
          client.status,
        ].join(" ")
      );

      return searchText.includes(search);
    });
  }, [clients, query]);

  const selectClient = useCallback(
    (client: Client) => {
      onChange(client.id);
      setQuery(client.businessName);
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onChange]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;

    setQuery(nextQuery);
    setIsOpen(true);
    setSelectedIndex(-1);

    // Si el usuario borra el texto o modifica el cliente seleccionado,
    // se limpia el valor técnico para que la validación obligatoria se active.
    if (!nextQuery.trim() || value) {
      onChange("");
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    updateDropdownPosition();
  };

  const handleInputBlur = () => {
    onBlur?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && ["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
      setIsOpen(true);
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredClients.length - 1)
        );
        break;

      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;

      case "Enter":
        event.preventDefault();
        if (selectedIndex >= 0 && filteredClients[selectedIndex]) {
          selectClient(filteredClients[selectedIndex]);
        }
        break;

      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  const hasResults = filteredClients.length > 0;

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
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm shadow-sm outline-none transition-colors ${
            error
              ? "border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-slate-300 text-slate-700 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          } placeholder:text-slate-400`}
        />
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
          >
            {hasResults ? (
              filteredClients.map((client, index) => (
                <button
                  key={client.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    selectClient(client);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`block w-full border-b border-slate-100 px-3 py-2 text-left transition-colors last:border-0 ${
                    index === selectedIndex
                      ? "bg-brand-secondary-soft"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-800">
                    {client.businessName}
                  </div>

                  <div className="text-xs text-slate-500">
                    {client.code} · {client.ruc}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-amber-700 bg-amber-50">
                Cliente no encontrado. Regístrelo en el módulo Clientes.
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

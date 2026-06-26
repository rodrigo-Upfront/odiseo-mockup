import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Mail,
  RotateCcw,
  Search,
  Users,
  ShieldCheck,
} from "lucide-react";

import { useLayout } from "../../../components/layout/LayoutContext";
import {
  getAllClients,
  type Client,
  type ClientStatus,
} from "../../../shared/data/clientStorage";

import ActionButton from "../../../shared/components/buttons/ActionButton";
import { tableStyles } from "../../../shared/ui/tableStyles";

type ClientTab = "all" | "Aprobado" | "Pendiente" | "Inactivo";
type SortDirection = "asc" | "desc";
type SortKey = "code" | "businessName" | "email" | "ruc" | "industry" | "status" | "createdAt";

const RECENT_NEW_CLIENT_KEY = "odiseo_recent_new_client";

const getText = (...values: any[]) => {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== "",
  );
  return value ? String(value) : "";
};

const getClientStatus = (client: Client): ClientStatus => {
  return client.status;
};

const getDisplayStatus = (client: Client): string => {
  if (client.activeLogical === "0") {
    return "Inactivo";
  }
  if (client.clientApprovalStatus === "A") {
    return "Aprobado";
  }
  return "Pendiente";
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "Aprobado":
      return "border-green-200 bg-green-50 text-green-700";
    case "Pendiente":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Inactivo":
      return "border-slate-300 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

const getSortValue = (client: Client, key: SortKey): string | number => {
  switch (key) {
    case "code": return getText(client.code).toLowerCase();
    case "businessName": return getText(client.businessName).toLowerCase();
    case "email": return getText(client.email).toLowerCase();
    case "ruc": return getText(client.ruc).toLowerCase();
    case "industry": return getText(client.industry).toLowerCase();
    case "status": return getDisplayStatus(client).toLowerCase();
    case "createdAt": {
      const createdAt = client.createdAt;
      const time = createdAt ? new Date(createdAt).getTime() : 0;
      return Number.isNaN(time) ? 0 : time;
    }
    default: return "";
  }
};

export default function ClientListPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ClientTab>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "createdAt",
    direction: "desc",
  });
  const [recentNewClientId, setRecentNewClientId] = useState<string | null>(null);

  useEffect(() => {
    setHeader({
      title: "Gestión de Clientes",
      breadcrumbs: [{ label: "Clientes" }, { label: "Lista de Clientes" }],
    });
    return () => resetHeader();
  }, [setHeader, resetHeader]);

  useEffect(() => {
    const raw = localStorage.getItem(RECENT_NEW_CLIENT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { clientId?: string; expiresAt?: number };
      if (!parsed.clientId || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
        localStorage.removeItem(RECENT_NEW_CLIENT_KEY);
        return;
      }
      setRecentNewClientId(parsed.clientId);
      const timer = window.setTimeout(() => {
        setRecentNewClientId(null);
        localStorage.removeItem(RECENT_NEW_CLIENT_KEY);
      }, parsed.expiresAt - Date.now());
      return () => window.clearTimeout(timer);
    } catch {
      localStorage.removeItem(RECENT_NEW_CLIENT_KEY);
    }
  }, []);

  const clients = useMemo(() => getAllClients(), []);

  const approvedClients = useMemo(
    () => clients.filter((client) => getDisplayStatus(client) === "Aprobado"),
    [clients],
  );

  const pendingClients = useMemo(
    () => clients.filter((client) => getDisplayStatus(client) === "Pendiente"),
    [clients],
  );

  const inactiveClients = useMemo(
    () => clients.filter((client) => getDisplayStatus(client) === "Inactivo"),
    [clients],
  );

  const industryOptions = useMemo(() => {
    const industries = new Set(clients.map((client) => getText(client.industry)).filter(Boolean));
    return Array.from(industries).sort();
  }, [clients]);

  const filteredClients = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = clients.filter((client) => {
      const displayStatus = getDisplayStatus(client);
      const searchableText = [
        client.code, client.email, client.businessName, client.ruc, client.industry, displayStatus, client.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);
      const matchesTab = activeTab === "all" || displayStatus === activeTab;
      const matchesIndustry = !industryFilter || client.industry === industryFilter;

      return matchesSearch && matchesTab && matchesIndustry;
    });

    return [...filtered].sort((a, b) => {
      const valueA = getSortValue(a, sortConfig.key);
      const valueB = getSortValue(b, sortConfig.key);
      let result = 0;

      if (typeof valueA === "number" && typeof valueB === "number") {
        result = valueA - valueB;
      } else {
        result = String(valueA).localeCompare(String(valueB), "es", {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortConfig.direction === "asc" ? result : result * -1;
    });
  }, [clients, query, activeTab, industryFilter, sortConfig]);

  const totalRecords = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeTab, industryFilter, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setQuery("");
    setActiveTab("all");
    setIndustryFilter("");
    setPageSize(25);
    setCurrentPage(1);
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  const requestSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: key === "createdAt" ? "desc" : "asc" };
    });
  };

  const SortIcon = ({ sortKey }: { sortKey: SortKey }) => {
    if (sortConfig.key !== sortKey) return <ArrowUpDown size={14} className="text-white/60" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="text-white" />
    ) : (
      <ArrowDown size={14} className="text-white" />
    );
  };

  const SortableHeader = ({
    label,
    sortKey,
    align = "left",
  }: {
    label: string;
    sortKey: SortKey;
    align?: "left" | "right";
  }) => (
    <th className={align === "right" ? tableStyles.headerCellRight : tableStyles.headerCell}>
      <button
        type="button"
        onClick={() => requestSort(sortKey)}
        className={`flex w-full items-center gap-2 ${
          align === "right" ? "justify-end text-right" : "justify-start text-left"
        }`}
      >
        <span>{label}</span>
        <SortIcon sortKey={sortKey} />
      </button>
    </th>
  );

  const isRecentNewClient = (client: Client) =>
    Boolean(recentNewClientId && (client.code || client.id) === recentNewClientId);

  const tabs = [
    { key: "all" as ClientTab, label: "Todos", count: clients.length },
    { key: "Aprobado" as ClientTab, label: "Aprobados", count: approvedClients.length },
    { key: "Pendiente" as ClientTab, label: "Pendiente", count: pendingClients.length },
    { key: "Inactivo" as ClientTab, label: "Inactivos", count: inactiveClients.length },
  ];

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{clients.length}</p></div>
            <div className="rounded-lg bg-brand-secondary-soft p-2 text-brand-primary"><Users size={18} /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1"><p className="text-xs font-bold uppercase tracking-wide text-green-600">Aprobados</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{approvedClients.length}</p></div>
            <div className="rounded-lg bg-green-50 p-2 text-green-600"><ShieldCheck size={18} /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1"><p className="text-xs font-bold uppercase tracking-wide text-amber-600">Pendiente</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{pendingClients.length}</p></div>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><Mail size={18} /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1"><p className="text-xs font-bold uppercase tracking-wide text-slate-600">Inactivos</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{inactiveClients.length}</p></div>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600"><Users size={18} /></div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 pt-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex max-w-full gap-6 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition-colors ${isActive ? "border-brand-primary text-brand-primary" : "border-transparent text-slate-500 hover:text-brand-primary"}`}
                >
                  {tab.label}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${isActive ? "bg-brand-secondary-soft text-brand-primary" : "bg-slate-100 text-slate-500"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="pb-3 text-xs font-medium text-slate-500">
            Mostrando {filteredClients.length} de {clients.length} registros
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 py-4 xl:grid-cols-[2.4fr_0.9fr_auto]">
          <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Buscar</label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, email, RUC, código o rubro..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary" />
            </div>
          </div>

          <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Sector</label>
            <select value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary">
              <option value="">Todos los rubros</option>
              {industryOptions.map((industry) => (<option key={industry} value={industry}>{industry}</option>))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <ActionButton label="Limpiar Filtros" onClick={clearFilters} variant="outline" icon={<RotateCcw size={16} />} />
          </div>
        </div>
      </section>

      <div className={tableStyles.wrapper}>
        <div className={tableStyles.scroll}>
          <table className={tableStyles.table}>
            <thead>
              <tr className={tableStyles.headerRow}>
                <SortableHeader label="Código de cliente" sortKey="code" />
                <SortableHeader label="Nombre de cliente" sortKey="businessName" />
                <SortableHeader label="Correo de Empresa" sortKey="email" />
                <SortableHeader label="Número de RUC" sortKey="ruc" />
                <SortableHeader label="Sector" sortKey="industry" />
                <SortableHeader label="Estado de cliente" sortKey="status" />
                <th className={tableStyles.headerCellRight}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client, index) => {
                const isNew = isRecentNewClient(client);
                return (
                  <tr key={client.id} className={`${tableStyles.row} border-b border-slate-100 transition-colors ${
                    isNew ? "bg-blue-50/70" : index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                  } hover:bg-brand-secondary-soft`}>
                    <td className={tableStyles.cellCode}>{client.code || "�"}</td>
                    <td className={tableStyles.cellStrong}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{client.businessName}</span>
                        {isNew && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Nuevo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={tableStyles.cell}>{client.email || "�"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{client.ruc || "�"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{client.industry || "�"}</td>
                    <td className={tableStyles.cell}>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusBadgeClass(getDisplayStatus(client))}`}>
                        {getDisplayStatus(client)}
                      </span>
                    </td>
                    <td className={tableStyles.actions}>
                      <ActionButton label="Ver" size="sm" variant="primary" onClick={() => navigate(`/clients/${client.code}`)} />
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className={tableStyles.emptyCell}>
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 rounded-full bg-slate-100 p-3">
                        <Users size={26} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">No se encontraron clientes</p>
                      <p className="mt-1 text-xs text-slate-400">Intenta limpiar filtros o cambiar el criterio de búsqueda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>No</span>
            <span className="ml-3 text-xs text-slate-500">
              Mostrando <strong className="text-slate-700">{startRecord}</strong> - <strong className="text-slate-700">{endRecord}</strong> de <strong className="text-slate-700">{totalRecords}</strong> registros
            </span>
          </div>

          <div className="flex items-center justify-end gap-1">
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50">
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${currentPage === page ? "border-brand-primary bg-brand-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:border-brand-primary hover:text-brand-primary"}`}>
                {page}
              </button>
            ))}

            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

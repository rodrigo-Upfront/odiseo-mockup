import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Mail,
  Plus,
  RotateCcw,
  Search,
  Users,
  BriefcaseBusiness,
} from "lucide-react";

import { useLayout } from "../../../components/layout/LayoutContext";
import { getPortfolioDisplayRecords } from "../../../shared/data/portfolioStorage";
import ActionButton from "../../../shared/components/buttons/ActionButton";
import { tableStyles } from "../../../shared/ui/tableStyles";

type PortfolioTab = "all" | "active" | "inactive";
type SortDirection = "asc" | "desc";
type SortKey = "codigo" | "nombre" | "clientName" | "planta" | "envoltura" | "maquinaCliente" | "updatedAt" | "updatedBy";

const RECENT_NEW_PORTFOLIO_KEY = "odiseo_recent_new_portfolio";

const getText = (...values: any[]) => {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== "",
  );
  return value ? String(value) : "";
};

const getPortfolioPlantName = (portfolio: any): string => {
  return getText(
    portfolio.plantaName,
    (portfolio as any).pl,
    (portfolio as any).planta,
    (portfolio as any).plantName,
  ) || "—";
};

const getPortfolioStatus = (portfolio: any): "active" | "inactive" => {
  const rawStatus = getText(
    portfolio.status,
    portfolio.est,
    portfolio.estado,
    portfolio.isActive === false ? "inactive" : "",
    portfolio.active === false ? "inactive" : "",
    "active"
  ).toLowerCase();

  if (
    rawStatus.includes("inactivo") ||
    rawStatus.includes("inactive") ||
    rawStatus === "false"
  ) {
    return "inactive";
  }
  return "active";
};

const getPortfolioUpdatedAt = (portfolio: any): string => {
  return getText(
    portfolio.updatedAt,
    portfolio.TbPoFUlt,
    portfolio.modifiedAt,
    portfolio.lastUpdatedAt,
    portfolio.fechaActualizacion,
    portfolio.updated_at,
    portfolio.createdAt,
    portfolio.TbPoFCre,
    portfolio.fch,
  );
};

const getPortfolioUpdatedBy = (portfolio: any): string => {
  return (
    getText(
      portfolio.realizadoPor,
      portfolio.updatedByName,
      portfolio.lastUpdatedBy,
      portfolio.modifiedByName,
      portfolio.usuarioActualizacion,
      portfolio.createdByName,
      portfolio.TbPoUUltNom,
      portfolio.TbPoUCreNom,
      portfolio.updatedBy,
      portfolio.modifiedBy,
      portfolio.createdBy,
      portfolio.TbPoUUlt,
      portfolio.TbPoUCre,
    ) || "—"
  );
};

const formatPortfolioDateTime = (value: any): string => {
  const text = getText(value);

  if (!text) return "—";

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) return text;

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const getSortValue = (portfolio: any, key: SortKey): string | number => {
  switch (key) {
    case "codigo": return getText(portfolio.id).toLowerCase();
    case "nombre": return getText(portfolio.nom).toLowerCase();
    case "clientName": return getText(portfolio.cli).toLowerCase();
    case "planta": return getPortfolioPlantName(portfolio).toLowerCase();
    case "envoltura": return getText(portfolio.env).toLowerCase();
    case "maquinaCliente": return getText(portfolio.maq).toLowerCase();
    case "updatedAt": {
      const updatedAt = getPortfolioUpdatedAt(portfolio);
      const time = updatedAt ? new Date(updatedAt).getTime() : 0;
      return Number.isNaN(time) ? 0 : time;
    }
    case "updatedBy":
      return getPortfolioUpdatedBy(portfolio).toLowerCase();
    default: return "";
  }
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

const STATUS_COLORS: Record<string, string> = {
  active: "border-green-200 bg-green-50 text-green-700 font-bold",
  inactive: "border-slate-300 bg-slate-50 text-slate-700 font-bold",
};

export default function PortfolioListPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PortfolioTab>("all");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "updatedAt",
    direction: "desc",
  });
  const [recentNewPortfolioId, setRecentNewPortfolioId] = useState<string | null>(null);

  useEffect(() => {
    setHeader({
      title: "Gestión de Portafolios",
      breadcrumbs: [{ label: "Portafolios" }, { label: "Lista de Portafolios" }],
    });

    return () => resetHeader();
  }, [setHeader, resetHeader]);

  useEffect(() => {
    const raw = localStorage.getItem(RECENT_NEW_PORTFOLIO_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { portfolioId?: string; expiresAt?: number };
      if (!parsed.portfolioId || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
        localStorage.removeItem(RECENT_NEW_PORTFOLIO_KEY);
        return;
      }
      setRecentNewPortfolioId(parsed.portfolioId);
      const timer = window.setTimeout(() => {
        setRecentNewPortfolioId(null);
        localStorage.removeItem(RECENT_NEW_PORTFOLIO_KEY);
      }, parsed.expiresAt - Date.now());
      return () => window.clearTimeout(timer);
    } catch {
      localStorage.removeItem(RECENT_NEW_PORTFOLIO_KEY);
    }
  }, []);

  const portfolios = useMemo(() => getPortfolioDisplayRecords(), []);

  const activePortfolios = useMemo(
    () => portfolios.filter((p) => getPortfolioStatus(p) === "active"),
    [portfolios],
  );

  const inactivePortfolios = useMemo(
    () => portfolios.filter((p) => getPortfolioStatus(p) === "inactive"),
    [portfolios],
  );

  const filteredPortfolios = useMemo(() => {
    const search = query.trim().toLowerCase();

    const filtered = portfolios.filter((portfolio) => {
      const status = getPortfolioStatus(portfolio);
      const statusLabel = STATUS_LABELS[status];

      const searchableText = [
        portfolio.id,
        (portfolio as any).nom,
        (portfolio as any).cli,
        getPortfolioPlantName(portfolio),
        (portfolio as any).env,
        (portfolio as any).maq,
        (portfolio as any).ej,
        (portfolio as any).pl,
        statusLabel,
        (portfolio as any).fch,
        getPortfolioUpdatedBy(portfolio),
        getPortfolioUpdatedAt(portfolio),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);
      const matchesTab = activeTab === "all" || status === activeTab;

      return matchesSearch && matchesTab;
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
  }, [portfolios, query, activeTab, sortConfig]);

  const totalRecords = filteredPortfolios.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const paginatedPortfolios = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredPortfolios.slice(startIndex, endIndex);
  }, [filteredPortfolios, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeTab, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setQuery("");
    setActiveTab("all");
    setPageSize(25);
    setCurrentPage(1);
    setSortConfig({ key: "updatedAt", direction: "desc" });
  };

  const requestSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: key === "updatedAt" ? "desc" : "asc",
      };
    });
  };

  const SortIcon = ({ sortKey }: { sortKey: SortKey }) => {
    if (sortConfig.key !== sortKey) {
      return <ArrowUpDown size={14} className="text-white/60" />;
    }

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

  const isRecentNewPortfolio = (portfolio: any) =>
    Boolean(recentNewPortfolioId && (portfolio.id || portfolio.codigo) === recentNewPortfolioId);

  const tabs = [
    {
      key: "all" as PortfolioTab,
      label: "Todos",
      count: portfolios.length,
    },
    {
      key: "active" as PortfolioTab,
      label: "Activos",
      count: activePortfolios.length,
    },
    {
      key: "inactive" as PortfolioTab,
      label: "Inactivos",
      count: inactivePortfolios.length,
    },
  ];

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {portfolios.length}
              </p>
            </div>
            <div className="rounded-lg bg-brand-secondary-soft p-2 text-brand-primary">
              <BriefcaseBusiness size={18} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                Activos
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {activePortfolios.length}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <BriefcaseBusiness size={18} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Inactivos
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {inactivePortfolios.length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <BriefcaseBusiness size={18} />
            </div>
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
                  className={`whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition-colors ${
                    isActive
                      ? "border-brand-primary text-brand-primary"
                      : "border-transparent text-slate-500 hover:text-brand-primary"
                  }`}
                >
                  {tab.label}

                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-brand-secondary-soft text-brand-primary"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="pb-3 text-xs font-medium text-slate-500">
            Mostrando {filteredPortfolios.length} de {portfolios.length} registros
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 py-4 xl:grid-cols-[2.4fr_auto]">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Buscar
            </label>

            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por código, nombre, cliente, planta, envoltura, envasado..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <ActionButton
              label="Limpiar Filtros"
              onClick={clearFilters}
              variant="outline"
              icon={<RotateCcw size={16} />}
            />

            <ActionButton
              label="Crear Portafolio"
              onClick={() => navigate("/portfolio/new")}
              variant="primary"
              icon={<Plus size={16} />}
            />
          </div>
        </div>
      </section>

      <div className={tableStyles.wrapper}>
        <div className={tableStyles.scroll}>
          <table className={tableStyles.table}>
            <thead>
              <tr className={tableStyles.headerRow}>
                <SortableHeader label="Código" sortKey="codigo" />
                <SortableHeader label="Nombre" sortKey="nombre" />
                <SortableHeader label="Cliente" sortKey="clientName" />
                <SortableHeader label="Planta de Origen" sortKey="planta" />
                <SortableHeader label="Envoltura" sortKey="envoltura" />
                <SortableHeader label="Envasado / Máquina de Cliente" sortKey="maquinaCliente" />
                <th className={tableStyles.headerCell}>
                  Estado
                </th>
                <SortableHeader label="Últ. actualización" sortKey="updatedAt" />
                <SortableHeader label="Realizado por" sortKey="updatedBy" />

                <th className={tableStyles.headerCellRight}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedPortfolios.length > 0 ? (
                paginatedPortfolios.map((portfolio, index) => {
                  const status = getPortfolioStatus(portfolio);
                  const isNew = isRecentNewPortfolio(portfolio);
                  return (
                    <tr
                      key={portfolio.id}
                      className={`${tableStyles.row} border-b border-slate-100 transition-colors ${
                        isNew ? "bg-blue-50/70" : index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      } hover:bg-brand-secondary-soft`}
                    >
                    <td className={tableStyles.cellCode}>
                      {portfolio.id || "—"}
                    </td>

                    <td className={tableStyles.cellStrong}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{(portfolio as any).nom || "—"}</span>
                        {isNew && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Nuevo
                          </span>
                        )}
                      </div>
                    </td>

                    <td className={tableStyles.cellStrong}>
                      {(portfolio as any).cli || "—"}
                    </td>

                    <td className={tableStyles.cell}>
                      {getPortfolioPlantName(portfolio)}
                    </td>

                    <td className={tableStyles.cell}>
                      {(portfolio as any).env || "—"}
                    </td>

                    <td className={tableStyles.cell}>
                      {(portfolio as any).maq || "—"}
                    </td>

                    <td className={tableStyles.cell}>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </td>

                    <td className={tableStyles.cell}>
                      {formatPortfolioDateTime(getPortfolioUpdatedAt(portfolio))}
                    </td>

                    <td className={tableStyles.cell}>
                      {getPortfolioUpdatedBy(portfolio)}
                    </td>

                    <td className={tableStyles.actions}>
                      <ActionButton
                        label="Ver"
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                      />

                      <ActionButton
                        label="Editar"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/portfolio/${portfolio.id}/edit`)}
                      />
                    </td>
                  </tr>
                );
                })
              ) : (
                <tr>
                  <td colSpan={10} className={tableStyles.emptyCell}>
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 rounded-full bg-slate-100 p-3">
                        <BriefcaseBusiness size={26} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-bold text-slate-700">
                        No se encontraron portafolios
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Intenta limpiar filtros o cambiar el criterio de búsqueda.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span>N°</span>

            <span className="ml-3 text-xs text-slate-500">
              Mostrando{" "}
              <strong className="text-slate-700">{startRecord}</strong>
              {" - "}
              <strong className="text-slate-700">{endRecord}</strong>
              {" de "}
              <strong className="text-slate-700">{totalRecords}</strong>
              {" registros"}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              ‹ Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
                    currentPage === page
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-primary hover:text-brand-primary"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

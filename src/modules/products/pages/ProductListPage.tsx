import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BriefcaseBusiness,
  Layers3,
  RotateCcw,
  Search,
} from "lucide-react";

import { useLayout } from "../../../components/layout/LayoutContext";
import { getProjectRecords } from "../../../shared/data/projectStorage";
import { getPortfolioDisplayRecords } from "../../../shared/data/portfolioStorage";
import {
  normalizeProjectWorkflow,
  getResponsibleAreaForProject,
  normalizeProductStatus,
  normalizeSkuLifecycleCode,
  getSkuLifecycleLabel,
  type ProductStatus,
  type SkuLifecycleCode,
} from "../../../shared/data/projectWorkflow";
import ProjectStatusBadge from "../../../shared/components/display/ProjectStatusBadge";
import ActionButton from "../../../shared/components/buttons/ActionButton";
import { ProductActionButton } from "../../../shared/components/ProductActionButton";

type ProjectTab = "all" | ProductStatus;

type SortDirection = "asc" | "desc";

type SortKey =
  | "code"
  | "projectName"
  | "clientName"
  | "classification"
  | "status"
  | "skuCode"
  | "skuLifecycle"
  | "responsible"
  | "createdAt"
  | "updatedAt";

const RECENT_NEW_PROJECT_KEY = "odiseo_recent_new_project";

const PRODUCT_STATUSES: ProductStatus[] = [
  "Registrado",
  "En Preparación",
  "Completado",
];

const getText = (...values: any[]) => {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== ""
  );

  return value ? String(value) : "";
};

const getProductNavigationCode = (item: any) =>
  getText(
    item.code,
    item.projectCode,
    item.productRequestCode,
    item.id
  );

const findProductByRouteParam = (products: any[], routeParam: string) => {
  const normalizedParam = String(routeParam || "").trim().toLowerCase();

  return products.find((product) => {
    const identifiers = [
      product.code,
      product.projectCode,
      product.productRequestCode,
      product.id,
    ]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());

    return identifiers.includes(normalizedParam);
  });
};

const getUnitAbbreviation = (unitValue: any) => {
  const unit = getText(unitValue);
  if (!unit) return "";
  const match = unit.match(/\(([^)]+)\)/);
  if (match) return match[1].trim().toUpperCase();
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit.includes("gramos")) return "G";
  if (lowerUnit.includes("mililitros")) return "ML";
  if (lowerUnit.includes("kilogramos")) return "KG";
  if (lowerUnit.includes("litros")) return "L";
  return unit.toUpperCase();
};

const formatProductDisplayName = (item: any) => {
  const name = getText(
    item.productName,
    item.nombreProducto,
    item.projectName,
    item.name
  );
  const volume = getText(
    item.referenceVolume,
    item.volumenReferencial,
    item.volume,
    item.volumen
  );
  const unit = getUnitAbbreviation(
    item.unit ||
    item.unidad ||
    item.referenceUnit ||
    item.unidadReferencia
  );
  return [name, volume, unit].filter(Boolean).join(" ");
};

const formatDate = (...values: any[]) => {
  const value = getText(...values);

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (...values: any[]) => {
  const value = getText(...values);

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getCurrentActionLabel = (product: any): string => {
  const normalizedStatus = normalizeProductStatus(product.status);

  if (normalizedStatus === "Registrado") return "Completar registro";
  if (normalizedStatus === "En Preparación") return "Completar información";
  if (normalizedStatus === "Completado") return "Producto completado";

  return "—";
};

const getSortValue = (project: any, key: SortKey): string | number => {
  switch (key) {
    case "code":
      return getText(project.currentSkuCode, project.skuCode, project.code, project.id).toLowerCase();

    case "projectName":
      return getText(project.projectName, project.name).toLowerCase();

    case "clientName":
      return getText(project.clientName).toLowerCase();

    case "classification":
      return getText(project.classification).toLowerCase();

    case "status":
      return getText(project.status).toLowerCase();

    case "skuCode":
      return getText(project.skuCode, project.siProductCode, project.productRequestCode).toLowerCase();

    case "skuLifecycle":
      return getText(project.skuLifecycleCode || "").toLowerCase();

    case "responsible":
      return getText(project.responsibleLabel, project.responsibleArea).toLowerCase();

    case "createdAt": {
      const dateValue = getText(
        project.createdAt,
        project.createdDate,
        project.updatedAt,
        project.updatedDate
      );

      const time = new Date(dateValue).getTime();

      return Number.isNaN(time) ? 0 : time;
    }

    case "updatedAt": {
      const dateValue = getText(
        project.updatedAtLabel,
        project.updatedAt,
        project.updatedDate,
        project.lastUpdatedAt,
        project.createdAt,
        project.createdDate
      );

      const time = new Date(dateValue).getTime();

      return Number.isNaN(time) ? 0 : time;
    }

    default:
      return "";
  }
};

export default function ProductListPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ProjectTab>("all");

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "createdAt",
    direction: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [recentNewProjectId, setRecentNewProjectId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setHeader({
      title: "Gestión de Productos",
      breadcrumbs: [{ label: "Productos" }, { label: "Lista de Productos" }],
    });

    return () => resetHeader();
  }, [setHeader, resetHeader]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey((prev) => prev + 1);
      }
    };

    const handleFocus = () => {
      setRefreshKey((prev) => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const checkRecentProject = () => {
      const raw = localStorage.getItem(RECENT_NEW_PROJECT_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as { projectId?: string; expiresAt?: number };
        if (!parsed.projectId || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
          localStorage.removeItem(RECENT_NEW_PROJECT_KEY);
          return;
        }

        // Incrementar refreshKey para forzar re-fetch de proyectos
        setRefreshKey((prev) => prev + 1);
        setRecentNewProjectId(parsed.projectId);

        const remainingTime = parsed.expiresAt - Date.now();
        const timer = window.setTimeout(() => {
          setRecentNewProjectId(null);
          localStorage.removeItem(RECENT_NEW_PROJECT_KEY);
        }, remainingTime);

        return () => window.clearTimeout(timer);
      } catch {
        localStorage.removeItem(RECENT_NEW_PROJECT_KEY);
      }
    };

    // Ejecutar al montar el componente
    checkRecentProject();

    // Listener para detectar custom event cuando se crea un nuevo proyecto
    const handleNewProjectCreated = () => {
      checkRecentProject();
    };

    window.addEventListener("newProjectCreated", handleNewProjectCreated);
    return () => window.removeEventListener("newProjectCreated", handleNewProjectCreated);
  }, []);

  const isRecentNewProject = (item: any) =>
    Boolean(recentNewProjectId && (item.code || item.id) === recentNewProjectId);

  const projects = useMemo(() => getProjectRecords(), [refreshKey]);
  const portfolios = useMemo(() => getPortfolioDisplayRecords(), [refreshKey]);

  const augmentedProjects = useMemo(() => {
    return projects.map((project) => {
      const normalizedProject = normalizeProjectWorkflow(project);
      const code = getText(project.code, project.id);
      const normalizedStatus = normalizeProductStatus(project.status);

      const portfolioCode = getText(
        project.portfolioCode,
        (project as any).portfolioId,
        (project as any).portfolioCodigo
      );

      const relatedPortfolio = portfolios.find(
        (portfolio) =>
          getText(portfolio.codigo, portfolio.id) === portfolioCode
      );

      const portfolioName = getText(
        project.portfolioName,
        relatedPortfolio?.nombre,
        relatedPortfolio?.portfolioName,
        relatedPortfolio?.nom
      );

      const responsibleArea = getResponsibleAreaForProject(normalizedProject);
      const responsibleName =
        getText(
          (project as any).responsibleName,
          (project as any).responsable,
          (project as any).ownerName,
          (project as any).assignedToName,
          (project as any).commercialExecutiveName,
          (project as any).executiveName,
          (project as any).ejecutivoComercial
        ) || "—";
      const responsibleLabel =
        getText(
          responsibleName,
          (project as any).responsibleName,
          (project as any).responsable,
          (project as any).ownerName,
          (project as any).assignedToName,
          (project as any).commercialExecutiveName,
          (project as any).executiveName,
          (project as any).ejecutivoComercial,
          responsibleArea
        ) || "—";
      const classification = getText(
        project.classification,
        (project as any).clasificacion
      );
      const wrappingName = getText(
        project.envoltura,
        project.wrappingName,
        (project as any).wrapping
      );
      const blueprintFormat = getText(
        project.blueprintFormat,
        (project as any).formatoPlano,
        (project as any).format
      );

      const updatedAtLabel = formatDateTime(
        project.updatedAt,
        (project as any).lastUpdatedAt,
        (project as any).updatedDate,
        (project as any).lastUpdatedDate,
        project.createdAt,
        (project as any).createdDate,
        (project as any).fechaCreacion,
        (project as any).fecha_creacion
      );

      const updatedByLabel =
        getText(
          (project as any).updatedBy,
          (project as any).lastUpdatedBy,
          (project as any).updatedByName,
          (project as any).lastUpdatedByName,
          (project as any).createdByName,
          (project as any).createdBy,
          (project as any).userName,
          (project as any).username,
          (project as any).usuario
        ) || "—";

      const projectNameLabel = getText(project.projectName, (project as any).name);
      const productDisplayNameLabel = formatProductDisplayName(project);
      const skuCode = getText(project.siProductCode, project.skuCode, (project as any).codigoSku, (project as any).skuCode);
      const skuLifecycleCodeRaw = getText(
        project.skuLifecycleCode,
        (project as any).cicloVidaSku,
        (project as any).skuLifecycleCode
      );
      const skuLifecycleCode = normalizeSkuLifecycleCode(skuLifecycleCodeRaw);
      const skuLifecycleLabel = skuLifecycleCode ? getSkuLifecycleLabel(skuLifecycleCode) : null;

      const currentSkuCode = getText(
        project.currentSkuCode,
        skuCode,
        (project as any).currentSkuCode
      );

      return {
        ...normalizedProject,
        code,
        currentSkuCode,
        projectNameLabel,
        productDisplayNameLabel,
        clientNameLabel: getText(project.clientName, (project as any).cli),
        portfolioCodeLabel: portfolioCode,
        portfolioNameLabel: portfolioName,
        classification,
        wrappingName,
        blueprintFormat,
        skuCode,
        skuLifecycleCode,
        skuLifecycleLabel,
        responsibleArea,
        responsibleName,
        responsibleLabel,
        currentAction: getCurrentActionLabel(normalizedProject),
        updatedAtLabel,
        updatedByLabel,
        createdAtLabel: formatDate(
          project.createdAt,
          (project as any).createdDate,
          (project as any).fechaCreacion,
          (project as any).fecha_creacion
        ),
        createdByLabel:
          getText(
            (project as any).createdByName,
            (project as any).createdBy,
            (project as any).userName,
            (project as any).username,
            (project as any).usuario
          ) || "—",
      };
    });
  }, [projects, portfolios]);

  const totalProjects = augmentedProjects.length;

  const completedProjects = useMemo(
    () =>
      augmentedProjects.filter((project) => {
        const normalizedStatus = normalizeProductStatus(project.status);
        return normalizedStatus === "Completado";
      }),
    [augmentedProjects]
  );


  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();

    const filtered = augmentedProjects.filter((project) => {
      const searchableText = [
        project.currentSkuCode,
        project.skuCode,
        project.projectNameLabel,
        project.clientNameLabel,
        project.portfolioCodeLabel,
        project.portfolioNameLabel,
        project.status,
        project.skuLifecycleLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);
      const normalizedStatus = normalizeProductStatus(project.status);
      const matchesTab = activeTab === "all" || normalizedStatus === activeTab;

      return matchesSearch && matchesTab;
    });

    return [...filtered].sort((a, b) => {
      const valueA = getSortValue(a, sortConfig.key);
      const valueB = getSortValue(b, sortConfig.key);

      let result = 0;
      const isDateSort = sortConfig.key === "createdAt" || sortConfig.key === "updatedAt";

      if (isDateSort && typeof valueA === "number" && typeof valueB === "number") {
        result = valueA - valueB;
      } else if (typeof valueA === "number" && typeof valueB === "number") {
        result = valueA - valueB;
      } else {
        result = String(valueA).localeCompare(String(valueB), "es", {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortConfig.direction === "asc" ? result : result * -1;
    });
  }, [augmentedProjects, query, activeTab, sortConfig]);

  const clearFilters = () => {
    setQuery("");
    setActiveTab("all");
    setSortConfig({ key: "createdAt", direction: "desc" });
    setCurrentPage(1);
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
        direction: (key === "createdAt" || key === "updatedAt") ? "desc" : "asc",
      };
    });
  };

  const handleDuplicate = (projectCode: string) => {
    navigate(`/products/new?duplicateFrom=${projectCode}`);
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
    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
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

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProjects.slice(startIndex, startIndex + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize);

  const tabs = [
    {
      key: "all" as ProjectTab,
      label: "Todos los productos",
      count: augmentedProjects.length,
    },
    ...PRODUCT_STATUSES.map((status) => ({
      key: status as ProjectTab,
      label: status,
      count: augmentedProjects.filter((project) => {
        const normalizedStatus = normalizeProductStatus(project.status);
        return normalizedStatus === status;
      }).length,
    })),
  ];

  return (
    <div className="w-full max-w-none">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total productos
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {totalProjects}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Registrados en plataforma
              </p>
            </div>

            <div className="rounded-xl bg-brand-secondary-soft p-3 text-brand-primary">
              <BriefcaseBusiness size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                En Preparación
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {augmentedProjects.filter((p) => normalizeProductStatus(p.status) === "En Preparación").length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Requieren información
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Layers3 size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Completados
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {completedProjects.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Listos para siguiente fase
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <AlertTriangle size={22} />
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
            Mostrando {filteredProjects.length} de {augmentedProjects.length} registros
          </p>
        </div>

        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-[340px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por código SKU, producto, cliente..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ActionButton
                label="Limpiar Filtros"
                onClick={clearFilters}
                variant="outline"
                icon={<RotateCcw size={16} />}
              />

              <ProductActionButton
                source="products"
                onProductCreated={(product) => {
                  const projectId = product?.id || product?.code;
                  setRefreshKey((prev) => prev + 1);
                  setRecentNewProjectId(projectId);

                  const timer = window.setTimeout(() => {
                    setRecentNewProjectId(null);
                    localStorage.removeItem(RECENT_NEW_PROJECT_KEY);
                  }, 25000);

                  return () => window.clearTimeout(timer);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] border-collapse text-sm">
            <thead>
              <tr className="bg-brand-primary text-white">
                <SortableHeader label="Código SKU" sortKey="code" />
                <SortableHeader label="Producto" sortKey="projectName" />
                <SortableHeader label="Código SKU actual" sortKey="skuCode" />
                <SortableHeader label="Cliente" sortKey="clientName" />
                <SortableHeader label="Responsable" sortKey="responsible" />
                <SortableHeader label="Estado ODISEO" sortKey="status" />
                <SortableHeader label="Ciclo de vida" sortKey="skuLifecycle" />
                <SortableHeader label="Fecha Actualización" sortKey="updatedAt" />

                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedProjects.map((item, index) => {
                const isNew = isRecentNewProject(item);
                return (
                <tr
                  key={item.code || item.id}
                  className={`border-b border-slate-100 transition-colors ${
                    isNew ? "bg-blue-50/70" : index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                  } hover:bg-brand-secondary-soft`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-extrabold text-brand-primary font-mono">
                    {item.currentSkuCode || item.skuCode || item.code || item.id || "—"}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {item.productDisplayNameLabel || item.projectNameLabel || "Producto sin nombre"}
                      </span>
                      {isNew && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Nuevo
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-500">
                      {item.classification || "Sin clasificación"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-slate-600">
                    {item.skuCode || "—"}
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-slate-700">
                    {item.clientNameLabel || "—"}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                      {item.responsibleArea || "Sin área"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <ProjectStatusBadge status={item.status} />
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {item.skuLifecycleCode ? (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        item.skuLifecycleCode === "A"
                          ? "border border-green-200 bg-green-50 text-green-700"
                          : item.skuLifecycleCode === "E"
                          ? "border border-amber-200 bg-amber-50 text-amber-700"
                          : "border border-purple-200 bg-purple-50 text-purple-700"
                      }`}>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-current/20 text-xs">
                          {item.skuLifecycleCode}
                        </span>
                        {item.skuLifecycleLabel || "—"}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Sin ciclo</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="font-semibold text-slate-700">
                      {item.updatedAtLabel}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-500">
                      {item.updatedByLabel}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <ActionButton
                        label="Ver"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const productCode = getProductNavigationCode(item);
                          if (!productCode) return;
                          navigate(`/products/${encodeURIComponent(productCode)}`);
                        }}
                      />

                      <ActionButton
                        label="Editar"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const productCode = getProductNavigationCode(item);
                          if (!productCode) return;
                          navigate(`/products/${encodeURIComponent(productCode)}/edit`);
                        }}
                      />

                      <ActionButton
                        label="Copia"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const productCode = getProductNavigationCode(item);
                          if (!productCode) return;
                          handleDuplicate(productCode);
                        }}
                        className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      />
                    </div>
                  </td>
                </tr>
              );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 rounded-full bg-slate-100 p-3">
                        <BriefcaseBusiness size={26} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-bold text-slate-700">
                        No se encontraron productos
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

        <div className="border-t border-slate-100 px-5 py-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs font-medium text-slate-600">
              Mostrando {paginatedProjects.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} a{" "}
              {Math.min(currentPage * pageSize, filteredProjects.length)} de{" "}
              {filteredProjects.length} registros
            </p>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>

              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <span className="text-xs font-medium text-slate-600">
                Página {currentPage} de {totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
// src/modules/portfolio/pages/PortfolioDetailPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

import { useLayout } from "../../../components/layout/LayoutContext";
import {
  getPortfolioByCode,
  deletePortfolioRecord,
  updatePortfolioRecord,
  type PortfolioRecord,
} from "../../../shared/data/portfolioStorage";
import { getProjectsByPortfolioCode } from "../../../shared/data/projectStorage";
import { getCurrentUser } from "../../../shared/data/userStorage";
import {
  getProductsByPortfolio,
} from "../../../shared/data/productPreliminaryStorage";

import Button from "../../../shared/components/ui/Button";
import PreviewRow from "../../../shared/components/display/PreviewRow";
import ProjectStatusBadge from "../../../shared/components/display/ProjectStatusBadge";
import FormCard from "../../../shared/components/forms/FormCard";
import RowActionButtons from "../../../shared/components/table/RowActionButtons";

import { PortfolioProductsPanel } from "../components/PortfolioProductsPanel";

const getPortfolioStatus = (portfolio: any): "active" | "inactive" => {
  const rawStatus = String(
    portfolio.status ||
      portfolio.est ||
      portfolio.estado ||
      (portfolio.isActive === false ? "inactive" : "") ||
      (portfolio.active === false ? "inactive" : "") ||
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

const getPortfolioCodeValue = (portfolio: any): string => {
  return String(portfolio?.codigo || portfolio?.code || portfolio?.id || "");
};

const getPortfolioNameValue = (portfolio: any): string => {
  return String(
    portfolio?.nom ||
      portfolio?.name ||
      portfolio?.portfolioName ||
      portfolio?.nombre ||
      "Sin nombre de portafolio"
  );
};

const getText = (...values: any[]): string => {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== ""
  );

  return value ? String(value).trim() : "";
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

const getPortfolioCreatedAt = (portfolio: any): string =>
  getText(portfolio.createdAt, portfolio.TbPoFCre, portfolio.fch);

const getPortfolioUpdatedAt = (portfolio: any): string =>
  getText(
    portfolio.updatedAt,
    portfolio.TbPoFUlt,
    portfolio.modifiedAt,
    portfolio.lastUpdatedAt,
    portfolio.fechaActualizacion,
    portfolio.createdAt,
    portfolio.TbPoFCre,
    portfolio.fch
  );

const getPortfolioUpdatedBy = (portfolio: any): string =>
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
    portfolio.TbPoUCre
  ) || "—";

export default function PortfolioDetailPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const { portfolioCode } = useParams<{ portfolioCode: string }>();

  const [portfolio, setPortfolio] = useState<PortfolioRecord | null>(null);
  const [validationProjects, setValidationProjects] = useState<any[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "administrator";

  const loadRelatedRecords = (code: string) => {
    const portfolioProjects = getProjectsByPortfolioCode(code);
    const portfolioProducts = getProductsByPortfolio(code);

    setValidationProjects(portfolioProjects);
    setProductCount(portfolioProducts.length);
  };

  useEffect(() => {
    if (!portfolioCode) return;

    const record = getPortfolioByCode(portfolioCode);
    setPortfolio(record || null);
    loadRelatedRecords(portfolioCode);

    setHeader({
      title: "Detalle de Portafolio",
      breadcrumbs: [
        { label: "Portafolios", href: "/portfolio" },
        { label: portfolioCode },
        { label: "Ver" },
      ],
    });

    return () => resetHeader();
  }, [portfolioCode, setHeader, resetHeader]);

  useEffect(() => {
    if (!portfolio) return;

    const portfolioStatus = getPortfolioStatus(portfolio);
    const isPortfolioActive = portfolioStatus === "active";
    const portfolioCodeValue = getPortfolioCodeValue(portfolio);

    setHeader({
      title: "Detalle de Portafolio",
      breadcrumbs: [
        { label: "Portafolios", href: "/portfolio" },
        { label: portfolioCodeValue },
        { label: "Ver" },
      ],
      actions: (
        <div className="flex gap-2">
          {isAdmin && productCount === 0 && validationProjects.length === 0 && (
            <Button
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    "¿Está seguro de que desea eliminar este portafolio?"
                  )
                ) {
                  deletePortfolioRecord(portfolioCodeValue);
                  navigate("/portfolio");
                }
              }}
            >
              Eliminar
            </Button>
          )}

          <Button
            variant={isPortfolioActive ? "outline" : "primary"}
            onClick={() => setShowStatusModal(true)}
          >
            {isPortfolioActive ? "Inactivar Portafolio" : "Activar Portafolio"}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/portfolio/${portfolioCodeValue}/edit`)}
          >
            Editar Portafolio
          </Button>
        </div>
      ),
    });
  }, [
    portfolio,
    productCount,
    validationProjects.length,
    isAdmin,
    setHeader,
    navigate,
  ]);

  const handleTogglePortfolioStatus = () => {
    if (!portfolio) return;

    const currentStatus = getPortfolioStatus(portfolio);
    const nextStatusLabel = currentStatus === "active" ? "Inactivo" : "Activo";
    const now = new Date().toISOString();
    const updatedByName = getText(
      currentUser?.fullName,
      (currentUser as any)?.name,
      (currentUser as any)?.displayName,
      currentUser?.email,
      "Sistema"
    );
    const updatedById = getText(currentUser?.id, currentUser?.email, "system");
    const portfolioCodeValue = getPortfolioCodeValue(portfolio);

    updatePortfolioRecord(portfolioCodeValue, {
      status: nextStatusLabel as any,
      est: nextStatusLabel,
      estado: nextStatusLabel,
      isActive: currentStatus === "inactive",
      active: currentStatus === "inactive",
      statusUpdatedAt: now,
      updatedAt: now,
      TbPoFUlt: now,
      TbPoUUlt: updatedById,
      TbPoUUltNom: updatedByName,
      updatedByName,
      updatedBy: updatedById,
      lastUpdatedBy: updatedByName,
      realizadoPor: updatedByName,
      usuarioActualizacion: updatedByName,
    });

    setPortfolio((prev) =>
      prev
        ? {
            ...prev,
            status: nextStatusLabel as any,
            est: nextStatusLabel,
            estado: nextStatusLabel,
            isActive: currentStatus === "inactive",
            active: currentStatus === "inactive",
            statusUpdatedAt: now,
            updatedAt: now,
            TbPoFUlt: now,
            TbPoUUlt: updatedById,
            TbPoUUltNom: updatedByName,
            updatedByName,
            updatedBy: updatedById,
            lastUpdatedBy: updatedByName,
            realizadoPor: updatedByName,
            usuarioActualizacion: updatedByName,
          }
        : prev
    );

    setShowStatusModal(false);
  };

  if (!portfolio) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="font-semibold text-red-600">
          Portafolio no encontrado
        </div>

        <button
          type="button"
          onClick={() => navigate("/portfolio")}
          className="text-brand-primary hover:underline"
        >
          Volver a Portafolios
        </button>
      </div>
    );
  }

  const portfolioStatus = getPortfolioStatus(portfolio);
  const isPortfolioActive = portfolioStatus === "active";
  const portfolioCodeValue = getPortfolioCodeValue(portfolio);
  const portfolioNameValue = getPortfolioNameValue(portfolio);

  return (
    <div className="w-full max-w-none space-y-6 bg-[#f6f8fb]">
      <button
        type="button"
        onClick={() => navigate("/portfolio")}
        className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-primary"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>

      {/* Encabezado del portafolio */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{portfolioNameValue}</h2>
              <p className="mt-1 text-sm opacity-80">
                Código: {portfolioCodeValue}
              </p>
            </div>

            <span
              className={
                isPortfolioActive
                  ? "rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                  : "rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
              }
            >
              {isPortfolioActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Datos del portafolio */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormCard title="Datos Generales" icon="▦" color="#00395A">
          <div className="space-y-4">
            <PreviewRow
              label="Cliente"
              value={(portfolio as any).clientName || (portfolio as any).cli}
            />
            <PreviewRow
              label="Ejecutivo Comercial"
              value={(portfolio as any).ejecutivoName || (portfolio as any).ej}
            />
            <PreviewRow
              label="Planta"
              value={(portfolio as any).plantaName || (portfolio as any).pl}
            />
            <PreviewRow
              label="Fecha Registro"
              value={formatPortfolioDateTime(getPortfolioCreatedAt(portfolio))}
            />
            <PreviewRow
              label="Últ. actualización"
              value={formatPortfolioDateTime(getPortfolioUpdatedAt(portfolio))}
            />
            <PreviewRow
              label="Realizado por"
              value={getPortfolioUpdatedBy(portfolio)}
            />
          </div>
        </FormCard>

        <FormCard title="Datos de Producto / ADN" icon="◇" color="#00A1DE">
          <div className="space-y-4">
            <PreviewRow
              label="Envoltura"
              value={(portfolio as any).envoltura || (portfolio as any).env}
            />
            <PreviewRow label="Sector" value={(portfolio as any).sector} />
            <PreviewRow
              label="Segmento"
              value={(portfolio as any).segmento || (portfolio as any).seg}
            />
            <PreviewRow
              label="Sub-segmento"
              value={
                (portfolio as any).subSegmento || (portfolio as any).subseg
              }
            />
            <PreviewRow
              label="Uso Final"
              value={(portfolio as any).usoFinal || (portfolio as any).uf}
            />
            <PreviewRow
              label="AFMarketID"
              value={(portfolio as any).afMarketId || (portfolio as any).af}
            />
            <PreviewRow
              label="Máquina Cliente"
              value={(portfolio as any).maquinaCliente || (portfolio as any).maq}
            />
          </div>
        </FormCard>
      </div>

      {/* Nueva sección principal: Productos Preliminares del Portafolio */}
      <PortfolioProductsPanel
        portfolio={portfolio}
        onPortfolioUpdated={() => loadRelatedRecords(portfolioCodeValue)}
      />

      {/* Sección secundaria de validación asociados */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div>
            <h3 className="font-bold text-gray-800">
              Productos en validación
            </h3>
            <p className="text-xs text-gray-500">
              Los productos preliminares que requieren validación de
              Artes Gráficas o R&D, debe realizarse una muestra.
            </p>
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-gray-200 bg-white text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Código</th>
              <th className="px-6 py-3 text-left font-semibold">Nombre</th>
              <th className="px-6 py-3 text-left font-semibold">Tipo</th>
              <th className="px-6 py-3 text-left font-semibold">Estado</th>
              <th className="px-6 py-3 text-left font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {validationProjects.map((project) => (
              <tr
                key={project.code || project.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-bold text-brand-primary">
                  {project.code || project.id}
                </td>

                <td className="px-6 py-4">
                  {project.projectName || project.n}
                </td>

                <td className="px-6 py-4 text-gray-500">
                  {project.projectPurpose ||
                    project.validationRoute ||
                    project.projectType ||
                    "Validación"}
                </td>

                <td className="px-6 py-4">
                  <ProjectStatusBadge status={project.status || project.e} />
                </td>

                <td className="px-6 py-4">
                  <RowActionButtons
                    viewPath={`/products/${project.code || project.id}`}
                    editPath={`/products/${project.code || project.id}/edit`}
                  />
                </td>
              </tr>
            ))}

            {validationProjects.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center italic text-gray-500"
                >
                  Aún no hay productos preliminares en validación.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de cambio de estado del portafolio */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {isPortfolioActive
                  ? "¿Inactivar portafolio?"
                  : "¿Activar portafolio?"}
              </h3>

              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-6 text-sm text-slate-600">
              {isPortfolioActive
                ? "Este portafolio dejará de estar disponible para crear nuevos productos preliminares. Los productos y Productos ya asociados se mantendrán para consulta y seguimiento."
                : "Este portafolio volverá a estar disponible para crear productos preliminares."}
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancelar
              </Button>

              <Button
                variant={isPortfolioActive ? "danger" : "primary"}
                onClick={handleTogglePortfolioStatus}
              >
                {isPortfolioActive ? "Inactivar" : "Activar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
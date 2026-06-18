import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";
import { getCurrentUser } from "../../../shared/data/userStorage";
import {
  getClientByCode,
  canClientHavePortfolio,
  getClientPortfolioEligibilityMessage,
  updateClient,
} from "../../../shared/data/clientStorage";
import { getPortfoliosByClient, type PortfolioRecord } from "../../../shared/data/portfolioStorage";
import Button from "../../../shared/components/ui/Button";
import PreviewRow from "../../../shared/components/display/PreviewRow";
import FormCard from "../../../shared/components/forms/FormCard";
import RowActionButtons from "../../../shared/components/table/RowActionButtons";

const getText = (...values: any[]) => {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== ""
  );

  return value ? String(value) : "—";
};

const getDisplayStatus = (client: any): string => {
  if (client.activeLogical === "0") {
    return "Inactivo";
  }
  if (client.clientApprovalStatus === "A") {
    return "Aprobado";
  }
  return "Pendiente";
};

const getOdiseoStatus = (client: any): string => {
  return getDisplayStatus(client) === "Inactivo" ? "Inactivo" : "Activo";
};

export default function ClientDetailPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const { clientCode } = useParams<{ clientCode: string }>();

  const [client, setClient] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<PortfolioRecord[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (clientCode) {
      const clientData = getClientByCode(clientCode);
      if (clientData) {
        setClient(clientData);
        setPortfolios(getPortfoliosByClient(clientData));

        const currentUser = getCurrentUser();
        const isAdmin = currentUser?.role === "administrator";
        const isClientInactive = clientData.activeLogical === "0";

        setHeader({
          title: "Detalle de Cliente",
          breadcrumbs: [
            { label: "Clientes", href: "/clients" },
            { label: clientData.code },
            { label: "Ver" },
          ],
          actions: isAdmin ? (
            <div className="flex gap-2">
              <Button
                variant={isClientInactive ? "primary" : "outline"}
                onClick={() => setShowStatusModal(true)}
              >
                {isClientInactive ? "Activar Cliente" : "Inactivar Cliente"}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/clients/${clientData.code}/edit`)}
              >
                Editar Cliente
              </Button>
            </div>
          ) : undefined,
        });
      }
    }

    return () => resetHeader();
  }, [clientCode, setHeader, resetHeader, navigate]);

  const handleToggleClientStatus = () => {
    if (!client) return;

    const isCurrentlyInactive = client.activeLogical === "0";
    const now = new Date().toISOString();
    updateClient(client.id, {
      activeLogical: isCurrentlyInactive ? "1" : "0",
      updatedAt: now,
    });

    setClient((prev: any) =>
      prev
        ? {
            ...prev,
            activeLogical: isCurrentlyInactive ? "1" : "0",
            updatedAt: now,
          }
        : prev
    );

    setShowStatusModal(false);
  };

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-600 font-semibold">Cliente no encontrado</div>
        <button onClick={() => navigate("/clients")} className="text-brand-primary hover:underline">
          Volver a Clientes
        </button>
      </div>
    );
  }

  const clientCodeValue = getText(client.code, client.codigo, client.id);
  const clientName = getText(client.razonSocial, client.businessName, client.nombre, client.name);
  const clientRuc = getText(client.ruc, client.RUC);
  const clientEmail = getText(client.email, client.correo);
  const clientIndustry = getText(client.rubro, client.industry, client.segmento);


  return (
    <div className="w-full max-w-none bg-[#f6f8fb] space-y-6">
      <button
        type="button"
        onClick={() => navigate("/clients")}
        className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
          <div>
            <h2 className="text-2xl font-bold">{clientName}</h2>
            <p className="text-sm opacity-80 mt-1">Código: {clientCodeValue}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormCard title="Información general" icon="▦" color="#00395A">
          <div className="space-y-4">
            <PreviewRow label="Código de cliente" value={clientCodeValue} />
            <PreviewRow label="Nombre de cliente" value={clientName} />
            <PreviewRow label="Correo de Empresa" value={clientEmail} />
            <PreviewRow label="Número de RUC" value={clientRuc} />
            <PreviewRow label="Sector" value={clientIndustry} />
          </div>
        </FormCard>

        <FormCard title="Datos de sistema" icon="◇" color="#00A1DE">
          <div className="space-y-4">
            <PreviewRow label="Activo logico" value={getOdiseoStatus(client)} />
            <PreviewRow
              label="Estado de Cliente"
              value={getDisplayStatus(client)}
            />
            <PreviewRow label="Fecha de registro" value={client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "—"} />
            <PreviewRow label="Última actualización" value={client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : "—"} />
            {client.origin && (
              <PreviewRow label="Origen de registro" value={getText(client.origin, client.createdBy)} />
            )}
          </div>
        </FormCard>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800">Portafolios Asociados</h3>
            <p className="text-sm text-slate-500 mt-1">Portafolios registrados para este cliente.</p>
          </div>
          
          {canClientHavePortfolio(client.status) ? (
            <button
              onClick={() => navigate(`/portfolio/new?clientCode=${clientCodeValue}`)}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-primary-hover"
            >
              + Nuevo Portafolio
            </button>
          ) : null}
        </div>

        {!canClientHavePortfolio(client.status) && (
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Aviso:</strong> {getClientPortfolioEligibilityMessage(client.status)}
            </p>
          </div>
        )}
        
        <table className="w-full border-collapse text-sm">
          <thead className="bg-white text-gray-500 border-b border-gray-200 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Código</th>
              <th className="px-6 py-3 text-left font-semibold">Nombre</th>
              <th className="px-6 py-3 text-left font-semibold">Planta de Origen</th>
              <th className="px-6 py-3 text-left font-semibold">Envoltura</th>
              <th className="px-6 py-3 text-left font-semibold">Envasado / Máquina</th>
              <th className="px-6 py-3 text-left font-semibold">Estado</th>
              <th className="px-6 py-3 text-left font-semibold text-center">Producto</th>
              <th className="px-6 py-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {portfolios.map((portfolio) => (
              <tr key={portfolio.codigo || portfolio.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-brand-primary">{portfolio.codigo || portfolio.id}</td>
                <td className="px-6 py-4">{portfolio.nom || portfolio.nombre || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{portfolio.plantaName || portfolio.pl || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{portfolio.envoltura || portfolio.env || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{portfolio.maquinaCliente || portfolio.maq || '—'}</td>
                <td className="px-6 py-4">
                  <span className={portfolio.status === "Activo"
                    ? "rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                    : portfolio.status === "Inactivo"
                    ? "rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700"
                    : "rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700"
                  }>
                    {portfolio.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-center">—</td>
                <td className="px-6 py-4">
                  <RowActionButtons 
                    viewPath={`/portfolio/${portfolio.codigo || portfolio.id}`}
                    editPath={`/portfolio/${portfolio.codigo || portfolio.id}/edit`}
                  />
                </td>
              </tr>
            ))}
            {portfolios.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">Este cliente no tiene portafolios asociados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {client.activeLogical === "0"
                  ? "¿Activar cliente?"
                  : "¿Inactivar cliente?"}
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
              {client.activeLogical === "0"
                ? "Este cliente volverá a estar disponible para crear portafolios."
                : "Este cliente dejará de estar disponible para crear nuevos portafolios. Los portafolios ya asociados se mantendrán para consulta y seguimiento."}
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancelar
              </Button>

              <Button
                variant={client.activeLogical === "0" ? "primary" : "danger"}
                onClick={handleToggleClientStatus}
              >
                {client.activeLogical === "0" ? "Activar" : "Inactivar"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

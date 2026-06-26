import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";
import {
  createClient,
  getNextClientCode,
  findDuplicateClient,
} from "../../../shared/data/clientStorage";
import { registerClientStatusChange } from "../../../shared/data/clientStatusStorage";
import { mockSendEmail } from "../../../shared/data/notificationStorage";
import { type ClientMirror } from "../../../shared/data/clientMirrorStorage";
import { getCatalogOptions } from "../../../shared/catalogs";

import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormSelect from "../../../shared/components/forms/FormSelect";
import FormActionButtons from "../../../shared/components/forms/FormActionButtons";
import SystemIntegrationClientSearch from "../../../shared/components/forms/SystemIntegrationClientSearch";
import ClientDuplicateHandler from "../../../shared/components/forms/ClientDuplicateHandler";

const RECENT_NEW_CLIENT_KEY = "odiseo_recent_new_client";

interface FormState {
  siClient: ClientMirror | null;
  email: string;
  businessName: string;
  ruc: string;
  industry: string;
  clientType: string;
  clientSector: string;
  clientCountry: string;
}

export default function ClientCreatePage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const [clientCode] = useState(getNextClientCode());

  const [form, setForm] = useState<FormState>({
    siClient: null,
    email: "",
    businessName: "",
    ruc: "",
    industry: "",
    clientType: "",
    clientSector: "",
    clientCountry: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [duplicateClient, setDuplicateClient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasNoSiResults, setHasNoSiResults] = useState(false);

  useEffect(() => {
    setHeader({
      title: "Crear Nuevo Cliente",
      breadcrumbs: [
        { label: "Clientes", href: "/clients" },
        { label: "Crear Cliente" },
      ],
      badges: (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          ID: {clientCode}
        </span>
      ),
    });
    return () => resetHeader();
  }, [setHeader, resetHeader, clientCode]);


  const handleSiClientSelect = (client: ClientMirror) => {
    setForm((prev) => ({
      ...prev,
      siClient: client,
      ruc: client.ruc,
      email: client.email || "",
      businessName: client.razonSocial,
      industry: client.sector,
    }));
    setSearchQuery("");
  };

  const isSiClientSelected = form.siClient !== null;

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!form.siClient) {
      errors.siClient = "Selecciona un cliente válido del Sistema Integral.";
    }

    return errors;
  }, [form]);

  const completionPercentage = useMemo(() => {
    return form.siClient ? 100 : 0;
  }, [form]);

  const validationErrorList = Object.values(validationErrors).filter(
    (error): error is string => Boolean(error)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSuccessMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const duplicate = findDuplicateClient(form.email, form.ruc);
      if (duplicate) {
        setDuplicateClient(duplicate);
        return;
      }

      const newClient = createClient({
        businessName: form.businessName,
        email: form.email,
        ruc: form.ruc,
        industry: form.industry,
        status: "Por aprobar",
        siClientId: form.siClient?.id,
        siClientCode: form.siClient?.code,
        clientType: form.clientType,
        clientSector: form.clientSector,
        clientCountry: form.clientCountry,
      } as any);

      registerClientStatusChange(
        newClient.id,
        null,
        "Por aprobar",
        "system",
        `Cliente creado - ${form.siClient ? "Información autocompleta de SI" : "Ingreso manual - pendiente validación en SI"}`
      );

      const successMsg = form.siClient
        ? "Cliente enlazado con el sistema integral"
        : "Cliente creado exitosamente y se solicitó la validación de Tesorería";
      setSuccessMessage(successMsg);

      // Store recent new client indicator for 10 seconds
      localStorage.setItem(RECENT_NEW_CLIENT_KEY, JSON.stringify({
        clientId: newClient.code || newClient.id,
        expiresAt: Date.now() + 25000,
      }));

      setTimeout(() => navigate("/clients"), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error al crear cliente:", error);
      alert(`Error al crear el cliente: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="rounded-lg border-2 border-green-300 bg-green-50 p-8 text-center max-w-md">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-lg font-bold text-green-900">{successMessage}</p>
          <p className="text-sm text-green-700 mt-2">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (duplicateClient) {
    return (
      <div className="w-full max-w-none bg-[#f6f8fb] p-5">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setDuplicateClient(null)}
            className="mb-4 text-sm text-brand-primary hover:underline"
          >
            ← Volver al formulario
          </button>

          <ClientDuplicateHandler
            existingClient={duplicateClient}
            loading={loading}
            onViewDetails={() => navigate(`/clients/${duplicateClient.code}`)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <button
        type="button"
        onClick={() => navigate("/clients")}
        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>

      <form onSubmit={handleSubmit}>
        <div className="grid min-h-[calc(100vh-230px)] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)]">
          <div className="space-y-5">
            <FormCard title="Buscar en Sistema Integral" icon="🔍" color="#0D9488" required>
              <div className="space-y-3">
                <SystemIntegrationClientSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelect={handleSiClientSelect}
                  onNoResults={setHasNoSiResults}
                  placeholder="Buscar por código, razón social, RUC..."
                />

                {isSiClientSelected && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-2">
                      ✓ Cliente del Sistema Integral seleccionado
                    </p>
                    <p className="text-sm text-green-800">
                      Los datos básicos se completarán automáticamente.
                    </p>
                  </div>
                )}
              </div>
            </FormCard>

            <FormCard
              title="Datos del Sistema Integral"
              icon="👤"
              color="#00395A"
              required
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput
                  label="Nombre de Cliente"
                  value={form.businessName}
                  disabled
                  placeholder="Importado desde Sistema Integral"
                />

                <FormInput
                  label="Correo empresa"
                  value={form.email}
                  disabled
                  type="email"
                  placeholder="Importado desde Sistema Integral"
                />

                <FormInput
                  label="Número de RUC"
                  value={form.ruc}
                  disabled
                  placeholder="Importado desde Sistema Integral"
                />

                <FormInput
                  label="Sector *"
                  value={form.industry}
                  disabled
                  placeholder="Importado desde Sistema Integral"
                />
              </div>

              {isSiClientSelected && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex gap-2">
                  <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Los campos provenientes del Sistema Integral están bloqueados y no pueden editarse.
                  </p>
                </div>
              )}
            </FormCard>

            <FormCard
              title="Clasificación del Cliente"
              icon="🏷️"
              color="#F59E0B"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormSelect
                  label="Tipo de Cliente"
                  value={form.clientType}
                  onChange={(value) => setForm((prev) => ({ ...prev, clientType: value }))}
                  options={getCatalogOptions("client_type", { activeOnly: true })}
                  placeholder="Seleccionar tipo..."
                />

                <FormSelect
                  label="Sector"
                  value={form.clientSector}
                  onChange={(value) => setForm((prev) => ({ ...prev, clientSector: value }))}
                  options={getCatalogOptions("client_sector", { activeOnly: true })}
                  placeholder="Seleccionar sector..."
                />

                <FormSelect
                  label="País"
                  value={form.clientCountry}
                  onChange={(value) => setForm((prev) => ({ ...prev, clientCountry: value }))}
                  options={getCatalogOptions("client_country", { activeOnly: true })}
                  placeholder="Seleccionar país..."
                />
              </div>
            </FormCard>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="px-5 py-4 bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
                <div className="text-xs font-bold uppercase tracking-wide text-white/75">
                  Resumen
                </div>
                <div className="mt-2 text-lg font-extrabold">Nuevo Cliente</div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Código</p>
                  <p className="text-lg font-bold text-brand-primary">{clientCode}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Origen</p>
                  <p className="text-sm font-bold text-brand-primary">
                    {isSiClientSelected ? "Sistema Integral" : "Pendiente de selección"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Progreso</p>
                  <div className="mt-1">
                    <div className="text-sm font-bold text-amber-600">
                      {completionPercentage}% completado
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-amber-500 transition-all"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Campos Requeridos
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className={form.businessName ? "text-green-600" : "text-slate-400"}>
                      {form.businessName ? "✓" : "○"} Razón Social
                    </li>
                    <li className={form.email ? "text-green-600" : "text-slate-400"}>
                      {form.email ? "✓" : "○"} Correo Corporativo
                    </li>
                    <li className={form.ruc ? "text-green-600" : "text-slate-400"}>
                      {form.ruc ? "✓" : "○"} RUC
                    </li>
                    <li className={form.industry ? "text-green-600" : "text-slate-400"}>
                      {form.industry ? "✓" : "○"} Rubro
                    </li>
                  </ul>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    <span className="text-red-500">*</span> Campos obligatorios
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-40 mt-6 border-t border-slate-200 bg-[#f6f8fb]/95 py-4 backdrop-blur">
          <FormActionButtons
            onCancel={() => navigate("/clients")}
            validationErrorList={validationErrorList}
            submitAttempted={submitAttempted}
            submitLabel="Crear Cliente"
            cancelLabel="Cancelar"
            isLoading={loading}
            validationTitle="Faltan campos obligatorios."
          />
        </div>
      </form>
    </div>
  );
}


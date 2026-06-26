import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";

import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormActionButtons from "../../../shared/components/forms/FormActionButtons";

import {
  getClientByCode,
  updateClient,
} from "../../../shared/data/clientStorage";

type ClientFormData = {
  businessName: string;
  email: string;
  ruc: string;
  industry: string;
};

export default function ClientEditPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const { clientCode } = useParams<{ clientCode: string }>();

  const [form, setForm] = useState<ClientFormData | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    if (!clientCode) {
      setError("C�digo de cliente no v�lido");
      setLoading(false);
      return;
    }

    const client = getClientByCode(clientCode);
    if (!client) {
      setError(`Cliente con c�digo ${clientCode} no encontrado`);
      setLoading(false);
      return;
    }

    setClientId(client.id);
    setForm({
      businessName: client.businessName,
      email: client.email,
      ruc: client.ruc,
      industry: client.industry,
    });
    setLoading(false);
  }, [clientCode]);

  useEffect(() => {
    if (clientCode && !loading) {
      setHeader({
        title: "Editar Cliente",
        breadcrumbs: [
          { label: "Clientes", href: "/clients" },
          { label: clientCode },
          { label: "Editar" },
        ],
      });
    }
    return () => resetHeader();
  }, [clientCode, loading, setHeader, resetHeader]);

  const validationErrors = useMemo(() => {
    return {};
  }, [form]);

  const validationErrorList = Object.values(validationErrors).filter(Boolean) as string[];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (Object.keys(validationErrors).length > 0 || !form || !clientCode) {
      return;
    }

    updateClient(clientId, {
      industry: form.industry,
    });

    navigate("/clients");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando cliente...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-600 font-semibold">{error || "Error cargando cliente"}</div>
        <button
          onClick={() => navigate("/clients")}
          className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium"
        >
          Volver a Clientes
        </button>
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
        <div className="max-w-3xl mx-auto">
          <FormCard title="Datos del Sistema Integral" icon="👤" color="#00395A">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInput
                label="Razón Social"
                value={form.businessName}
                disabled
                placeholder="Importado desde Sistema Integral"
              />

              <FormInput
                label="Correo Electrónico"
                value={form.email}
                disabled
                placeholder="Importado desde Sistema Integral"
              />

              <FormInput
                label="Numero de RUC"
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

            {form && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex gap-2">
                <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Los campos provenientes del Sistema Integral están bloqueados y no pueden editarse.
                </p>
              </div>
            )}
          </FormCard>
        </div>

        <div className="sticky bottom-0 z-40 mt-6 border-t border-slate-200 bg-[#f6f8fb]/95 py-4 backdrop-blur">
          <FormActionButtons
            onCancel={() => navigate("/clients")}
            validationErrorList={validationErrorList}
            submitAttempted={submitAttempted}
            submitLabel="Guardar Cambios"
            cancelLabel="Cancelar"
            validationTitle="Faltan campos obligatorios."
          />
        </div>
      </form>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  getStatusCatalog,
  getPlantsCatalog,
  getWrappingsCatalog,
  getStatusById,
  getPlantById,
  getWrappingById,
  getFinalUseById,
  getPackingMachineById,
  getPackingMachinesByWrappingId,
  getFinalUses,
} from "../../../shared/catalogs/portfolio-adapters";

import {
  getActiveExecutiveRecords,
  getExecutiveById,
} from "../../../shared/data/executiveStorage";

import { getPortfolioByCode, updatePortfolioRecord } from "../../../shared/data/portfolioStorage";
import { getCurrentUser } from "../../../shared/data/userStorage";
import { getClientCatalogRecords, canClientHavePortfolio } from "../../../shared/data/clientStorage";

import ClientSearch from "../../../shared/components/catalog/ClientSearch";
import ExecutiveSearch from "../../../shared/components/catalog/ExecutiveSearch";
import FinalUseCatalogModal from "../../../shared/components/catalog/FinalUseCatalogModal";
import PortfolioPreview from "../../../shared/components/ui/PortfolioPreview";
import SectionCard from "../../../shared/components/ui/SectionCard";
import EnvolturaSelector from "../../../shared/components/forms/EnvolturaSelector";
import PlantSelector from "../../../shared/components/forms/PlantSelector";
import { useLayout } from "../../../components/layout/LayoutContext";

import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormActionButtons,
} from "../../../shared/components/forms";

type EnvolturaOption = "POUCH" | "BOLSA" | "LAMINA";

type PortfolioFormData = {
  codigo: string;
  estadoId: string;
  clienteId: string;
  ejecutivoId: string;
  plantaId: string;
  licitacion: "Sí" | "No";
  codigoRFQ: string;
  nombrePortafolio: string;
  descripcionPortafolio: string;
  envolturaId: string;
  usoFinalId: string;
  envasadoId: string;
};

const AMCOR = {
  navy: "#00395A",
  navyDark: "#002b43",
  blue: "#00A1DE",
  green: "#27ae60",
  purple: "#7E3FB2",
  amber: "#f39c12",
  border: "#dde3ea",
  bg: "#f6f8fb",
};

function recordToFormData(record: Record<string, unknown>): PortfolioFormData {
  return {
    codigo: String(record.codigo || record.id || ""),
    estadoId: String(record.estadoId || record.statusId || getStatusCatalog()[0]?.id || 1),
    clienteId: String(record.clienteId || record.clienteId || ""),
    ejecutivoId: String(record.ejecutivoId || record.ejecutivoId || ""),
    plantaId: String(record.plantaId || record.plantaId || ""),
    licitacion: (record.licitacion as "Sí" | "No") || "No",
    codigoRFQ: String(record.codigoRFQ || record.codigoRFQ || ""),
    nombrePortafolio: String(record.nombrePortafolio || record.nom || ""),
    descripcionPortafolio: String(record.descripcionPortafolio || record.desc || ""),
    envolturaId: String(record.envolturaId || record.envolturaId || ""),
    usoFinalId: String(record.usoFinalId || record.usoFinalId || ""),
    envasadoId: String(record.envasadoId || record.envasadoId || ""),
  };
}

export default function PortfolioEditPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const { portfolioCode } = useParams<{ portfolioCode: string }>();

  const [form, setForm] = useState<PortfolioFormData | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showFinalUseCatalog, setShowFinalUseCatalog] = useState(false);
  const [showTaxonomyDetail, setShowTaxonomyDetail] = useState(false);
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof PortfolioFormData, boolean>>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const [canEdit, setCanEdit] = useState(false);
  
  useEffect(() => {
    const user = getCurrentUser();
    setCanEdit(!!user);
  }, []);

  const portfolioCodeStr = portfolioCode || "";

  useEffect(() => {
    if (!portfolioCodeStr) {
      setError("Código de portafolio no válido");
      setLoading(false);
      return;
    }

    const record = getPortfolioByCode(portfolioCodeStr);
    if (!record) {
      setError(`Portafolio con código ${portfolioCodeStr} no encontrado`);
      setLoading(false);
      return;
    }

    setForm(recordToFormData(record));
    setLoading(false);
  }, [portfolioCodeStr]);

  const selectedStatus = getStatusById(form?.estadoId || "");
  const allClients = getClientCatalogRecords();
  const eligibleClients = useMemo(() => allClients.filter((c) => canClientHavePortfolio(c.status)), [allClients]);
  const selectedClient = allClients.find((c) => c.id === form?.clienteId);

  const comercialUsers = useMemo(() => getActiveExecutiveRecords(), []);
  const selectedExecutive = comercialUsers.find((u) => String(u.id) === form?.ejecutivoId);
  const selectedPlant = getPlantById(form?.plantaId || "");
  const selectedWrapping = getWrappingById(form?.envolturaId || "");
  const selectedFinalUse = getFinalUseById(form?.usoFinalId || "");

  const selectedPackingMachine = useMemo(() => {
    if (!form?.envasadoId) return null;
    if (form.envasadoId === "generic") {
      return {
        id: "generic",
        code: "GENERIC",
        name: "Máquina genérica",
        wrappingId: form.envolturaId
      };
    }
    return getPackingMachineById(form.envasadoId);
  }, [form?.envasadoId, form?.envolturaId]);

  const packingMachines = useMemo(() => {
    if (!form?.envolturaId) return [];
    const machines = getPackingMachinesByWrappingId(form.envolturaId);
    return [
      {
        id: "generic",
        code: "GENERIC",
        name: "Máquina genérica",
        wrappingId: form.envolturaId
      },
      ...machines
    ];
  }, [form?.envolturaId]);

  const requiredChecks = useMemo(() => {
    if (!form) return [];
    const checks: Array<{ field: string; label: string; completed: boolean }> = [
      { field: "clienteId", label: "Cliente", completed: Boolean(form.clienteId) },
      { field: "ejecutivoId", label: "Ejecutivo comercial", completed: Boolean(form.ejecutivoId) },
      { field: "plantaId", label: "Planta de origen de solicitud", completed: Boolean(form.plantaId) },
      { field: "nombrePortafolio", label: "Nombre de portafolio", completed: Boolean(form.nombrePortafolio.trim()) },
      { field: "envolturaId", label: "Envoltura", completed: Boolean(form.envolturaId) },
      { field: "usoFinalId", label: "Uso final", completed: Boolean(form.usoFinalId) },
      { field: "envasadoId", label: "Envasado / Máquina de cliente", completed: Boolean(form.envasadoId) },
    ];

    if (form.licitacion === "Sí") {
      checks.splice(4, 0, {
        field: "codigoRFQ",
        label: "Código RFQ",
        completed: Boolean(form.codigoRFQ.trim()),
      });
    }

    return checks;
  }, [form]);

  const completionPercentage = useMemo(() => {
    const completed = requiredChecks.filter((item) => item.completed).length;
    return requiredChecks.length
      ? Math.round((completed / requiredChecks.length) * 100)
      : 0;
  }, [requiredChecks]);

  const getSectionStatus = (sectionFields: string[]): "pending" | "completed" | "error" => {
    if (!form) return "pending";
    const allCompleted = sectionFields.every((field) => {
      if (field === "codigoRFQ" && form.licitacion === "No") return true;
      if (field === "clienteId") return Boolean(form.clienteId);
      if (field === "ejecutivoId") return Boolean(form.ejecutivoId);
      if (field === "plantaId") return Boolean(form.plantaId);
      if (field === "nombrePortafolio") return Boolean(form.nombrePortafolio.trim());
      if (field === "descripcionPortafolio") return true; // optional
      if (field === "licitacion") return true;
      if (field === "codigoRFQ") return Boolean(form.codigoRFQ.trim());
      if (field === "envolturaId") return Boolean(form.envolturaId);
      if (field === "usoFinalId") return Boolean(form.usoFinalId);
      if (field === "envasadoId") return Boolean(form.envasadoId);
      return false;
    });

    if (submitAttempted && !allCompleted) {
      const hasError = sectionFields.some(
        (field) =>
          validationErrors[field as keyof PortfolioFormData] &&
          !(field === "codigoRFQ" && form.licitacion === "No")
      );
      return hasError ? "error" : "pending";
    }

    return allCompleted ? "completed" : "pending";
  };

  const normalizeText = (value?: string | number | null) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const normalizeEnvolturaOption = (
    value?: string | number | null
  ): EnvolturaOption | "" => {
    const text = normalizeText(value);

    if (text.includes("pouch")) return "POUCH";
    if (text.includes("bolsa")) return "BOLSA";
    if (text.includes("lamina")) return "LAMINA";

    return "";
  };

  const getCatalogItemText = (item: any): string =>
    normalizeText(
      [
        item?.id,
        item?.legacyId,
        item?.code,
        item?.name,
        item?.raw?.id,
        item?.raw?.item,
        item?.raw?.code,
        item?.raw?.value,
        item?.raw?.name,
      ].join(" ")
    );

  const findWrappingItem = (value?: string | number | null) => {
    if (!value) return undefined;

    const target = normalizeText(value);
    const direct = getWrappingById(value);

    if (direct) return direct;

    return getWrappingsCatalog().find((item) => {
      const candidates = [
        item.id,
        item.legacyId,
        item.code,
        item.name,
        item.raw?.id,
        item.raw?.item,
        item.raw?.code,
        item.raw?.value,
        item.raw?.name,
      ];

      return candidates.some((candidate) => normalizeText(candidate) === target);
    });
  };

  const getEnvolturaOption = (value: string): EnvolturaOption | "" => {
    if (!value) return "";

    const wrapping = findWrappingItem(value);
    const text = normalizeText([value, getCatalogItemText(wrapping)].join(" "));

    return normalizeEnvolturaOption(text);
  };

  const getIdFromEnvolturaOption = (option: string): string => {
    const normalizedOption = normalizeEnvolturaOption(option);

    if (!normalizedOption) return "";

    const wrapping = getWrappingsCatalog().find((item) => {
      const text = getCatalogItemText(item);

      if (normalizedOption === "POUCH") return text.includes("pouch");
      if (normalizedOption === "BOLSA") return text.includes("bolsa");
      if (normalizedOption === "LAMINA") return text.includes("lamina");

      return false;
    });

    return wrapping ? String(wrapping.id) : normalizedOption;
  };

  const getPlantOption = (
    id: string
  ): "AF_LIMA" | "AF_CALI" | "AF_SANTIAGO" | "AF_SAN_LUIS" | "" => {
    if (!id) return "";

    const plant = getPlantById(id);
    if (!plant) return "";

    const text = normalizeText(
      [
        id,
        plant.id,
        plant.code,
        plant.name,
        plant.raw?.id,
        plant.raw?.item,
        plant.raw?.code,
        plant.raw?.name,
      ].join(" ")
    );

    if (text.includes("lim")) return "AF_LIMA";
    if (text.includes("cal")) return "AF_CALI";
    if (text.includes("stn") || text.includes("santiago")) return "AF_SANTIAGO";
    if (text.includes("sl") || text.includes("san luis")) return "AF_SAN_LUIS";

    return "";
  };

  const getIdFromPlantOption = (
    option: "AF_LIMA" | "AF_CALI" | "AF_SANTIAGO" | "AF_SAN_LUIS"
  ): string => {
    const plants = getPlantsCatalog();

    const plant = plants.find((p) => {
      const text = getCatalogItemText(p);

      if (option === "AF_LIMA") return text.includes("lim");
      if (option === "AF_CALI") return text.includes("cal");
      if (option === "AF_SANTIAGO") return text.includes("stn") || text.includes("santiago");
      if (option === "AF_SAN_LUIS") return text.includes("sl") || text.includes("san luis");

      return false;
    });

    return plant ? String(plant.id) : "";
  };

  // Update header dynamically
useEffect(() => {
  if (!form) return;

  setHeader({
    title: "Editar Portafolio",
    breadcrumbs: [
      { label: "Portafolio", href: "/portfolio" },
      { label: form.codigo || "Portafolio" },
      { label: "Editar" },
    ],
    badges: (
      <>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          ID: {form.codigo}
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          Edición
        </span>
      </>
    ),
  });

  return () => resetHeader();
}, [setHeader, resetHeader, form?.codigo]);


  const validationErrors = useMemo(() => {
    if (!form) return {};
    const errors: Partial<Record<keyof PortfolioFormData, string>> = {};

    if (!form.clienteId) errors.clienteId = "Selecciona el nombre del cliente.";
    if (!form.ejecutivoId) errors.ejecutivoId = "Selecciona el ejecutivo comercial.";
    if (!form.plantaId) errors.plantaId = "Selecciona la planta de origen.";

    if (form.licitacion === "Sí" && !form.codigoRFQ.trim()) {
      errors.codigoRFQ = "Ingresa el código RFQ.";
    }

    if (!form.nombrePortafolio.trim()) {
      errors.nombrePortafolio = "Ingresa el nombre del portafolio.";
    }

    if (!form.envolturaId) errors.envolturaId = "Selecciona la envoltura.";
    if (!form.usoFinalId) errors.usoFinalId = "Selecciona el uso final.";
    if (!form.envasadoId) errors.envasadoId = "Ingresa la máquina del cliente.";

    return errors;
  }, [form]);

  const validationErrorList = Object.values(validationErrors).filter(
    (error): error is string => Boolean(error)
  );

  const updateField = (field: keyof PortfolioFormData, value: string) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    );
  };

  const markFieldAsTouched = (field: keyof PortfolioFormData) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const shouldShowFieldError = (field: keyof PortfolioFormData) => {
    return Boolean(
      validationErrors[field] && (submitAttempted || touchedFields[field])
    );
  };

  const handleEnvolturaChange = (option: string) => {
    const wrappingId = getIdFromEnvolturaOption(option);

    setForm((prev) =>
      prev
        ? {
            ...prev,
            envolturaId: wrappingId,
            envasadoId: "",
          }
        : null
    );

    markFieldAsTouched("envolturaId");
    markFieldAsTouched("envasadoId");
  };

  const handleLicitacionChange = (value: string) => {
    const licitacion = value as "Sí" | "No";
    setForm((prev) =>
      prev
        ? {
            ...prev,
            licitacion,
            codigoRFQ: licitacion === "No" ? "" : prev.codigoRFQ,
          }
        : null
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!form || !portfolioCodeStr) return;

    if (Object.keys(validationErrors).length > 0) {
      const fieldsWithErrors = Object.keys(validationErrors).reduce(
        (acc, field) => {
          acc[field as keyof PortfolioFormData] = true;
          return acc;
        },
        {} as Partial<Record<keyof PortfolioFormData, boolean>>
      );

      setTouchedFields((prev) => ({
        ...prev,
        ...fieldsWithErrors,
      }));

      return;
    }

    if (
      !selectedStatus ||
      !selectedClient ||
      !selectedExecutive ||
      !selectedPlant ||
      !selectedWrapping ||
      !selectedFinalUse ||
      !selectedPackingMachine
    ) {
      return;
    }

    const now = new Date().toISOString();
    const currentUser = getCurrentUser() as any;
    const currentUserName =
      currentUser?.name ||
      currentUser?.displayName ||
      currentUser?.email ||
      "Usuario Comercial";
    const currentUserId = String(
      currentUser?.id || currentUser?.email || currentUserName || "frontend-user"
    );

    updatePortfolioRecord(portfolioCodeStr, {
      estadoId: selectedStatus.id,
      est: selectedStatus.name,
      clienteId: selectedClient.id,
      clienteCode: selectedClient.code,
      cli: selectedClient.businessName,
      ejecutivoId: String(selectedExecutive.id),
      ejecutivoCode: selectedExecutive.code,
      ej: selectedExecutive.name,
      plantaId: selectedPlant.id,
      plantaCode: selectedPlant.code,
      pl: selectedPlant.name,
      nom: form.nombrePortafolio,
      desc: form.descripcionPortafolio,
      envolturaId: selectedWrapping.id,
      envolturaCode: selectedWrapping.code,
      env: selectedWrapping.name,
      usoFinalId: selectedFinalUse.id,
      usoFinalCode: selectedFinalUse.code,
      uf: selectedFinalUse.useFinal,
      subseg: selectedFinalUse.subSegment,
      seg: selectedFinalUse.segment,
      sector: selectedFinalUse.sector,
      af: selectedFinalUse.afMarketId,
      envasadoId: selectedPackingMachine.id,
      envasadoCode: selectedPackingMachine.code,
      maq: selectedPackingMachine.name,
      lic: form.licitacion,
      codigoRFQ: form.codigoRFQ,
      TbPoLici: form.licitacion === "Sí" ? 1 : 0,
      TbPoColic: form.codigoRFQ,
      TbPoNPro: form.nombrePortafolio,
      TbPoDPro: form.descripcionPortafolio,
      updatedAt: now,
      TbPoFUlt: now,
      updatedBy: currentUserId,
      updatedByName: currentUserName,
      updatedByEmail: currentUser?.email || "",
      lastUpdatedBy: currentUserName,
      realizadoPor: currentUserName,
      TbPoUUlt: currentUserId,
      TbPoUUltNom: currentUserName,
    });

    navigate("/portfolio");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando portafolio...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-600 font-semibold">{error || "Error cargando portafolio"}</div>
        <button
          onClick={() => navigate("/portfolio")}
          className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium"
        >
          Volver a Portafolios
        </button>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-xl border border-slate-200">
        <div className="text-amber-600 font-semibold flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Acceso denegado
        </div>
        <p className="text-slate-500 text-sm">Debes iniciar sesión para editar portafolios.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium mt-2"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <button
        type="button"
        onClick={() => navigate("/portfolio")}
        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[65%_1fr]">
          {/* ═══════════ COLUMNA IZQUIERDA (65%) ═══════════ */}
          <div className="space-y-4">
            {/* SECCIÓN 1: Cliente y responsable */}
            <SectionCard
              number={1}
              title="Cliente y responsable"
              subtitle="Define quién solicita y quién gestiona el portafolio."
              status={getSectionStatus(form.licitacion === "Sí" ? ["clienteId", "ejecutivoId", "licitacion", "codigoRFQ"] : ["clienteId", "ejecutivoId", "licitacion"])}
              required
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ClientSearch
                  label="Nombre del Cliente *"
                  value={form.clienteId}
                  clients={eligibleClients}
                  onChange={(value) => updateField("clienteId", value)}
                  onBlur={() => markFieldAsTouched("clienteId")}
                  error={
                    shouldShowFieldError("clienteId")
                      ? validationErrors.clienteId
                      : ""
                  }
                  placeholder="Escribe para buscar cliente..."
                />

                <ExecutiveSearch
                  label="Ejecutivo Comercial *"
                  value={form.ejecutivoId}
                  executives={comercialUsers}
                  onChange={(value) => updateField("ejecutivoId", value)}
                  onBlur={() => markFieldAsTouched("ejecutivoId")}
                  error={
                    shouldShowFieldError("ejecutivoId")
                      ? validationErrors.ejecutivoId
                      : ""
                  }
                  placeholder="Escribe para buscar ejecutivo..."
                />
              </div>
            </SectionCard>

            {/* SECCIÓN 2: Información del portafolio */}
            <SectionCard
              number={2}
              title="Información del portafolio"
              subtitle="Identifica la familia de productos."
              status={getSectionStatus(["nombrePortafolio"])}
              required
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormInput
                  label="Nombre de Portafolio *"
                  value={form.nombrePortafolio}
                  onChange={(value) => updateField("nombrePortafolio", value)}
                  onBlur={() => markFieldAsTouched("nombrePortafolio")}
                  error={
                    shouldShowFieldError("nombrePortafolio")
                      ? validationErrors.nombrePortafolio
                      : ""
                  }
                  placeholder="Ej. Fundas great value"
                />

                <FormTextarea
                  label="Descripción del Portafolio"
                  value={form.descripcionPortafolio}
                  onChange={(value) =>
                    updateField("descripcionPortafolio", value)
                  }
                  placeholder="Descripción breve de la familia de productos"
                  rows={2}
                />
              </div>
            </SectionCard>

            {/* SECCIÓN 3: Producto y uso final */}
            <SectionCard
              number={3}
              title="Producto y uso final"
              subtitle="Selecciona la envoltura y la taxonomía comercial."
              status={getSectionStatus(["envolturaId", "usoFinalId"])}
              required
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1.5">
                    Envoltura <span className="text-red-600">*</span>
                  </label>
                  <EnvolturaSelector
                    value={getEnvolturaOption(form.envolturaId)}
                    onChange={handleEnvolturaChange}
                    error={
                      shouldShowFieldError("envolturaId")
                        ? validationErrors.envolturaId
                        : ""
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(280px,0.8fr)] lg:items-end">
                  <FormSelect
                    label="Uso Final *"
                    value={form.usoFinalId}
                    onChange={(value) => updateField("usoFinalId", value)}
                    onBlur={() => markFieldAsTouched("usoFinalId")}
                    error={
                      shouldShowFieldError("usoFinalId")
                        ? validationErrors.usoFinalId
                        : ""
                    }
                    options={getFinalUses().map((item) => ({
                      value: String(item.id),
                      label: item.useFinal,
                    }))}
                    placeholder="-- Seleccione --"
                  />

                  <button
                    type="button"
                    onClick={() => setShowFinalUseCatalog(true)}
                    className="h-[38px] rounded-lg border border-[#00395A] px-4 text-sm font-semibold text-[#00395A] hover:bg-[#00395A] hover:text-white transition-colors"
                  >
                    Ver tabla
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTaxonomyDetail((prev) => !prev)}
                    className="flex h-[38px] w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="truncate">
                      {selectedFinalUse 
                        ? `${selectedFinalUse.sector} / ${selectedFinalUse.segment} / ${selectedFinalUse.subSegment}`
                        : "No definido"}
                    </span>
                    <span className="ml-2 flex-none text-xs text-slate-400">
                      {showTaxonomyDetail ? "▲" : "▼"}
                    </span>
                  </button>
                </div>

                {/* Detalle de taxonomía desplegable */}
                {showTaxonomyDetail && (
                  <div className="mt-3 border border-slate-100 p-3 bg-slate-50/50 rounded-lg grid grid-cols-2 gap-2 md:grid-cols-4">
                    <FormInput
                      label="Sector"
                      value={selectedFinalUse?.sector || ""}
                      disabled
                    />
                    <FormInput
                      label="Segmento"
                      value={selectedFinalUse?.segment || ""}
                      disabled
                    />
                    <FormInput
                      label="Sub-segmento"
                      value={selectedFinalUse?.subSegment || ""}
                      disabled
                    />
                    <FormInput
                      label="AFMarketID"
                      value={selectedFinalUse?.afMarketId || ""}
                      disabled
                    />
                  </div>
                )}
              </div>
            </SectionCard>

            {/* SECCIÓN 4: Configuración técnica */}
            <SectionCard
              number={4}
              title="Configuración técnica"
              subtitle="Asocia la máquina según la envoltura seleccionada."
              status={getSectionStatus(["envasadoId"])}
              required
            >
              <FormSelect
                label="Envasado / Máquina de Cliente *"
                value={form.envasadoId}
                onChange={(value) => updateField("envasadoId", value)}
                onBlur={() => markFieldAsTouched("envasadoId")}
                error={
                  shouldShowFieldError("envasadoId")
                    ? validationErrors.envasadoId
                    : ""
                }
                options={packingMachines.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
                placeholder={
                  form.envolturaId
                    ? "-- Seleccione --"
                    : "Primero seleccione una envoltura"
                }
                disabled={!form.envolturaId}
              />

              {form.envasadoId === "generic" && (
                <div className="col-span-full mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    <strong>ℹ️ Aviso:</strong> "Máquina genérica" es un valor temporal. Debe reemplazarlo con una máquina específica antes de enviar el proyecto para validación.
                  </p>
                </div>
              )}
            </SectionCard>
          </div>

          {/* ═══════════ COLUMNA DERECHA (35%) ═══════════ */}
          <div className="space-y-4 h-fit lg:sticky lg:top-20">
            {/* Vista rápida */}
            <PortfolioPreview
              codigo={form.codigo}
              completionPercentage={completionPercentage}
              items={[
                { label: "Cliente", value: selectedClient?.businessName || "—" },
                { label: "Ejecutivo", value: selectedExecutive?.name || "—" },
                { label: "Planta", value: selectedPlant?.name || "—" },
                { label: "Portafolio", value: form.nombrePortafolio || "—" },
                { label: "Envoltura", value: selectedWrapping?.name || "—" },
                { label: "Uso final", value: selectedFinalUse?.useFinal || "—" },
                { label: "Máquina", value: selectedPackingMachine?.name || "—" },
              ]}
            />

            {/* SECCIÓN 5: Planta de Origen */}
            <SectionCard
              number={5}
              title="Planta de Origen de solicitud"
              subtitle="Selecciona la planta asociada al diseño."
              status={getSectionStatus(["plantaId"])}
              required
            >
              <PlantSelector
                value={getPlantOption(form.plantaId)}
                onChange={(value) => {
                  const id = getIdFromPlantOption(value);
                  updateField("plantaId", id);
                  markFieldAsTouched("plantaId");
                }}
                error={
                  shouldShowFieldError("plantaId")
                    ? validationErrors.plantaId
                    : ""
                }
              />
            </SectionCard>
          </div>
        </div>

        <div className="sticky bottom-0 z-40 mt-4 border-t border-slate-200 bg-[#f6f8fb]/95 py-3 backdrop-blur">
          <FormActionButtons
            onCancel={() => navigate("/portfolio")}
            validationErrorList={validationErrorList}
            submitAttempted={submitAttempted}
            submitLabel="Guardar Cambios"
            cancelLabel="Cancelar"
            validationTitle="Faltan campos obligatorios para actualizar el portafolio."
          />
        </div>
      </form>

      {showFinalUseCatalog && (
        <FinalUseCatalogModal
          selectedId={form.usoFinalId}
          onClose={() => setShowFinalUseCatalog(false)}
          onSelect={(id) => {
            updateField("usoFinalId", id);
            setShowFinalUseCatalog(false);
          }}
        />
      )}
    </div>
  );
}

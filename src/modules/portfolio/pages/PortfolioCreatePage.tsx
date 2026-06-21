import { useEffect, useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";

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

import { getClientCatalogRecords, getClientByCode, canClientHavePortfolio } from "../../../shared/data/clientStorage";
import { getActiveExecutiveRecords } from "../../../shared/data/executiveStorage";
import { savePortfolioRecord } from "../../../shared/data/portfolioStorage";

const RECENT_NEW_PORTFOLIO_KEY = "odiseo_recent_new_portfolio";

import ClientSearch from "../../../shared/components/catalog/ClientSearch";
import ExecutiveSearch from "../../../shared/components/catalog/ExecutiveSearch";
import FinalUseSelector from "../../../shared/components/catalog/FinalUseSelector";
import FinalUseCatalogModal from "../../../shared/components/catalog/FinalUseCatalogModal";
import PortfolioPreview from "../../../shared/components/ui/PortfolioPreview.tsx";
import SectionCard from "../../../shared/components/ui/SectionCard";

// Import seeds to ensure they're available
import seedClients from "../../../shared/data/seeds/clients.json";
import seedUsers from "../../../shared/data/seeds/users.json";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCard,
  FormActionButtons,
} from "../../../shared/components/forms/index.tsx";
import EnvolturaSelector from "../../../shared/components/forms/EnvolturaSelector";
import PlantSelector from "../../../shared/components/forms/PlantSelector";

type PortfolioFormData = {
  codigo: string;
  estadoId: string;
  clienteId: string;
  ejecutivoId: string;
  plantaId: string;
  nombrePortafolio: string;
  descripcionPortafolio: string;
  envolturaId: string;
  usoFinalId: string;
  envasadoId: string;
};

type EnvolturaOption = "POUCH" | "BOLSA" | "LAMINA";

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

function getTemporaryPortfolioCode() {
  const saved = JSON.parse(
    localStorage.getItem("odiseo_created_portfolios") || "[]"
  );

  const savedNumbers = Array.isArray(saved)
    ? saved
      .map((item) => Number(String(item.id || "").replace("PO-", "")))
      .filter((number) => !Number.isNaN(number))
    : [];

  const maxNumber = Math.max(10, ...savedNumbers);

  return `PO-${String(maxNumber + 1).padStart(6, "0")}`;
}


type LoggedUserInfo = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getTextValue(...values: any[]): string {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== ""
  );

  return value ? String(value).trim() : "";
}

function normalizeUserName(value: string): string {
  const text = getTextValue(value);

  if (!text) return "";

  const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

  if (!emailLike) return text;

  const [localPart] = text.split("@");

  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function extractLoggedUserFromObject(source: any): LoggedUserInfo | null {
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;

  const user =
    source.user ??
    source.currentUser ??
    source.authUser ??
    source.loggedUser ??
    source.usuario ??
    source.profile ??
    source.account ??
    source.session?.user ??
    source.session?.currentUser ??
    source;

  if (!user || typeof user !== "object" || Array.isArray(user)) return null;

  const rawName = getTextValue(
    user.fullName,
    user.name,
    user.displayName,
    user.nombreCompleto,
    user.nombre,
    user.username,
    user.userName,
    user.email
  );

  const name = normalizeUserName(rawName);
  const email = getTextValue(user.email, user.mail, user.correo);
  const id = getTextValue(user.id, user.userId, user.uid, user.code, user.codigo, email, name);
  const role = getTextValue(user.role, user.profile, user.perfil, user.area, user.position, user.puesto);

  if (!name && !email && !id) return null;

  return {
    id: id || "frontend-user",
    name: name || email || id || "Usuario Comercial",
    email,
    role,
  };
}

function getCurrentLoggedUser(): LoggedUserInfo {
  const preferredStorageKeys = [
    "odiseo_current_user",
    "odiseo_auth_user",
    "odiseo_logged_user",
    "odiseo_user_session",
    "odiseo_session",
    "auth_session",
    "currentUser",
    "authUser",
    "loggedUser",
    "user",
    "session",
  ];

  for (const key of preferredStorageKeys) {
    const parsed = safeJsonParse<any>(localStorage.getItem(key));
    const currentUser = extractLoggedUserFromObject(parsed);

    if (currentUser?.name) return currentUser;
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;

    const normalizedKey = key.toLowerCase();

    if (
      normalizedKey.includes("portfolio") ||
      normalizedKey.includes("catalog") ||
      normalizedKey.includes("client") ||
      normalizedKey.includes("odiseo_users")
    ) {
      continue;
    }

    const parsed = safeJsonParse<any>(localStorage.getItem(key));
    const currentUser = extractLoggedUserFromObject(parsed);

    if (currentUser?.name) return currentUser;
  }

  return {
    id: "frontend-user",
    name: "Usuario Comercial",
    email: "",
    role: "Comercial",
  };
}

const buildInitialForm = (): PortfolioFormData => ({
  codigo: getTemporaryPortfolioCode(),
  estadoId: String(getStatusCatalog()[0]?.id || 1),
  clienteId: "",
  ejecutivoId: "",
  plantaId: "",
  nombrePortafolio: "",
  descripcionPortafolio: "",
  envolturaId: "",
  usoFinalId: "",
  envasadoId: "",
});

const REQUIRED_FIELDS: Array<keyof PortfolioFormData> = [
  "clienteId",
  "ejecutivoId",
  "nombrePortafolio",
  "envolturaId",
  "usoFinalId",
  "envasadoId",
  "plantaId",
];

export default function PortfolioCreatePage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const [searchParams] = useSearchParams();
  const inheritedClientCode = searchParams.get("clientCode");

  const [form, setForm] = useState<PortfolioFormData>(buildInitialForm);
  const [clientInheritanceError, setClientInheritanceError] = useState<string | null>(null);
  const isClientInherited = Boolean(inheritedClientCode && form.clienteId && !clientInheritanceError);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showFinalUseCatalog, setShowFinalUseCatalog] = useState(false);
  const [showTaxonomyDetail, setShowTaxonomyDetail] = useState(false);
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof PortfolioFormData, boolean>>
  >({});
  const [dataReloaded, setDataReloaded] = useState(false);

  const selectedStatus = getStatusById(form.estadoId);

  const allClients = useMemo(() => getClientCatalogRecords(), [dataReloaded]);
  const eligibleClients = useMemo(() => allClients.filter((c) => canClientHavePortfolio(c.status)), [allClients]);
  const selectedClient = useMemo(() => allClients.find((c) => c.id === form.clienteId), [allClients, form.clienteId]);

  const comercialUsers = useMemo(() => getActiveExecutiveRecords(), [dataReloaded]);
  const selectedExecutive = useMemo(() => comercialUsers.find((u) => String(u.id) === form.ejecutivoId), [comercialUsers, form.ejecutivoId]);

  // ── Initialize seed data if needed ──
  useEffect(() => {
    const clientsLS = localStorage.getItem("odiseo_clients");
    const usersLS = localStorage.getItem("odiseo_users");

    // Initialize clients if empty
    if (!clientsLS || JSON.parse(clientsLS || "[]").length === 0) {
      if (Array.isArray(seedClients) && seedClients.length > 0) {
        localStorage.setItem("odiseo_clients", JSON.stringify(seedClients));
      }
    }

    // Initialize users if empty
    if (!usersLS || JSON.parse(usersLS || "[]").length === 0) {
      if (Array.isArray(seedUsers) && seedUsers.length > 0) {
        localStorage.setItem("odiseo_users", JSON.stringify(seedUsers));
      }
    }

    // Always trigger re-render to ensure data is loaded
    setDataReloaded(true);
  }, []);

  // ── Client Inheritance from ClientDetailPage ──
  useEffect(() => {
    if (!inheritedClientCode) return;

    const inheritedClient = getClientByCode(inheritedClientCode);

    if (!inheritedClient) {
      setClientInheritanceError(
        `No se encontró el cliente con código ${inheritedClientCode}.`
      );
      return;
    }

    if (!canClientHavePortfolio(inheritedClient.status)) {
      setClientInheritanceError(
        "No se puede crear un portafolio para este cliente porque su estado actual no permite asignación de portafolios."
      );
      return;
    }

    setForm((prev) => ({
      ...prev,
      clienteId: inheritedClient.id,
    }));
  }, [inheritedClientCode]);

  const selectedPlant = getPlantById(form.plantaId);
  const selectedWrapping = getWrappingById(form.envolturaId);
  const selectedFinalUse = getFinalUseById(form.usoFinalId);

  const selectedPackingMachine = useMemo(() => {
    if (!form.envasadoId) return null;

    if (form.envasadoId === "generic") {
      return {
        id: "generic",
        code: "GENERIC",
        name: "Máquina genérica",
        wrappingId: form.envolturaId,
      };
    }

    return getPackingMachineById(form.envasadoId);
  }, [form.envasadoId, form.envolturaId]);

  const packingMachines = useMemo(() => {
    if (!form.envolturaId) return [];

    const machines = getPackingMachinesByWrappingId(form.envolturaId);

    return [
      {
        id: "generic",
        code: "GENERIC",
        name: "Máquina genérica",
        wrappingId: form.envolturaId,
      },
      ...machines,
    ];
  }, [form.envolturaId]);

  const requiredChecks = useMemo(() => {
    const checks: Array<{ field: string; label: string; completed: boolean }> = [
      { field: "clienteId", label: "Cliente", completed: Boolean(form.clienteId) },
      { field: "ejecutivoId", label: "Ejecutivo comercial", completed: Boolean(form.ejecutivoId) },
      { field: "plantaId", label: "Planta de origen de solicitud", completed: Boolean(form.plantaId) },
      { field: "nombrePortafolio", label: "Nombre de portafolio", completed: Boolean(form.nombrePortafolio.trim()) },
      { field: "envolturaId", label: "Envoltura", completed: Boolean(form.envolturaId) },
      { field: "usoFinalId", label: "Uso final", completed: Boolean(form.usoFinalId) },
      { field: "envasadoId", label: "Envasado / Máquina de cliente", completed: Boolean(form.envasadoId) },
    ];


    return checks;
  }, [form]);

  const completionPercentage = useMemo(() => {
    const completed = requiredChecks.filter((item) => item.completed).length;
    return Math.round((completed / requiredChecks.length) * 100);
  }, [requiredChecks]);

  const getSectionStatus = (
    sectionFields: Array<keyof PortfolioFormData>
  ): "pending" | "completed" | "error" => {
    const hasVisibleError = sectionFields.some((field) =>
      shouldShowFieldError(field)
    );

    if (hasVisibleError) return "error";

    const allCompleted = sectionFields.every((field) => {
      if (field === "clienteId") return Boolean(form.clienteId);
      if (field === "ejecutivoId") return Boolean(form.ejecutivoId);
      if (field === "plantaId") return Boolean(form.plantaId);
      if (field === "nombrePortafolio") return Boolean(form.nombrePortafolio.trim());
      if (field === "descripcionPortafolio") return true;
      if (field === "envolturaId") return Boolean(form.envolturaId);
      if (field === "usoFinalId") return Boolean(form.usoFinalId);
      if (field === "envasadoId") return Boolean(form.envasadoId);
      return true;
    });

    return allCompleted ? "completed" : "pending";
  };

  // Update header dynamically
useEffect(() => {
  setHeader({
    title: "Crear Portafolio",
    breadcrumbs: [
      { label: "Portafolio", href: "/portfolio" },
      { label: "Crear Portafolio" },
    ],
    badges: (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
        ID: {form.codigo}
      </span>
    ),
  });

  return () => resetHeader();
}, [setHeader, resetHeader, form.codigo]);

  const validationErrors = useMemo(() => {
    const errors: Partial<Record<keyof PortfolioFormData, string>> = {};

    if (!form.clienteId) errors.clienteId = "Selecciona el nombre del cliente.";
    if (!form.ejecutivoId) errors.ejecutivoId = "Selecciona el ejecutivo comercial.";
    if (!form.plantaId) errors.plantaId = "Selecciona la planta de origen.";

    if (!form.nombrePortafolio.trim()) {
      errors.nombrePortafolio = "Ingresa el nombre del portafolio.";
    }

    if (!form.envolturaId) errors.envolturaId = "Selecciona la envoltura.";
    if (!form.usoFinalId) errors.usoFinalId = "Selecciona el uso final.";
    if (!form.envasadoId) errors.envasadoId = "Ingresa la máquina del cliente.";

    return errors;
  }, [form]);

  const validationErrorList = REQUIRED_FIELDS
    .map((field) => validationErrors[field])
    .filter((error): error is string => Boolean(error));

  const updateField = (field: keyof PortfolioFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const markFieldAsTouched = (field: keyof PortfolioFormData) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const updateRequiredField = (field: keyof PortfolioFormData, value: string) => {
    updateField(field, value);
    markFieldAsTouched(field);
  };

  const shouldShowFieldError = (field: keyof PortfolioFormData) => {
    return Boolean(
      validationErrors[field] && (submitAttempted || touchedFields[field])
    );
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

  const getEnvolturaOption = (id: string): EnvolturaOption | "" => {
    if (!id) return "";

    const wrapping = getWrappingById(id);

    const text = normalizeText(
      [
        id,
        wrapping?.id,
        wrapping?.code,
        wrapping?.name,
        wrapping?.raw?.id,
        wrapping?.raw?.item,
        wrapping?.raw?.code,
        wrapping?.raw?.name,
      ].join(" ")
    );

    return normalizeEnvolturaOption(text);
  };

  const getIdFromEnvolturaOption = (option: string): string => {
    const normalizedOption = normalizeEnvolturaOption(option);

    if (!normalizedOption) return "";

    const wrappings = getWrappingsCatalog();

    const wrapping = wrappings.find((w) => {
      const text = normalizeText(
        [
          w.id,
          w.code,
          w.name,
          w.raw?.id,
          w.raw?.item,
          w.raw?.code,
          w.raw?.name,
        ].join(" ")
      );

      return normalizeEnvolturaOption(text) === normalizedOption;
    });

    // Fallback: mantener un código funcional estable si el catálogo no tiene match.
    // Esto evita que "LÁMINA" quede vacío por diferencia de tilde.
    return wrapping ? String(wrapping.id) : normalizedOption;
  };

  const getPlantOption = (id: string): "AF_LIMA" | "AF_CALI" | "AF_SANTIAGO" | "AF_SAN_LUIS" | "" => {
    if (!id) return "";

    const plant = getPlantById(id);
    if (!plant) return "";

    const text = normalizeText(`${plant.code ?? ""} ${plant.name ?? ""}`);

    if (text.includes("lim")) return "AF_LIMA";
    if (text.includes("cal")) return "AF_CALI";
    if (text.includes("stn") || text.includes("santiago")) return "AF_SANTIAGO";
    if (text.includes("sl") || text.includes("san luis")) return "AF_SAN_LUIS";

    return "";
  };

  const getIdFromPlantOption = (option: "AF_LIMA" | "AF_CALI" | "AF_SANTIAGO" | "AF_SAN_LUIS"): string => {
    const plants = getPlantsCatalog();

    const plant = plants.find((p) => {
      const text = normalizeText(`${p.code ?? ""} ${p.name ?? ""}`);

      if (option === "AF_LIMA") return text.includes("lim");
      if (option === "AF_CALI") return text.includes("cal");
      if (option === "AF_SANTIAGO") return text.includes("stn") || text.includes("santiago");
      if (option === "AF_SAN_LUIS") return text.includes("sl") || text.includes("san luis");

      return false;
    });

    return plant ? String(plant.id) : "";
  };

  const handleEnvolturaChange = (optionOrId: string) => {
    const normalizedOption = normalizeEnvolturaOption(optionOrId);
    const wrappingId = normalizedOption
      ? getIdFromEnvolturaOption(normalizedOption)
      : optionOrId;

    if (!wrappingId) return;

    setForm((prev) => ({
      ...prev,
      envolturaId: wrappingId,
      envasadoId: "",
    }));

    setTouchedFields((prev) => ({
      ...prev,
      envolturaId: true,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const allRequiredTouched = REQUIRED_FIELDS.reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {} as Partial<Record<keyof PortfolioFormData, boolean>>
    );

    setTouchedFields((prev) => ({
      ...prev,
      ...allRequiredTouched,
    }));

    if (Object.keys(validationErrors).length > 0) {
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
    const currentUser = getCurrentLoggedUser();

    const tabportRecord = {
      TbPoCodi: form.codigo,
      TbPoEsta: selectedStatus.id,
      TbPoNPro: form.nombrePortafolio,
      TbPoDPro: form.descripcionPortafolio,
      TbPoIdpr: crypto.randomUUID(),
      TbPoFReg: now,
      TbPoActi: true,
      TbPoUCre: currentUser.id,
      TbPoFCre: now,
      TbPoUUlt: currentUser.id,
      TbPoFUlt: now,
      TbPoUCreNom: currentUser.name,
      TbPoUUltNom: currentUser.name,

      CLMaCCLi: selectedClient.id,
      TbVeCVen: selectedExecutive.id,
      TbPoLlavOr: selectedPlant.id,
      EdMaNEDAG: selectedWrapping.id,
      FaMKNId: selectedFinalUse.id,
      TbCLCUni: selectedPackingMachine.id,
    };

    const portfolioDisplayRecord = {
      id: form.codigo,

      statusId: selectedStatus.id,
      est: selectedStatus.name,

      clienteId: selectedClient.id,
      clienteCode: selectedClient.code,
      cli: selectedClient.businessName,
      // Campos para asociación Cliente → Portafolio
      clientId: selectedClient.id,
      clientCode: selectedClient.code,
      clientName: selectedClient.businessName,
      clientRuc: selectedClient.ruc || "",

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

      createdAt: now,
      updatedAt: now,
      fch: new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(now)),
      proy: [],

      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdByEmail: currentUser.email,
      updatedBy: currentUser.id,
      updatedByName: currentUser.name,
      updatedByEmail: currentUser.email,
      lastUpdatedBy: currentUser.name,
      realizadoPor: currentUser.name,
    };

    savePortfolioRecord({
      displayRecord: portfolioDisplayRecord,
      tabportRecord,
    });

    // Store recent new portfolio indicator for 10 seconds
    localStorage.setItem(RECENT_NEW_PORTFOLIO_KEY, JSON.stringify({
      portfolioId: form.codigo,
      expiresAt: Date.now() + 25000,
    }));

    if (inheritedClientCode) {
      navigate(`/clients/${inheritedClientCode}`);
    } else {
      navigate("/portfolio");
    }
  };

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <button
        type="button"
        onClick={() => navigate("/portfolio")}
        className="mb-2 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
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
              status={getSectionStatus(["clienteId", "ejecutivoId"])}
              required
              infoTitle="Identificar portafolio"
              infoContent="Selecciona el cliente para el que se crea este portafolio y el ejecutivo comercial responsable."
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {clientInheritanceError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-semibold text-red-800 mb-1">Error de herencia de cliente</p>
                    <p className="text-sm text-red-700">{clientInheritanceError}</p>
                  </div>
                ) : isClientInherited ? (
                  <div>
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Nombre del Cliente *
                    </span>
                    <div className="w-full rounded-lg border border-green-200 bg-green-50 py-2 px-3 text-sm font-semibold text-green-800">
                      {selectedClient?.businessName || "—"}
                    </div>
                    <span className="mt-1 block text-xs text-slate-500">
                      Cliente heredado desde Detalle de Cliente.
                    </span>
                  </div>
                ) : (
                  <ClientSearch
                    label="Nombre del Cliente *"
                    value={form.clienteId}
                    clients={eligibleClients}
                    onChange={(value) => updateRequiredField("clienteId", value)}
                    onBlur={() => markFieldAsTouched("clienteId")}
                    error={
                      shouldShowFieldError("clienteId")
                        ? validationErrors.clienteId
                        : ""
                    }
                    placeholder="Escribe para buscar cliente..."
                  />
                )}

                <ExecutiveSearch
                  label="Ejecutivo Comercial *"
                  value={form.ejecutivoId}
                  executives={comercialUsers}
                  onChange={(value) => updateRequiredField("ejecutivoId", value)}
                  onBlur={() => markFieldAsTouched("ejecutivoId")}
                  error={
                    shouldShowFieldError("ejecutivoId")
                      ? validationErrors.ejecutivoId
                      : ""
                  }
                  placeholder="Escribe para buscar ejecutivo..."
                />

                <FormSelect
                  label="Estado del Portafolio"
                  value={form.estadoId}
                  onChange={(value) => updateField("estadoId", value)}
                  options={getStatusCatalog().map((status) => ({
                    value: String(status.id),
                    label: status.name,
                  }))}
                  placeholder="-- Seleccione --"
                />
              </div>
            </SectionCard>

            {/* SECCIÓN 2: Información del portafolio */}
            <SectionCard
              number={2}
              title="Información del portafolio"
              status={getSectionStatus(["nombrePortafolio"])}
              required
              infoTitle="Datos del portafolio"
              infoContent="Define el nombre y descripción de este portafolio. El nombre debe ser descriptivo de la familia de productos que contiene."
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormInput
                  label="Nombre de Portafolio *"
                  value={form.nombrePortafolio}
                  onChange={(value) => updateRequiredField("nombrePortafolio", value)}
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
              status={getSectionStatus(["envolturaId", "usoFinalId"])}
              required
              infoTitle="Especificaciones del producto"
              infoContent="Selecciona el tipo de envoltura del producto y su uso final en el mercado. La taxonomía de uso final define el sector, segmento y subsegmento."
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
                    onChange={(value) => updateRequiredField("usoFinalId", value)}
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
              status={getSectionStatus(["envasadoId"])}
              required
              infoTitle="Máquina de empaque"
              infoContent="Especifica la máquina de empaque que se utilizará en el cliente. Selecciona primero una envoltura para ver las máquinas disponibles."
            >
              <FormSelect
                label="Envasado / Máquina de Cliente *"
                value={form.envasadoId}
                onChange={(value) => updateRequiredField("envasadoId", value)}
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
                { label: "Estado", value: selectedStatus?.name || "—" },
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
              status={getSectionStatus(["plantaId"])}
              required
              infoTitle="Ubicación de origen"
              infoContent="Indica la planta Amcor que origina la solicitud de este portafolio. Esto ayuda a rastrear y gestionar los portafolios por ubicación."
            >
              <PlantSelector
                value={getPlantOption(form.plantaId)}
                onChange={(value) => {
                  const id = getIdFromPlantOption(value);
                  updateRequiredField("plantaId", id);
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
            submitLabel="Guardar Portafolio"
            cancelLabel="Cancelar"
          />
        </div>
      </form>

      {showFinalUseCatalog && (
        <FinalUseCatalogModal
          selectedId={form.usoFinalId}
          onClose={() => setShowFinalUseCatalog(false)}
          onSelect={(id) => {
            updateRequiredField("usoFinalId", id);
            setShowFinalUseCatalog(false);
          }}
        />
      )}
    </div>
  );
}
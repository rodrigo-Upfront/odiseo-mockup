import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

import { useLayout } from "../../../components/layout/LayoutContext";
import {
  createUser,
  findDuplicateUser,
  getNextUserCode,
  getUserByEmail,
  getAllUsers,
} from "../../../shared/data/userStorage";
import { mockSendEmail } from "../../../shared/data/notificationStorage";
import {
  ROLE_PROFILES,
  suggestRoleByArea,
  ACCESS_PROFILES,
  getAccessProfileOptions,
  getProfileInternalRoles,
  type ProfileCode,
} from "../../../shared/security/roleProfiles";
import InfoTooltip from "../../../shared/components/ui/InfoTooltip";
import SectionCard from "../../../shared/components/ui/SectionCard";

import FormInput from "../../../shared/components/forms/FormInput";
import FormSelect from "../../../shared/components/forms/FormSelect";
import FormActionButtons from "../../../shared/components/forms/FormActionButtons";
import ExcelTemplateActions from "../../../shared/components/forms/ExcelTemplateActions";
import SiUserSelector from "../../../shared/components/forms/SiUserSelector";
import { validateSiUser, getSiUserMirrorByCode } from "../../../shared/data/siUserMirrorStorage";

const RECENT_NEW_USER_KEY = "odiseo_recent_new_user";

interface FormState {
  // ODISEO Fields
  email: string;
  fullName: string;
  position: string;
  area: string;
  profileCode: ProfileCode;
  odiseoUserStatus: string;

  // SI Reference Fields (read-only, auto-populated)
  integralSystemUserId: string;
  integralSystemUserValue: string;
  integralSystemUserName?: string;
  integralSystemUserStatus?: string;

  // Internal fields (not editable in form)
  phone?: string;
  areaCode?: string;
  areaLabel?: string;
  profileLabel?: string;
}

type ExplicitFlowState = "initial" | "existingEmailFound" | "newEmailConfirmed";

interface ImportedUserData extends Partial<FormState> {}

const USER_AREA_OPTIONS = [
  { value: "TI", label: "TI" },
  { value: "Comercial", label: "Comercial" },
  { value: "Master Data", label: "Master Data" },
  { value: "Customer Service", label: "Customer Service" },
  { value: "R&D", label: "R&D" },
];

const EMPTY_VALUE = "—";

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const [userCode] = useState(getNextUserCode());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    // ODISEO Fields
    email: "",
    fullName: "",
    position: "",
    area: "",
    profileCode: "" as ProfileCode,
    odiseoUserStatus: "PENDIENTE_ACTIVACION",
    // SI Reference Fields
    integralSystemUserId: "",
    integralSystemUserValue: "",
    // Internal fields
    phone: "",
  });

  const [explicitFlowState, setExplicitFlowState] =
    useState<ExplicitFlowState>("initial");

  const [emailValidationMessage, setEmailValidationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingUserPreview, setExistingUserPreview] = useState<any | null>(
    null
  );

  const profileOptions = useMemo(
    () => getAccessProfileOptions(),
    []
  );

  const selectedProfile = useMemo(
    () => ACCESS_PROFILES.find((profile) => profile.code === form.profileCode),
    [form.profileCode]
  );

  useEffect(() => {
    setHeader({
      title: "Registrar Usuario ODISEO",
      breadcrumbs: [
        { label: "Inicio", href: "/" },
        { label: "Usuarios", href: "/users" },
        { label: "Registrar Usuario" },
      ],
      badges: (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            ID: {userCode}
          </span>
        </div>
      ),
    });

    return () => resetHeader();
  }, [setHeader, resetHeader, userCode]);

  useEffect(() => {
    const normalizedEmail = form.email.toLowerCase().trim();

    if (!normalizedEmail) {
      setEmailValidationMessage(null);
      setExplicitFlowState("initial");
      setIsValidatingEmail(false);
      return;
    }

    setIsValidatingEmail(true);

    const timeoutId = window.setTimeout(() => {
      validateCorporateEmail(normalizedEmail);
      setIsValidatingEmail(false);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [form.email]);

  const validateCorporateEmail = (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail) {
      setEmailValidationMessage(null);
      setExplicitFlowState("initial");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailValidationMessage({
        type: "error",
        text: "El formato del correo no es válido.",
      });
      setExplicitFlowState("initial");
      return;
    }

    const existingUser = getUserByEmail(normalizedEmail);

    if (existingUser) {
      setExistingUserPreview(existingUser);

      setEmailValidationMessage({
        type: "error",
        text: "El correo corporativo ya se encuentra registrado en ODISEO. No es posible continuar con el registro.",
      });

      setExplicitFlowState("existingEmailFound");
      return;
    }

    setExistingUserPreview(null);

    setEmailValidationMessage({
      type: "success",
      text: "Correo no encontrado en ODISEO. Puedes continuar con el registro.",
    });

    setExplicitFlowState("newEmailConfirmed");
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return EMPTY_VALUE;
    return (
      ROLE_PROFILES.find((profile) => profile.code === role)?.name || role
    );
  };

  const getUserStatusLabel = (status?: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "pending_activation":
        return "Pendiente de activación";
      case "pending_validation":
        return "Pendiente de validación";
      case "pending_sync":
        return "Pendiente de sincronización";
      case "blocked":
        return "Bloqueado";
      default:
        return status || EMPTY_VALUE;
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Correo Corporativo",
      "Nombre Completo",
      "Teléfono",
      "Puesto",
      "Área",
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_usuario_odiseo.xlsx");
  };

  const parseUserTemplate = (file: File): Promise<ImportedUserData | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            resolve(null);
            return;
          }

          const firstRow = jsonData[0] as Record<string, any>;
          const imported: ImportedUserData = {};

          if (firstRow["Correo Corporativo"]) {
            imported.email = String(firstRow["Correo Corporativo"]).trim();
          }

          if (firstRow["Nombre Completo"]) {
            imported.fullName = String(firstRow["Nombre Completo"]).trim();
          }

          if (firstRow["Teléfono"]) {
            imported.phone = String(firstRow["Teléfono"]).trim();
          }

          if (firstRow["Puesto"]) {
            imported.position = String(firstRow["Puesto"]).trim();
          }

          if (firstRow["Área"]) {
            imported.area = String(firstRow["Área"]).trim();
          }

          resolve(imported);
        } catch (error) {
          resolve(null);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handleUploadTemplate = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imported = await parseUserTemplate(file);

    if (imported && imported.email) {
      setForm((prev) => ({
        ...prev,
        ...imported,
      }));

      validateCorporateEmail(imported.email);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAreaChange = (area: string) => {
    setForm((prev) => ({
      ...prev,
      area,
    }));
  };

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!form.email.trim()) {
      errors.email = "Ingresa el correo corporativo.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "El formato del correo no es válido.";
    }

    if (explicitFlowState === "newEmailConfirmed") {
      if (!form.fullName.trim()) {
        errors.fullName = "Ingresa el nombre completo.";
      }

      if (!form.position.trim()) {
        errors.position = "Ingresa el puesto.";
      }

      if (!form.area) {
        errors.area = "Selecciona el área.";
      }

      if (!form.profileCode) {
        errors.profileCode = "Selecciona el perfil de acceso ODISEO.";
      } else if (form.profileCode === "ADMINISTRADOR") {
        const activeUsers = getAllUsers();
        const existingAdmin = activeUsers.some(
          (user) =>
            user.status === "active" &&
            user.profileCode === "ADMINISTRADOR"
        );

        if (existingAdmin) {
          errors.profileCode = "Ya existe un usuario activo con perfil Administrador. No es posible asignar este perfil a otro usuario.";
        }
      }

      if (!form.integralSystemUserId.trim()) {
        errors.integralSystemUserId = "Selecciona un usuario válido del Sistema Integral.";
      } else {
        const validation = validateSiUser(form.integralSystemUserId);
        if (!validation.exists) {
          errors.integralSystemUserId = "Selecciona un usuario válido del Sistema Integral.";
        } else if (validation.user?.status === "Inactivo") {
          errors.integralSystemUserId = "El usuario del Sistema Integral se encuentra inactivo.";
        }
      }
    }

    return errors;
  }, [form, explicitFlowState]);

  const isEmailStepComplete =
    explicitFlowState === "newEmailConfirmed" && Boolean(form.email.trim());

  const isUserDataStepComplete =
    Boolean(form.fullName.trim()) &&
    Boolean(form.position.trim());

  const isAccessStepComplete = Boolean(form.area) && Boolean(form.profileCode);

  const isIntegralUserStepComplete = Boolean(form.integralSystemUserId.trim());

  const completionPercentage = useMemo(() => {
    if (existingUserPreview) return 0;

    const checks = [
      isEmailStepComplete,
      isUserDataStepComplete,
      isAccessStepComplete,
      isIntegralUserStepComplete,
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [isEmailStepComplete, isUserDataStepComplete, isAccessStepComplete, isIntegralUserStepComplete, existingUserPreview]);

  const validationErrorList = Object.values(validationErrors).filter(
    (error): error is string => Boolean(error)
  );

  const shouldDisableSubmit =
    Boolean(existingUserPreview) ||
    explicitFlowState === "existingEmailFound" ||
    explicitFlowState !== "newEmailConfirmed" ||
    isEmailStepComplete && (!isUserDataStepComplete || !isAccessStepComplete || !isIntegralUserStepComplete) ||
    validationErrorList.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setErrorMessage(null);

    if (shouldDisableSubmit || Object.keys(validationErrors).length > 0) {
      return;
    }

    const duplicateByEmail = getUserByEmail(form.email.trim().toLowerCase());

    if (duplicateByEmail) {
      setErrorMessage(
        "No se puede registrar porque el correo corporativo ya existe en ODISEO."
      );
      setExplicitFlowState("existingEmailFound");
      return;
    }


    setLoading(true);

    try {
      const tempPassword = Math.random().toString(36).substring(2, 10);

      // Derive ODISEO username from email
      const emailParts = form.email.trim().toLowerCase().split("@");
      const odiseoUsername = emailParts[0];

      // Get profile internal roles
      const profileRoles = getProfileInternalRoles(form.profileCode);
      const selectedProfileData = ACCESS_PROFILES.find(p => p.code === form.profileCode);

      const newUser = createUser({
        email: form.email.trim().toLowerCase(),
        password: tempPassword,
        fullName: form.fullName.trim(),
        phone: form.phone || undefined,
        workerCode: odiseoUsername,
        position: form.position.trim(),
        role: "admin" as any,
        status: "pending_activation" as any,
        area: form.area || undefined,
        areaCode: form.areaCode,
        areaLabel: form.areaLabel,
        profileCode: form.profileCode,
        profileLabel: selectedProfileData?.name,
        roles: profileRoles,
        integralSystemUserId: form.integralSystemUserId,
        integralSystemUserValue: form.integralSystemUserValue,
        integralSystemUserName: form.integralSystemUserName,
        integralSystemUserStatus: form.integralSystemUserStatus,
        odiseoUserStatus: "PENDIENTE_ACTIVACION",
        syncStatus: "PENDIENTE_SINCRONIZACION",
        activeLogical: true,
      });

      mockSendEmail(
        newUser.email,
        "Bienvenido a ODISEO - Activación de Cuenta",
        `Hola ${newUser.fullName.split(" ")[0]},\n\nTu cuenta ha sido creada en ODISEO.\n\nEquipo ODISEO`,
        newUser.id,
        "activation"
      );

      localStorage.setItem(
        RECENT_NEW_USER_KEY,
        JSON.stringify({
          userId: newUser.id,
          expiresAt: Date.now() + 10 * 1000,
        })
      );

      window.dispatchEvent(
        new CustomEvent("newUserCreated", {
          detail: { userId: newUser.id },
        })
      );

      setSuccessMessage("Usuario ODISEO registrado correctamente.");
      setTimeout(() => navigate("/users"), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="max-w-md rounded-lg border-2 border-green-300 bg-green-50 p-8 text-center">
          <div className="mb-4 text-4xl">✓</div>
          <p className="text-lg font-bold text-green-900">{successMessage}</p>
          <p className="mt-2 text-sm text-green-700">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  interface PreviewItem {
    label?: string;
    value?: string;
    section?: string;
  }

  const previewItems: PreviewItem[] = existingUserPreview
    ? [
        { label: "ID ODISEO", value: existingUserPreview.code },
        { label: "Correo", value: existingUserPreview.email },
        { label: "Nombre completo", value: existingUserPreview.fullName },
        { label: "Puesto", value: existingUserPreview.position },
        { label: "Área", value: existingUserPreview.area },
        { label: "Perfil", value: getRoleLabel(existingUserPreview.role) },
        { label: "Estado", value: getUserStatusLabel(existingUserPreview.status) },
      ]
    : [
        { section: "ODISEO" },
        { label: "Correo corporativo", value: form.email || EMPTY_VALUE },
        { label: "Nombre completo", value: form.fullName || EMPTY_VALUE },
        { label: "Puesto", value: form.position || EMPTY_VALUE },
        { label: "Área", value: form.area || EMPTY_VALUE },
        { label: "Perfil ODISEO", value: selectedProfile?.name || EMPTY_VALUE },
        { label: "Estado ODISEO", value: form.odiseoUserStatus ? form.odiseoUserStatus.replace(/_/g, " ") : EMPTY_VALUE },
        { section: "SISTEMA INTEGRAL" },
        { label: "Nombre Usuario SI", value: form.integralSystemUserName || EMPTY_VALUE },
        { section: "INTEGRACIÓN" },
        { label: "Estado sincronización", value: "Pendiente de sincronización" },
      ];

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <button
        type="button"
        onClick={() => navigate("/users")}
        className="mb-2 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[65%_1fr]">
          {/* ═══════════ COLUMNA IZQUIERDA (65%) ═══════════ */}
          <div className="space-y-4">
            {/* SECCIÓN 1: Correo y validación */}
            <SectionCard
              number={1}
              title="Correo y validación"
              status={
                existingUserPreview
                  ? "error"
                  : isEmailStepComplete
                    ? "completed"
                    : "pending"
              }
              color="#00395A"
              required
              infoTitle="Identificar usuario"
              infoContent="Ingresa el correo corporativo para validar si el usuario ya existe en ODISEO. Si el correo ya está registrado, no se podrá continuar con el alta."
            >
              <div className="space-y-3">
                <FormInput
                  label="Correo Corporativo"
                  value={form.email}
                  onChange={(value) => {
                    setForm((prev) => ({
                      ...prev,
                      email: value,
                      fullName: "",
                      position: "",
                      area: "",
                      profileCode: "" as ProfileCode,
                      odiseoUserStatus: "PENDIENTE_ACTIVACION",
                      integralSystemUserId: "",
                      integralSystemUserValue: "",
                      integralSystemUserName: undefined,
                      integralSystemUserStatus: undefined,
                      phone: "",
                    }));

                    setExistingUserPreview(null);
                    setEmailValidationMessage(null);
                    setExplicitFlowState("initial");
                    setErrorMessage(null);
                    setSubmitAttempted(false);
                  }}
                  type="email"
                  placeholder="Ej: juan.perez@amcor.com"
                  error={submitAttempted ? validationErrors.email : undefined}
                  required
                />

                {isValidatingEmail && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700">
                    Validando correo corporativo...
                  </div>
                )}

                {emailValidationMessage && (
                  <div
                    className={`rounded-lg border px-3 py-2.5 text-xs font-semibold ${
                      emailValidationMessage.type === "success"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {emailValidationMessage.text}
                  </div>
                )}
              </div>
            </SectionCard>

            {/* SECCIÓN 2: Datos ODISEO */}
            {!existingUserPreview && explicitFlowState === "newEmailConfirmed" && (
              <SectionCard
                number={2}
                title="Datos ODISEO"
                status={isUserDataStepComplete ? "completed" : "pending"}
                color="#00395A"
                required
                infoTitle="Datos propios del usuario ODISEO"
                infoContent="Completa la información del usuario en el portal. Estos datos son independientes del Sistema Integral."
              >
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleUploadTemplate}
                    className="hidden"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold uppercase text-slate-700 mb-3">
                        Información del usuario
                      </h4>
                    </div>
                    <ExcelTemplateActions
                      onDownloadTemplate={handleDownloadTemplate}
                      onUploadTemplateClick={() => fileInputRef.current?.click()}
                    />
                  </div>

                  <FormInput
                    label="Nombre completo"
                    value={form.fullName}
                    onChange={(value) =>
                      setForm({ ...form, fullName: value })
                    }
                    placeholder="Ej: Juan Pérez García"
                    error={
                      submitAttempted
                        ? validationErrors.fullName
                        : undefined
                    }
                    required
                  />

                  <FormInput
                    label="Puesto"
                    value={form.position}
                    onChange={(value) =>
                      setForm({ ...form, position: value })
                    }
                    placeholder="Ej: Analista TI o Data Manager"
                    error={
                      submitAttempted
                        ? validationErrors.position
                        : undefined
                    }
                    required
                  />

                  <FormInput
                    label="Teléfono"
                    value={form.phone}
                    onChange={(value) =>
                      setForm({ ...form, phone: value })
                    }
                    placeholder="Ej: +52 55 1234 5678"
                  />
                </div>
              </SectionCard>
            )}

            {/* SECCIÓN 3: Área, Perfil y Estado ODISEO */}
            {!existingUserPreview && explicitFlowState === "newEmailConfirmed" && (
              <SectionCard
                number={3}
                title="Perfil y estado ODISEO"
                status={isAccessStepComplete ? "completed" : "pending"}
                color="#00395A"
                required
                infoTitle="Configuración de acceso y estado"
                infoContent="El Perfil ODISEO define los permisos del usuario. El Estado es independiente del Sistema Integral."
              >
                <div className="space-y-3">
                  <FormSelect
                    label="Área"
                    value={form.area}
                    onChange={handleAreaChange}
                    options={USER_AREA_OPTIONS}
                    placeholder="Selecciona el área"
                    error={
                      submitAttempted ? validationErrors.area : undefined
                    }
                    required
                  />

                  <FormSelect
                    label="Perfil de acceso ODISEO"
                    value={form.profileCode}
                    onChange={(value) => setForm({ ...form, profileCode: value as ProfileCode })}
                    options={profileOptions}
                    placeholder="Selecciona el perfil"
                    error={
                      submitAttempted ? validationErrors.profileCode : undefined
                    }
                    required
                    labelAction={
                      <InfoTooltip
                        title="Perfiles de acceso ODISEO"
                        content="Define el grupo de roles y permisos que tendrá el usuario dentro de ODISEO."
                      />
                    }
                  />

                  <FormSelect
                    label="Estado Usuario ODISEO"
                    value={form.odiseoUserStatus}
                    onChange={(value) => setForm({ ...form, odiseoUserStatus: value })}
                    options={[
                      { value: "PENDIENTE_ACTIVACION", label: "Pendiente de activación" },
                      { value: "ACTIVO", label: "Activo" },
                      { value: "INACTIVO", label: "Inactivo" },
                      { value: "BLOQUEADO", label: "Bloqueado" },
                    ]}
                    placeholder="Selecciona el estado"
                    required
                  />
                </div>
              </SectionCard>
            )}

            {/* SECCIÓN 4: Usuario Sistema Integral */}
            {!existingUserPreview && explicitFlowState === "newEmailConfirmed" && (
              <SectionCard
                number={4}
                title="Vinculación Sistema Integral"
                status={isIntegralUserStepComplete ? "completed" : "pending"}
                color="#00395A"
                required
                infoTitle="Referencia al Sistema Integral"
                infoContent="Vincula este usuario ODISEO con un usuario del Sistema Integral para sincronización y trazabilidad. Los datos del SI son solo informativos."
              >
                <div className="space-y-3">
                  <SiUserSelector
                    value={form.integralSystemUserId}
                    onChange={(userId, userValue) => {
                      const siUser = userId ? getSiUserMirrorByCode(userId) : null;
                      setForm({
                        ...form,
                        integralSystemUserId: userId,
                        integralSystemUserValue: userValue,
                        integralSystemUserName: siUser?.integralSystemUserValue,
                        integralSystemUserStatus: siUser?.integralSystemUserStatus,
                      });
                    }}
                    error={
                      submitAttempted
                        ? validationErrors.integralSystemUserId
                        : undefined
                    }
                    required
                  />

                  {form.integralSystemUserName && (
                    <FormInput
                      label="Nombre Usuario SI"
                      value={form.integralSystemUserName}
                      onChange={() => {}}
                      disabled
                    />
                  )}

                  <FormInput
                    label="Estado de sincronización"
                    value="Pendiente de sincronización"
                    onChange={() => {}}
                    disabled
                  />
                </div>
              </SectionCard>
            )}
          </div>

          {/* ═══════════ COLUMNA DERECHA (35%) ═══════════ */}
          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  {existingUserPreview ? "Usuario encontrado" : "Vista rápida"}
                </h3>
                <p className="text-xs text-slate-600">
                  {existingUserPreview
                    ? "El correo ya existe en ODISEO."
                    : "Resumen del usuario."}
                </p>
              </div>

              {existingUserPreview ? (
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 mb-4">
                    <p className="text-xs font-bold text-red-700 uppercase">
                      Registro no permitido
                    </p>
                    <p className="mt-1 text-xs text-red-600">
                      {existingUserPreview.fullName}
                    </p>
                    <p className="text-xs text-red-600">
                      {existingUserPreview.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-[90px_1fr] gap-2 border-b border-slate-100 pb-1">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      Código ODISEO
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {existingUserPreview.code || EMPTY_VALUE}
                    </span>
                  </div>

                  {previewItems.map((item: PreviewItem, index: number) => (
                    item.section ? (
                      <div key={index} className="mt-3 pt-3 border-t border-slate-100 first:mt-0 first:pt-0 first:border-0">
                        <span className="text-xs font-bold uppercase text-slate-500">{item.section}</span>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="grid grid-cols-[90px_1fr] gap-2 border-b border-slate-100 pb-1 last:border-0"
                      >
                        <span className="text-xs font-bold uppercase text-slate-400">
                          {item.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {item.value || EMPTY_VALUE}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      ID
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {userCode}
                      </span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>

                  {previewItems.map((item: PreviewItem, index: number) => (
                    item.section ? (
                      <div key={index} className="mt-3 pt-3 border-t border-slate-100 first:mt-0 first:pt-0 first:border-0">
                        <span className="text-xs font-bold uppercase text-slate-500">{item.section}</span>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="grid grid-cols-[90px_1fr] gap-2 border-b border-slate-100 pb-1 last:border-0"
                      >
                        <span className="text-xs font-bold uppercase text-slate-400">
                          {item.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {item.value || EMPTY_VALUE}
                        </span>
                      </div>
                    )
                  ))}

                  {selectedProfile &&
                    explicitFlowState === "newEmailConfirmed" && (
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <span className="text-xs font-bold uppercase text-slate-400">
                          Roles internos
                        </span>
                        <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                          {selectedProfile.internalRoles.join(", ")}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mx-auto mt-4 max-w-3xl">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
              {errorMessage}
            </div>
          </div>
        )}

        <div className="sticky bottom-0 z-40 mt-6 border-t border-slate-200 bg-[#f6f8fb]/95 py-4 backdrop-blur">
          <FormActionButtons
            onCancel={() => navigate("/users")}
            validationErrorList={validationErrorList}
            submitAttempted={submitAttempted}
            submitLabel="Registrar Usuario"
            cancelLabel="Cancelar"
            isLoading={loading}
            validationTitle={
              explicitFlowState === "initial"
                ? "Ingresa el correo corporativo para continuar."
                : "Completa todos los campos requeridos."
            }
          />
        </div>
      </form>
    </div>
  );
}

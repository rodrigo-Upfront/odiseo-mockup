import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";
import { getCurrentUser } from "../../../shared/data/userStorage";
import FormActionButtons from "../../../shared/components/forms/FormActionButtons";
import ManagementTypeSelector from "../components/ManagementTypeSelector";
import ManagementParametersCard from "../components/ManagementParametersCard";
import TemplateDownloadCard from "../components/TemplateDownloadCard";
import ValidationSummaryCard from "../components/ValidationSummaryCard";
import ChangePreviewTable from "../components/ChangePreviewTable";
import ChangeLogPanel from "../components/ChangeLogPanel";
import { uploadAndValidateTemplate, confirmChanges, getChangeLog } from "../services/catalogRestrictionService";
import { validateManagementParams, validateFileUpload, canConfirmChanges } from "../utils/catalogRestrictionValidators";
import type { ManagementType, ValidationSummary, ChangeLogEntry } from "../types/catalogRestriction.types";

export default function CatalogRestrictionManagementPage() {
  const { setHeader, resetHeader } = useLayout();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [managementType, setManagementType] = useState<ManagementType>("catalog");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [catalogSource, setCatalogSource] = useState<"ODISEO" | "SISTEMA_INTEGRAL">("ODISEO");
  const [reason, setReason] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"pending" | "validating" | "with_observations" | "valid" | "applied">("pending");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setHeader({
      title: "Gestión de Catálogos y Restricciones",
      breadcrumbs: [
        { label: "Inicio", href: "/dashboard" },
        { label: "Gestión de Catálogos y Restricciones" },
      ],
    });
    setChangeLog(getChangeLog());
    return () => resetHeader();
  }, [setHeader, resetHeader]);

  const validationErrors = useMemo(() => {
    return validateManagementParams(managementType, selectedTargetId, reason);
  }, [managementType, selectedTargetId, reason]);

  const fileErrors = useMemo(() => {
    return validateFileUpload(uploadedFile);
  }, [uploadedFile]);

  const handleTypeChange = (type: ManagementType) => {
    setManagementType(type);
    setSelectedTarget("");
    setSelectedTargetId("");
    setCatalogSource("ODISEO");
    setValidationSummary(null);
    setUploadedFile(null);
    setUploadedFileName("");
    setUploadStatus("pending");
    setSubmitAttempted(false);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setUploadedFileName(file.name);
    setValidationSummary(null);
    setUploadStatus("pending");
  };

  const handleValidate = async () => {
    if (!uploadedFile) return;

    setIsValidating(true);
    setUploadStatus("validating");

    try {
      const summary = await uploadAndValidateTemplate(
        uploadedFile,
        selectedTargetId
      );

      setValidationSummary(summary);
      setUploadStatus(summary.status === "valid" ? "valid" : "with_observations");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    setManagementType("catalog");
    setSelectedTarget("");
    setSelectedTargetId("");
    setCatalogSource("ODISEO");
    setReason("");
    setUploadedFile(null);
    setUploadedFileName("");
    setValidationSummary(null);
    setUploadStatus("pending");
    setSubmitAttempted(false);
    setShowConfirmModal(false);
  };

  const handleConfirmClick = () => {
    setSubmitAttempted(true);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!canConfirmChanges(validationSummary)) {
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmModal = async () => {
    if (!validationSummary) return;

    setIsSubmitting(true);

    try {
      // Convertir filas de vista previa a formato para confirmación
      const rowsToConfirm = validationSummary.rows
        .filter((row) => row.detectedAction !== "unchanged")
        .map((row) => {
          const item = "item" in row ? row.item : row.ruleCode;
          const name = "newName" in row ? row.newName : row.allowedValue;
          return {
            item,
            name,
            status: (row.newStatus || "Activo") as "Activo" | "Inactivo" | "Bloqueado",
          };
        });

      await confirmChanges(selectedTargetId, rowsToConfirm, reason);

      setUploadStatus("applied");
      setShowConfirmModal(false);

      const totalProcessed = (validationSummary?.newRecords || 0)
        + (validationSummary?.modifiedRecords || 0)
        + (validationSummary?.inactivatedRecords || 0)
        + (validationSummary?.blockedRecords || 0);

      const newEntry: ChangeLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleDateString("es-ES") + " " + new Date().toLocaleTimeString("es-ES"),
        user: currentUser?.fullName || "Administrador",
        managementType,
        element: selectedTarget || "Elemento desconocido",
        action: "Actualización por plantilla",
        processedRecords: totalProcessed,
        result: "success",
        source: catalogSource,
      };

      setChangeLog([newEntry, ...changeLog]);
      setSuccessMessage("La información fue actualizada correctamente y registrada en la bitácora.");

      setTimeout(() => {
        handleCancel();
        setSuccessMessage(null);
        navigate("/catalogs");
      }, 2500);
    } catch (error) {
      console.error("Error confirmando cambios:", error);
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
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

  const totalChanges = (validationSummary?.newRecords || 0)
    + (validationSummary?.modifiedRecords || 0)
    + (validationSummary?.inactivatedRecords || 0)
    + (validationSummary?.blockedRecords || 0);
  const noChangesDetected = validationSummary && totalChanges === 0 && validationSummary.criticalErrors === 0;

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="rounded-lg border-l-4 border-brand-primary bg-brand-secondary-soft p-4 flex-1">
            <p className="text-sm text-slate-700">
              Administra catálogos propios y restricciones del sistema mediante plantillas controladas, asegurando validación, trazabilidad y disponibilidad de la información actualizada.
            </p>
          </div>
          <button
            onClick={() => navigate("/catalogs")}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-primary bg-white px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary hover:text-white transition-colors whitespace-nowrap"
          >
            👁️ Ver todo
          </button>
        </div>

        <ManagementTypeSelector value={managementType} onChange={handleTypeChange} />

        <div className="space-y-6">
          <ManagementParametersCard
            type={managementType}
            selectedTarget={selectedTarget}
            selectedTargetId={selectedTargetId}
            onTargetChange={setSelectedTarget}
            onTargetIdChange={setSelectedTargetId}
            errors={validationErrors}
            submitAttempted={submitAttempted}
            catalogSource={catalogSource}
            onCatalogSourceChange={setCatalogSource}
          />

          <TemplateDownloadCard
            type={managementType}
            targetId={selectedTargetId}
            uploadStatus={uploadStatus}
            uploadedFileName={uploadedFileName}
            reason={reason}
            reasonError={validationErrors.reason}
            onFileUpload={handleFileUpload}
            onValidate={handleValidate}
            onReasonChange={setReason}
            isValidating={isValidating}
            submitAttempted={submitAttempted}
            catalogSource={catalogSource}
          />

          {validationSummary && (
            <>
              <ValidationSummaryCard summary={validationSummary} />

              {noChangesDetected && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">No se detectaron cambios para aplicar.</p>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-4">Vista previa de cambios</h3>
                <ChangePreviewTable type={managementType} rows={validationSummary.rows} />
              </div>
            </>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <ChangeLogPanel entries={changeLog} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-[#f6f8fb]/95 py-4 backdrop-blur">
        <FormActionButtons
          onCancel={handleCancel}
          onSubmit={handleConfirmClick}
          validationErrorList={
            submitAttempted
              ? Object.values(validationErrors).filter((e): e is string => Boolean(e))
              : []
          }
          submitAttempted={submitAttempted}
          submitLabel="Confirmar actualización"
          cancelLabel="Cancelar"
          isLoading={isSubmitting}
          validationTitle="Faltan campos obligatorios."
        />
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirmar actualización</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-slate-700">
                Los cambios serán aplicados y registrados en la bitácora del sistema. ¿Deseas continuar?
              </p>
              <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-600 uppercase">Resumen</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Nuevos: </span>
                    <span className="font-bold text-green-600">{validationSummary?.newRecords || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Modificados: </span>
                    <span className="font-bold text-blue-600">{validationSummary?.modifiedRecords || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Inactivados: </span>
                    <span className="font-bold text-slate-600">{validationSummary?.inactivatedRecords || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Bloqueados: </span>
                    <span className="font-bold text-red-600">{validationSummary?.blockedRecords || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmModal}
                disabled={isSubmitting}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

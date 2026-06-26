import { useRef, useState } from "react";
import FormCard from "../../../shared/components/forms/FormCard";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import { downloadTemplate } from "../services/catalogRestrictionService";
import { getValidationStatusColor } from "../utils/catalogRestrictionValidators";
import CatalogPreviewModal from "./CatalogPreviewModal";
import type { ManagementType, ValidationStatus } from "../types/catalogRestriction.types";

interface TemplateDownloadCardProps {
  type: ManagementType;
  targetId: string;
  uploadStatus: ValidationStatus;
  uploadedFileName: string;
  reason: string;
  reasonError?: string;
  onFileUpload: (file: File) => void;
  onValidate: () => void;
  onReasonChange: (value: string) => void;
  isValidating: boolean;
  submitAttempted: boolean;
  catalogSource?: "ODISEO" | "SISTEMA_INTEGRAL";
}

export default function TemplateDownloadCard({
  type,
  targetId,
  uploadStatus,
  uploadedFileName,
  reason,
  reasonError,
  onFileUpload,
  onValidate,
  onReasonChange,
  isValidating,
  submitAttempted,
  catalogSource = "ODISEO",
}: TemplateDownloadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const isSistemaIntegral = catalogSource === "SISTEMA_INTEGRAL";

  const handleDownload = async () => {
    if (type === "catalog" && targetId) {
      await downloadTemplate(targetId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const statusLabels: Record<ValidationStatus, string> = {
    pending: "Pendiente",
    validating: "Validando",
    with_observations: "Con observaciones",
    valid: "Válido",
    applied: "Aplicado",
  };

  return (
    <>
      <FormCard title="Plantilla" icon="📄" color="#00A1DE">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-3">
              Descarga la plantilla vigente, actualiza los valores necesarios y vuelve a cargar el archivo para que ODISEO detecte los cambios automáticamente.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!targetId}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                👁️ Vista previa
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!targetId}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-primary bg-white px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ↓ Descargar plantilla
              </button>
            </div>
          </div>

        {isSistemaIntegral && (
          <div className="border-l-4 border-amber-300 bg-amber-50 p-4 rounded-lg">
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">🔒</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Catálogo del Sistema Integral (Solo Lectura)</p>
                <p className="text-sm text-amber-800 mt-1">
                  Este catálogo viene del Sistema Integral como tabla espejo sincronizada. Puedes visualizar los valores descargando la plantilla o usando "Vista previa", pero no es posible modificar o cargar cambios desde ODISEO.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Archivo cargado
            </p>
            <p className="text-sm text-slate-700 font-medium">
              {uploadedFileName || "Ningún archivo seleccionado"}
            </p>
          </div>

          {uploadStatus && uploadStatus !== "pending" && (
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getValidationStatusColor(uploadStatus)}`}>
              {uploadStatus === "validating" && (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {statusLabels[uploadStatus]}
            </div>
          )}
        </div>

        {!isSistemaIntegral && (
          <div className="flex flex-col gap-2 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Seleccionar archivo
            </button>
            <button
              type="button"
              onClick={onValidate}
              disabled={!uploadedFileName || isValidating || uploadStatus === "applied"}
              className="rounded-lg border border-brand-primary bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? "Validando..." : "Cargar y validar"}
            </button>

            <div className="pt-2">
              <FormTextarea
                label="Motivo del cambio"
                value={reason}
                onChange={onReasonChange}
                placeholder="Describe el motivo de esta actualización..."
                helper="Este motivo será registrado en la bitácora del sistema."
                error={submitAttempted ? reasonError : undefined}
                rows={3}
                maxLength={500}
              />
            </div>
          </div>
        )}
      </div>
    </FormCard>

      <CatalogPreviewModal
        isOpen={showPreview}
        catalogCode={targetId}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}

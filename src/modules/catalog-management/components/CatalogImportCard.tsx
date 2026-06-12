import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import FormCard from "../../../shared/components/forms/FormCard";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import { getCatalogByCode } from "../../../shared/catalogs";
import { getValidationStatusColor } from "../utils/catalogRestrictionValidators";
import CatalogPreviewModal from "./CatalogPreviewModal";
import type { ValidationStatus } from "../types/catalogRestriction.types";

interface CatalogImportCardProps {
  selectedCatalogCode: string;
  uploadStatus: ValidationStatus;
  uploadedFileName: string;
  reason: string;
  reasonError?: string;
  validationSummary?: any;
  onFileUpload: (file: File) => void;
  onValidate: () => void;
  onReasonChange: (value: string) => void;
  onConfirm?: () => void;
  onClose: () => void;
  isValidating: boolean;
  isSubmitting?: boolean;
  submitAttempted: boolean;
}

export default function CatalogImportCard({
  selectedCatalogCode,
  uploadStatus,
  uploadedFileName,
  reason,
  reasonError,
  validationSummary,
  onFileUpload,
  onValidate,
  onReasonChange,
  onConfirm,
  onClose,
  isValidating,
  isSubmitting = false,
  submitAttempted,
}: CatalogImportCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const catalog = getCatalogByCode(selectedCatalogCode);
  const isSistemaIntegral = catalog?.ownerSystem === "SISTEMA_INTEGRAL";

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
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
          <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Importar catálogo
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {catalog?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          <div className="p-6 space-y-6 pb-24">
            {isSistemaIntegral && (
              <div className="border-l-4 border-amber-300 bg-amber-50 p-4 rounded-lg">
                <div className="flex gap-3">
                  <span className="text-xl flex-shrink-0">🔒</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Catálogo del Sistema Integral (Solo Lectura)</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Este catálogo viene del Sistema Integral como tabla espejo sincronizada. No es posible cargar cambios desde ODISEO.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isSistemaIntegral && (
              <div className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-slate-300 p-6">
                  <div className="text-center">
                    <Upload size={32} className="mx-auto mb-3 text-slate-400" />
                    <p className="text-sm text-slate-600 mb-4">
                      Descarga la plantilla, actualiza los valores y vuelve a cargar el archivo
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors mb-3"
                    >
                      👁️ Vista previa
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Archivo seleccionado
                  </p>
                  <p className="text-sm text-slate-700 font-medium">
                    {uploadedFileName || "Ningún archivo seleccionado"}
                  </p>

                  {uploadStatus && uploadStatus !== "pending" && (
                    <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getValidationStatusColor(uploadStatus)}`}>
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

                <div className="flex gap-2">
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
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Seleccionar archivo
                  </button>
                  <button
                    type="button"
                    onClick={onValidate}
                    disabled={!uploadedFileName || isValidating || uploadStatus === "applied"}
                    className="flex-1 rounded-lg border border-brand-primary bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? "Validando..." : "Cargar y validar"}
                  </button>
                </div>

                {validationSummary && uploadStatus !== "pending" && (
                  <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                    <h4 className="font-semibold text-slate-900">Resumen de cambios</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {validationSummary.newRecords > 0 && (
                        <div className="rounded bg-blue-50 p-2 text-blue-700">
                          <div className="font-semibold">{validationSummary.newRecords}</div>
                          <div className="text-xs">Registros nuevos</div>
                        </div>
                      )}
                      {validationSummary.modifiedRecords > 0 && (
                        <div className="rounded bg-amber-50 p-2 text-amber-700">
                          <div className="font-semibold">{validationSummary.modifiedRecords}</div>
                          <div className="text-xs">Registros modificados</div>
                        </div>
                      )}
                      {validationSummary.inactivatedRecords > 0 && (
                        <div className="rounded bg-orange-50 p-2 text-orange-700">
                          <div className="font-semibold">{validationSummary.inactivatedRecords}</div>
                          <div className="text-xs">Registros inactivados</div>
                        </div>
                      )}
                      {validationSummary.blockedRecords > 0 && (
                        <div className="rounded bg-red-50 p-2 text-red-700">
                          <div className="font-semibold">{validationSummary.blockedRecords}</div>
                          <div className="text-xs">Registros bloqueados</div>
                        </div>
                      )}
                    </div>
                    {validationSummary.criticalErrors > 0 && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        <span className="font-semibold">⚠️ {validationSummary.criticalErrors} error(es) crítico(s)</span>
                        <p className="text-xs mt-1">Revisa el archivo y vuelve a intentar.</p>
                      </div>
                    )}
                  </div>
                )}

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
            )}
          </div>

          {/* Footer Actions */}
          {!isSistemaIntegral && (
            <div className="sticky bottom-0 flex gap-2 justify-end border-t border-slate-200 bg-white p-6">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              {uploadStatus === "valid" && validationSummary && (
                <button
                  onClick={onConfirm}
                  disabled={!reason.trim() || isSubmitting}
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar cambios"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <CatalogPreviewModal
        isOpen={showPreview}
        catalogCode={selectedCatalogCode}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}

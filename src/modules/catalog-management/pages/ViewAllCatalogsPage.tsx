import { useState, useMemo, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Download, ChevronDown, Upload } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";
import { getCurrentUser } from "../../../shared/data/userStorage";
import { getCatalogs } from "../../../shared/catalogs";
import { getAvailableRestrictions, uploadAndValidateTemplate, confirmChanges } from "../services/catalogRestrictionService";
import CatalogsList from "../components/CatalogsList";
import RestrictionsList from "../components/RestrictionsList";
import CatalogPreviewModal from "../components/CatalogPreviewModal";
import CatalogImportCard from "../components/CatalogImportCard";
import { exportAllCatalogs, exportAllRestrictions, exportAllData } from "../services/catalogExportService";
import { validateManagementParams, validateFileUpload } from "../utils/catalogRestrictionValidators";
import type { ValidationStatus } from "../types/catalogRestriction.types";

export default function ViewAllCatalogsPage() {
  const { setHeader, resetHeader } = useLayout();
  const currentUser = getCurrentUser();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedCatalogCode, setSelectedCatalogCode] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "ODISEO" | "SISTEMA_INTEGRAL">("all");

  // Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCatalogCode, setImportCatalogCode] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState<ValidationStatus>("pending");
  const [reason, setReason] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const catalogs = useMemo(() => getCatalogs(), []);
  const restrictions = useMemo(() => getAvailableRestrictions(), []);

  const filteredCatalogs = useMemo(() => {
    if (sourceFilter === "all") return catalogs;
    return catalogs.filter((cat) =>
      sourceFilter === "SISTEMA_INTEGRAL"
        ? cat.ownerSystem === "SISTEMA_INTEGRAL"
        : cat.ownerSystem !== "SISTEMA_INTEGRAL"
    );
  }, [catalogs, sourceFilter]);

  const handleExportCatalogs = async () => {
    setIsExporting(true);
    try {
      await exportAllCatalogs();
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportRestrictions = async () => {
    setIsExporting(true);
    try {
      await exportAllRestrictions();
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await exportAllData();
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleOpenImport = (catalogCode: string) => {
    setImportCatalogCode(catalogCode);
    setShowImportModal(true);
    setUploadedFile(null);
    setUploadedFileName("");
    setReason("");
    setUploadStatus("pending");
    setValidationSummary(null);
    setSubmitAttempted(false);
  };

  const handleImportFileUpload = (file: File) => {
    setUploadedFile(file);
    setUploadedFileName(file.name);
    setValidationSummary(null);
    setUploadStatus("pending");
  };

  const handleImportValidate = async () => {
    if (!uploadedFile) return;

    setIsValidating(true);
    setUploadStatus("validating");

    try {
      const summary = await uploadAndValidateTemplate(uploadedFile, importCatalogCode);
      setValidationSummary(summary);
      setUploadStatus(summary.status === "valid" ? "valid" : "with_observations");
    } finally {
      setIsValidating(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!validationSummary) return;

    setIsSubmitting(true);

    try {
      const rowsToConfirm = validationSummary.rows
        .filter((row: any) => row.detectedAction !== "unchanged")
        .map((row: any) => ({
          item: row.item,
          name: row.newName,
          status: (row.newStatus || "Activo") as "Activo" | "Inactivo" | "Bloqueado",
        }));

      await confirmChanges(importCatalogCode, rowsToConfirm, reason);

      setUploadStatus("applied");
      setShowConfirmModal(false);
      setSuccessMessage("Catálogo actualizado exitosamente");

      setTimeout(() => {
        handleCloseImport();
        setSuccessMessage(null);
      }, 2000);
    } catch (error) {
      console.error("Error confirming changes:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseImport = () => {
    setShowImportModal(false);
    setImportCatalogCode("");
    setUploadedFile(null);
    setUploadedFileName("");
    setReason("");
    setUploadStatus("pending");
    setValidationSummary(null);
    setSubmitAttempted(false);
  };

  useEffect(() => {
    setHeader({
      title: "Ver Todo",
      breadcrumbs: [
        { label: "Inicio", href: "/dashboard" },
        { label: "Ver Todo" },
      ],
    });
    return () => resetHeader();
  }, [setHeader, resetHeader]);

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <div className="p-6">
        {/* Header con botones de exportar e importar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Catálogos y Restricciones
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Vista completa de todos los catálogos y restricciones disponibles en el sistema
            </p>
          </div>

          {/* Botones de acciones */}
          <div className="flex gap-2">
            {/* Botón de Importar */}
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <Upload size={16} />
              Importar
            </button>

            {/* Botón de Exportar con menú */}
            <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Exportar
              <ChevronDown size={16} className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <button
                  onClick={handleExportCatalogs}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 first:rounded-t-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold">Descargar catálogos</div>
                  <div className="text-xs text-slate-500">Exporta todos los catálogos en un archivo Excel</div>
                </button>

                <button
                  onClick={handleExportRestrictions}
                  disabled={isExporting || restrictions.length === 0}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold">Descargar restricciones</div>
                  <div className="text-xs text-slate-500">Exporta todas las restricciones en un archivo Excel</div>
                </button>

                <button
                  onClick={handleExportAll}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold">Descargar todo</div>
                  <div className="text-xs text-slate-500">Exporta catálogos y restricciones en un archivo</div>
                </button>
              </div>
            )}
            </div>
            </div>
          </div>
        </div>

        {/* Contenido principal: dos columnas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Catálogos a la izquierda */}
          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Catálogos</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {filteredCatalogs.length} catálogo{filteredCatalogs.length !== 1 ? "s" : ""} disponible{filteredCatalogs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <CatalogsList catalogs={filteredCatalogs} onSelectCatalog={setSelectedCatalogCode} />
            </div>
          </div>

          {/* Restricciones a la derecha */}
          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">Restricciones</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {restrictions.length} restricción{restrictions.length !== 1 ? "es" : ""} disponible{restrictions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <RestrictionsList restrictions={restrictions} />
            </div>
          </div>
        </div>
      </div>

      <CatalogPreviewModal
        isOpen={!!selectedCatalogCode}
        catalogCode={selectedCatalogCode}
        onClose={() => setSelectedCatalogCode("")}
      />

      {/* Catalog Selector Modal for Import */}
      {showImportModal && !importCatalogCode && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={handleCloseImport} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Seleccionar catálogo para importar
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Elige el catálogo al que deseas cargar una plantilla actualizada
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-3">
                  {catalogs.map((catalog) => (
                    <button
                      key={catalog.code}
                      onClick={() => handleOpenImport(catalog.code)}
                      className="text-left rounded-lg border border-slate-200 p-4 hover:bg-slate-50 hover:border-brand-primary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{catalog.name}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Código: {catalog.code}
                          </div>
                        </div>
                        {catalog.ownerSystem === "SISTEMA_INTEGRAL" && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                            Sistema Integral
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 flex gap-2 justify-end px-6 py-4">
                <button
                  onClick={handleCloseImport}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Import Card Modal */}
      {showImportModal && importCatalogCode && (
        <CatalogImportCard
          selectedCatalogCode={importCatalogCode}
          uploadStatus={uploadStatus}
          uploadedFileName={uploadedFileName}
          reason={reason}
          reasonError={reason.trim().length === 0 && submitAttempted ? "El motivo es obligatorio" : undefined}
          validationSummary={validationSummary}
          onFileUpload={handleImportFileUpload}
          onValidate={handleImportValidate}
          onReasonChange={setReason}
          onConfirm={handleImportConfirm}
          onClose={handleCloseImport}
          isValidating={isValidating}
          isSubmitting={isSubmitting}
          submitAttempted={submitAttempted}
        />
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700 shadow-lg z-50">
          {successMessage}
        </div>
      )}
    </div>
  );
}

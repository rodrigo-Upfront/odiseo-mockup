import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Download, Upload, AlertCircle, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import Button from "../ui/Button";
import FormSelect from "../forms/FormSelect";
import ClientSearch from "../forms/ClientSearch";
import PreviewRow from "../display/PreviewRow";

import * as portfolioStorage from "../../data/portfolioStorage";
import { createProjectFromPortfolio, saveProjectRecord } from "../../data/projectStorage";
import { getActiveUnitMeasureOptions } from "../../data/unitMeasureCatalog";
import { getActiveMaterialGroupOptions, getMaterialLayerOptionsByGroup } from "../../data/productMaterialCatalog";
import { getActiveModificationOptionsByClassification, normalizeProductClassificationToCatalog } from "../../data/productModificationCatalog";
import { generateSKUForNewRequest } from "../../utils/productSkuCodeUtils";
import { generateNewEDAG, generateNewEM } from "../../utils/productCodeRules";

type AnyRecord = Record<string, unknown>;
type PortfolioRecord = AnyRecord;
type ClientRecord = AnyRecord;

interface BulkProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
  portfolioContext?: {
    portfolioCode?: string;
    clientName?: string;
    [key: string]: any;
  };
}

interface ImportRow {
  rowNum: number;
  classification: string;
  modification: string;
  currentSkuCode?: string;
  currentSkuVersion?: string;
  productName: string;
  volume?: string;
  unit?: string;
  description?: string;
  materials: Array<{ code?: string; micron?: string }>;
  comments?: string;
  validationStatus: "valid" | "observed" | "rejected";
  validationMessage: string;
}

type Step = "context" | "template" | "upload" | "preview" | "complete";

const TEMPLATE_COLUMNS = [
  "Clasificación",
  "Modificación",
  "SKU Actual / Base",
  "Versión SKU Actual",
  "Nombre del Producto",
  "Volumen Referencial",
  "Unidad",
  "Descripción de necesidad",
  "Material Capa 1",
  "Micraje Capa 1",
  "Material Capa 2",
  "Micraje Capa 2",
  "Material Capa 3",
  "Micraje Capa 3",
  "Material Capa 4",
  "Micraje Capa 4",
  "Comentarios",
];

const normalizeText = (value: unknown): string =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[-_/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getRecordValue = (record: unknown, keys: string[]): string => {
  const source = record as AnyRecord | null;
  if (!source) return "";
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
};

const getPortfolioCode = (portfolio: PortfolioRecord | null | undefined) =>
  getRecordValue(portfolio, ["codigo", "code", "id", "portfolioCode"]);

const getPortfolioName = (portfolio: PortfolioRecord | null | undefined) =>
  getRecordValue(portfolio, ["nombre", "name", "nom", "nombrePortafolio"]);

const getClientName = (portfolio: PortfolioRecord | null | undefined) =>
  getRecordValue(portfolio, ["clientName", "cliente", "cli", "nombreCliente"]);

const getMaterialOptions = (): Array<{ value: string; label: string }> => {
  const groups = getActiveMaterialGroupOptions() || [];
  const allMaterials: Array<{ value: string; label: string }> = [];
  for (const group of groups) {
    const materials = getMaterialLayerOptionsByGroup(group.value) || [];
    allMaterials.push(
      ...materials.map((m) => ({
        value: m.code || "",
        label: m.materialName || "",
      }))
    );
  }
  return allMaterials;
};

const generateTemplate = (): void => {
  const data = [TEMPLATE_COLUMNS];
  const sample = [
    "Producto Nuevo",
    "Nueva estructura",
    "",
    "",
    "Producto Ejemplo",
    "1000",
    "Kg",
    "Nueva solicitud de producto",
    "PEBD",
    "100",
    "Aluminio",
    "12",
    "",
    "",
    "",
    "",
    "Comentarios opcionales",
  ];
  data.push(sample);

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
  XLSX.writeFile(wb, "plantilla-importar-productos.xlsx");
};

const validateRow = (row: any, index: number, materials: Array<{ value: string }>): ImportRow => {
  const classification = String(row["Clasificación"] || "").trim();
  const modification = String(row["Modificación"] || "").trim();
  const productName = String(row["Nombre del Producto"] || "").trim();
  const volume = String(row["Volumen Referencial"] || "").trim();
  const unit = String(row["Unidad"] || "").trim();
  const description = String(row["Descripción de necesidad"] || "").trim();
  const currentSkuCode = String(row["SKU Actual / Base"] || "").trim();
  const currentSkuVersion = String(row["Versión SKU Actual"] || "").trim();
  const comments = String(row["Comentarios"] || "").trim();

  const materialsCodes = materials.map((m) => m.value);
  const importMaterials = [
    { code: row["Material Capa 1"], micron: row["Micraje Capa 1"] },
    { code: row["Material Capa 2"], micron: row["Micraje Capa 2"] },
    { code: row["Material Capa 3"], micron: row["Micraje Capa 3"] },
    { code: row["Material Capa 4"], micron: row["Micraje Capa 4"] },
  ].filter((m) => m.code);

  const errors: string[] = [];

  if (!classification) errors.push("Clasificación obligatoria");
  const normalizedClassification = normalizeProductClassificationToCatalog(classification);
  if (normalizedClassification !== "Producto Nuevo" && normalizedClassification !== "Producto Modificado") {
    errors.push("Clasificación inválida (debe ser Producto Nuevo o Producto Modificado)");
  }

  if (!modification) errors.push("Modificación obligatoria");
  if (modification && normalizedClassification) {
    const validModifications = getActiveModificationOptionsByClassification(normalizedClassification);
    const modValid = validModifications.some((m) => normalizeText(m.label) === normalizeText(modification));
    if (!modValid) errors.push(`Modificación inválida para ${normalizedClassification}`);
  }

  if (!productName) errors.push("Nombre del Producto obligatorio");
  if (!volume) errors.push("Volumen Referencial obligatorio");
  if (!unit) errors.push("Unidad obligatoria");
  const unitOptions = getActiveUnitMeasureOptions();
  if (unit && !unitOptions.some((u) => normalizeText(u.label) === normalizeText(unit))) {
    errors.push("Unidad no válida");
  }
  if (!description) errors.push("Descripción de necesidad obligatoria");

  if (normalizedClassification === "Producto Modificado") {
    if (!currentSkuCode) errors.push("SKU Actual / Base requerido para Producto Modificado");
    if (!currentSkuVersion) errors.push("Versión SKU Actual requerida para Producto Modificado");
  }

  for (const mat of importMaterials) {
    if (mat.code && !materialsCodes.includes(mat.code)) {
      errors.push(`Material "${mat.code}" no válido`);
    }
  }

  return {
    rowNum: index + 1,
    classification,
    modification,
    currentSkuCode: currentSkuCode || undefined,
    currentSkuVersion: currentSkuVersion || undefined,
    productName,
    volume,
    unit,
    description,
    materials: importMaterials,
    comments,
    validationStatus: errors.length > 0 ? "rejected" : "valid",
    validationMessage: errors.length > 0 ? errors.join("; ") : "Válido",
  };
};

export default function BulkProductImportModal({
  isOpen,
  onClose,
  onImportComplete,
  portfolioContext,
}: BulkProductImportModalProps) {
  const [step, setStep] = useState<Step>("context");
  const [selectedClient, setSelectedClient] = useState<{ code: string; name: string } | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioRecord | null>(null);
  const [uploadedRows, setUploadedRows] = useState<ImportRow[]>([]);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    valid: number;
    observed: number;
    rejected: number;
    created: number;
  } | null>(null);

  const materialOptions = useMemo(() => getMaterialOptions(), []);
  const unitOptions = useMemo(() => getActiveUnitMeasureOptions(), []);

  const portfolioMatches = useMemo(() => {
    if (!selectedClient) return [];
    const allPortfolios = portfolioStorage.getPortfolioDisplayRecords();
    return allPortfolios.filter((p) => {
      const pClientCode = normalizeText(getRecordValue(p, ["clientCode", "codigoCliente", "cli"]));
      const pClientName = normalizeText(getClientName(p));
      const selectedCode = normalizeText(selectedClient.code);
      const selectedName = normalizeText(selectedClient.name);
      return (selectedCode && pClientCode === selectedCode) || (selectedName && pClientName === selectedName);
    });
  }, [selectedClient]);

  const portfolioInheritance = useMemo(() => {
    if (!selectedPortfolio) return null;
    return {
      portfolio: getPortfolioCode(selectedPortfolio),
      cliente: getClientName(selectedPortfolio),
      planta: getRecordValue(selectedPortfolio, ["plantaName", "planta", "pl"]),
      ejecutivo: getRecordValue(selectedPortfolio, ["ejecutivoName"]),
      envoltura: getRecordValue(selectedPortfolio, ["envoltura", "env"]),
      usoFinal: getRecordValue(selectedPortfolio, ["usoFinal", "uf"]),
      segmento: getRecordValue(selectedPortfolio, ["segmento", "seg"]),
      subSegmento: getRecordValue(selectedPortfolio, ["subSegmento", "subseg"]),
      sector: getRecordValue(selectedPortfolio, ["sector"]),
      afMarketId: getRecordValue(selectedPortfolio, ["afMarketId", "af"]),
      maquinaEnvasado: getRecordValue(selectedPortfolio, ["maquinaCliente"]),
    };
  }, [selectedPortfolio]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        const validated = rows.map((row, idx) => validateRow(row, idx, materialOptions));
        setUploadedRows(validated);
        setStep("preview");
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error al leer el archivo");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    const validRows = uploadedRows.filter((r) => r.validationStatus === "valid");
    let created = 0;

    try {
      for (const row of validRows) {
        if (!selectedPortfolio) break;

        const normalizedClassification = normalizeProductClassificationToCatalog(row.classification);
        const isNuevo = normalizedClassification === "Producto Nuevo";

        let skuCode = "";
        if (isNuevo) {
          const skuResult = generateSKUForNewRequest("Producto Nuevo", []);
          skuCode = skuResult.skuCode;
        } else if (row.currentSkuCode && row.currentSkuVersion) {
          const skuResult = generateSKUForNewRequest("Producto Modificado", [], row.currentSkuCode);
          skuCode = skuResult.skuCode;
        }

        const edagCode = generateNewEDAG(1);
        const emCode = generateNewEM(1);

        const materialCount = row.materials.filter((m) => m.code).length;
        let structureType = "Monocapa";
        if (materialCount === 2) structureType = "Bilaminado";
        else if (materialCount === 3) structureType = "Trilaminado";
        else if (materialCount === 4) structureType = "Tetralaminado";

        const technicalName = [
          row.productName,
          row.volume,
          row.unit,
          portfolioInheritance?.envoltura,
          ...row.materials.map((m) => m.code).filter(Boolean),
        ]
          .filter(Boolean)
          .join(" - ");

        const projectData = createProjectFromPortfolio({
          portfolio: selectedPortfolio,
          initialData: {
            clasificacion: row.classification,
            tipoProyecto: row.modification,
            motivoModificacion: row.modification,
            licitacion: "No" as const,
            projectName: row.productName,
            volumenCantidadReferencial: row.volume,
            unidad: row.unit,
            descripcionNecesidad: row.description,
            comentarios: row.comments,
            estructuraCalculada: structureType,
            nombreCalculado: technicalName,
            layer1Material: row.materials[0]?.code || "",
            layer1Micron: row.materials[0]?.micron || "",
            layer2Material: row.materials[1]?.code || "",
            layer2Micron: row.materials[1]?.micron || "",
            layer3Material: row.materials[2]?.code || "",
            layer3Micron: row.materials[2]?.micron || "",
            layer4Material: row.materials[3]?.code || "",
            layer4Micron: row.materials[3]?.micron || "",
          },
        });

        // Store the generated SKU code
        if (skuCode) {
          projectData.skuCode = skuCode;
          projectData.currentSkuCode = skuCode;
        }

        saveProjectRecord(projectData);
        created++;
      }

      setImportSummary({
        total: uploadedRows.length,
        valid: validRows.length,
        observed: uploadedRows.filter((r) => r.validationStatus === "observed").length,
        rejected: uploadedRows.filter((r) => r.validationStatus === "rejected").length,
        created,
      });

      setStep("complete");
    } catch (error) {
      console.error("Error importing products:", error);
      alert("Error al importar productos");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Importar Productos</h2>
            <p className="text-sm text-slate-500 mt-1">Carga masiva de productos desde plantilla</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "context" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Cliente *</label>
                <ClientSearch value={selectedClient?.name || ""} onChange={(value) => {
                  const parts = value.split(" - ");
                  setSelectedClient({
                    code: parts[0]?.trim() || "",
                    name: parts.slice(1).join(" - ").trim() || value,
                  });
                }} />
              </div>

              {selectedClient && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Portafolio Base *</label>
                  <select
                    value={selectedPortfolio ? getPortfolioCode(selectedPortfolio) : ""}
                    onChange={(e) => {
                      const portfolio = portfolioMatches.find((p) => getPortfolioCode(p) === e.target.value);
                      setSelectedPortfolio(portfolio || null);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar portafolio...</option>
                    {portfolioMatches.map((p) => (
                      <option key={getPortfolioCode(p)} value={getPortfolioCode(p)}>
                        {getPortfolioCode(p)} - {getPortfolioName(p)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {portfolioInheritance && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Herencia del Portafolio</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <PreviewRow label="Portafolio" value={portfolioInheritance.portfolio} />
                    <PreviewRow label="Cliente" value={portfolioInheritance.cliente} />
                    <PreviewRow label="Planta" value={portfolioInheritance.planta} />
                    <PreviewRow label="Ejecutivo" value={portfolioInheritance.ejecutivo} />
                    <PreviewRow label="Envoltura" value={portfolioInheritance.envoltura} />
                    <PreviewRow label="Uso Final" value={portfolioInheritance.usoFinal} />
                    <PreviewRow label="Segmento" value={portfolioInheritance.segmento} />
                    <PreviewRow label="Sub-segmento" value={portfolioInheritance.subSegmento} />
                    <PreviewRow label="Sector" value={portfolioInheritance.sector} />
                    <PreviewRow label="AFMarketID" value={portfolioInheritance.afMarketId} />
                    <PreviewRow label="Máquina" value={portfolioInheritance.maquinaEnvasado} />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "template" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                La plantilla contiene las columnas necesarias para importar productos masivamente.
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-mono text-slate-700 break-words">
                  {TEMPLATE_COLUMNS.join(" | ")}
                </p>
              </div>
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                  <p className="font-semibold text-slate-900">Haz clic para subir archivo</p>
                  <p className="text-xs text-slate-500">Soporta .xlsx, .xls o .csv</p>
                </label>
              </div>
            </div>
          )}

          {step === "preview" && uploadedRows.length > 0 && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-900">Fila</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-900">Clasificación</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-900">Modificación</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-900">Producto</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-900">Estado</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-900">Mensaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedRows.map((row) => (
                      <tr key={row.rowNum} className="border-t border-slate-200">
                        <td className="px-3 py-2">{row.rowNum}</td>
                        <td className="px-3 py-2">{row.classification}</td>
                        <td className="px-3 py-2">{row.modification}</td>
                        <td className="px-3 py-2">{row.productName}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              row.validationStatus === "valid"
                                ? "bg-green-100 text-green-700"
                                : row.validationStatus === "observed"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.validationStatus === "valid" && <CheckCircle size={14} />}
                            {row.validationStatus === "observed" && <AlertCircle size={14} />}
                            {row.validationStatus === "rejected" && <XCircle size={14} />}
                            {row.validationStatus}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">{row.validationMessage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === "complete" && importSummary && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Importación Completada</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Total filas leídas:</span> {importSummary.total}
                  </p>
                  <p>
                    <span className="font-medium text-green-700">Filas válidas:</span> {importSummary.valid}
                  </p>
                  <p>
                    <span className="font-medium text-yellow-700">Filas observadas:</span> {importSummary.observed}
                  </p>
                  <p>
                    <span className="font-medium text-red-700">Filas rechazadas:</span> {importSummary.rejected}
                  </p>
                  <p>
                    <span className="font-medium text-blue-700">Productos creados:</span> {importSummary.created}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {step === "context" && "Paso 1 de 5: Selección de contexto"}
            {step === "template" && "Paso 2 de 5: Plantilla"}
            {step === "upload" && "Paso 3 de 5: Carga de archivo"}
            {step === "preview" && "Paso 4 de 5: Validación"}
            {step === "complete" && "Paso 5 de 5: Completado"}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>

            {step === "context" && (
              <Button
                onClick={() => setStep("template")}
                disabled={!selectedPortfolio}
              >
                Siguiente <ChevronRight size={16} />
              </Button>
            )}

            {step === "template" && (
              <>
                <Button variant="secondary" onClick={() => setStep("context")}>
                  Atrás
                </Button>
                <Button onClick={generateTemplate}>
                  <Download size={16} /> Descargar plantilla
                </Button>
                <Button onClick={() => setStep("upload")}>
                  Siguiente <ChevronRight size={16} />
                </Button>
              </>
            )}

            {step === "upload" && (
              <>
                <Button variant="secondary" onClick={() => setStep("template")}>
                  Atrás
                </Button>
              </>
            )}

            {step === "preview" && uploadedRows.length > 0 && (
              <>
                <Button variant="secondary" onClick={() => setStep("upload")}>
                  Atrás
                </Button>
                <Button onClick={handleImport} disabled={uploadedRows.filter((r) => r.validationStatus === "valid").length === 0}>
                  Importar filas válidas
                </Button>
              </>
            )}

            {step === "complete" && (
              <Button
                onClick={() => {
                  onClose();
                  onImportComplete?.();
                }}
              >
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

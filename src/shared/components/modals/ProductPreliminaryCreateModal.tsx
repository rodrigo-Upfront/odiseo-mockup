import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";

import type { PortfolioRecord } from "../../data/portfolioStorage";
import type {
  ProductPreliminaryRecord,
  ProductRequestReason,
  ProductCausal,
  ResultOdiseo,
  ValidationRoute,
} from "../../data/productPreliminaryTypes";

import {
  createProductPreliminaryRecord,
  getProductPreliminaryRecords,
} from "../../data/productPreliminaryStorage";

import {
  PRODUCT_REQUEST_REASONS,
  getCausalsByReason,
  getReasonHelpText,
  getCausalHelpText,
} from "../../data/productCausalRules";

import {
  UNITS_OF_MEASURE,
  UNIT_LABELS,
} from "../../data/unitOfMeasureStorage";

import { getPortfolioByCode } from "../../data/portfolioStorage";

import FormInput from "../forms/FormInput";
import FormSelect from "../forms/FormSelect";
import Button from "../ui/Button";
import PreviewRow from "../display/PreviewRow";
import PortfolioSearch from "../forms/PortfolioSearch";

interface ProductPreliminaryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: (product: ProductPreliminaryRecord) => void;
  portfolio?: PortfolioRecord | null;
  initialPortfolioCode?: string;
}

type FormData = {
  requestReason: ProductRequestReason | "";
  causal: ProductCausal | "";
  commercialName: string;
  materialsList: string;
  hasSpecialDesign: "Sí" | "No" | "";
  capacityValue: string;
  capacityUnit: string;
  assignedProjectCode: string;
};

type SelectOption = {
  value: string;
  label: string;
};

function getPortfolioValue(
  portfolio: unknown,
  keys: string[],
  fallback = ""
): string {
  const record = portfolio as Record<string, unknown>;

  for (const key of keys) {
    const value = record?.[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }

  return fallback;
}

function parseMaterials(materialsList: string): string[] {
  return materialsList
    .split(/[,;/]/)
    .map((material) => material.trim())
    .filter(Boolean);
}

function normalizeSearch(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function addGraphicArtsRoute(route: ValidationRoute): ValidationRoute {
  if (route === "SIN_VALIDACION") return "AG";
  if (route === "RD_DESARROLLO") return "AG_RD_DESARROLLO";
  if (route === "RD_AREA_TECNICA") return "AG_RD_AREA_TECNICA";

  return route;
}

function resolveInitialResultOdiseo(
  requestReason: ProductRequestReason,
  causal: ProductCausal
): ResultOdiseo {
  if (requestReason === "Portafolio estándar") {
    return "Sin cambio de SKU";
  }

  if (
    requestReason === "ICO / BCP" &&
    causal === "Mismo producto, misma especificación"
  ) {
    return "Sin cambio de SKU";
  }

  if (causal === "Cambia diseño") {
    return "Versiona producto existente";
  }

  if (causal === "Nuevo equipamiento / proceso / temperatura") {
    return "Sin cambio de SKU";
  }

  if (
    causal === "Modifica dimensiones" ||
    causal === "Modifica propiedades" ||
    causal === "Cambia materia prima" ||
    causal === "Cambio de insumo no homologado"
  ) {
    return "Condicionado";
  }

  return "Nuevo SKU sugerido";
}

function resolveInitialValidationRoute(
  requestReason: ProductRequestReason,
  causal: ProductCausal,
  hasSpecialDesign: "Sí" | "No"
): ValidationRoute {
  let route: ValidationRoute = "SIN_VALIDACION";

  if (requestReason === "Producto nuevo") {
    if (
      causal === "Nueva estructura" ||
      causal === "Nuevos insumos" ||
      causal === "Nuevo formato de envasado"
    ) {
      route = "RD_DESARROLLO";
    }

    if (causal === "Nuevo diseño") {
      route = "AG";
    }
  }

  if (requestReason === "Producto modificado") {
    if (causal === "Cambia diseño") {
      route = "AG";
    }

    if (
      causal === "Nuevo equipamiento / proceso / temperatura" ||
      causal === "Modifica dimensiones" ||
      causal === "Modifica propiedades" ||
      causal === "Cambia estructura" ||
      causal === "Cambia materia prima"
    ) {
      route = "RD_AREA_TECNICA";
    }
  }

  if (requestReason === "Extensión de línea") {
    if (causal === "Misma estructura") {
      route = "SIN_VALIDACION";
    }

    if (causal === "Cambia dimensión fuera de tolerancia") {
      route = "RD_AREA_TECNICA";
    }

    if (causal === "Cambia diseño por variante") {
      route = "AG";
    }
  }

  if (requestReason === "Portafolio estándar") {
    route = "SIN_VALIDACION";
  }

  if (requestReason === "ICO / BCP") {
    if (causal === "Mismo producto, misma especificación") {
      route = "SIN_VALIDACION";
    }

    if (causal === "Cambio de insumo no homologado") {
      route = "RD_AREA_TECNICA";
    }
  }

  if (hasSpecialDesign === "Sí") {
    route = addGraphicArtsRoute(route);
  }

  return route;
}

function unitOptions(): SelectOption[] {
  return UNITS_OF_MEASURE.map((unit) => ({
    value: unit,
    label: UNIT_LABELS[unit as keyof typeof UNIT_LABELS] || unit,
  }));
}

function InfoTooltipLabel({
  label,
  tooltip,
  result,
}: {
  label: string;
  tooltip?: string;
  result?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    transform?: string;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const hasContent = Boolean(tooltip || result);

  const showTooltip = () => {
    if (!buttonRef.current || !hasContent) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 288;
    const safeLeft = Math.min(
      Math.max(12, rect.left - 8),
      window.innerWidth - tooltipWidth - 12
    );

    const desiredTop = rect.top - 8;
    const isTooHigh = desiredTop < 96;

    setPosition({
      left: safeLeft,
      top: isTooHigh ? rect.bottom + 8 : desiredTop,
      transform: isTooHigh ? undefined : "translateY(-100%)",
    });

    setOpen(true);
  };

  const hideTooltip = () => {
    setOpen(false);
  };

  return (
    <div className="mb-1 flex items-center gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </span>

      {hasContent && (
        <button
          ref={buttonRef}
          type="button"
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none"
          aria-label={`Información de ${label}`}
        >
          <Info size={13} />
        </button>
      )}

      {open && position && (
        <div
          className="fixed z-[9999] w-72 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs normal-case tracking-normal text-slate-700 shadow-xl"
          style={{
            left: position.left,
            top: position.top,
            transform: position.transform,
          }}
        >
          {tooltip && <p>{tooltip}</p>}

          {result && (
            <p className="mt-1 border-t border-slate-100 pt-1">
              <span className="font-semibold text-slate-900">
                Resultado ODISEO:
              </span>{" "}
              {result}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SelectBox({
  label,
  tooltip,
  result,
  value,
  options,
  onChange,
  error,
  disabled,
}: {
  label: string;
  tooltip?: string;
  result?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <InfoTooltipLabel label={label} tooltip={tooltip} result={result} />

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 transition focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-brand-primary focus:ring-brand-primary"
        }`}
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ProductPreliminaryCreateModal({
  isOpen,
  onClose,
  onProductCreated,
  portfolio,
  initialPortfolioCode,
}: ProductPreliminaryCreateModalProps) {
  const defaultUnit = UNITS_OF_MEASURE[0] || "";

  const isPortfolioLocked = Boolean(portfolio || initialPortfolioCode);

  const fixedPortfolioCode = useMemo(() => {
    if (initialPortfolioCode) return initialPortfolioCode;
    if (portfolio) return getPortfolioValue(portfolio, ["codigo", "code", "id"]);
    return "";
  }, [initialPortfolioCode, portfolio]);

  const [selectedPortfolioCode, setSelectedPortfolioCode] = useState(fixedPortfolioCode);

  const selectedPortfolio = useMemo(() => {
    if (portfolio) return portfolio;
    return selectedPortfolioCode ? getPortfolioByCode(selectedPortfolioCode) : null;
  }, [portfolio, selectedPortfolioCode]);

  const [form, setForm] = useState<FormData>({
    requestReason: "",
    causal: "",
    commercialName: "",
    materialsList: "",
    hasSpecialDesign: "",
    capacityValue: "",
    capacityUnit: defaultUnit,
    assignedProjectCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPortfolioCode(fixedPortfolioCode);
      setForm({
        requestReason: "",
        causal: "",
        commercialName: "",
        materialsList: "",
        hasSpecialDesign: "",
        capacityValue: "",
        capacityUnit: defaultUnit,
        assignedProjectCode: "",
      });
      setErrors({});
      setShowProductSuggestions(false);
    }
  }, [isOpen, fixedPortfolioCode, defaultUnit]);

  const portfolioCode = getPortfolioValue(selectedPortfolio, ["codigo", "code", "id"]);
  const portfolioName = getPortfolioValue(selectedPortfolio, [
    "nom",
    "name",
    "portfolioName",
    "nombre",
  ]);
  const clientName = getPortfolioValue(selectedPortfolio, [
    "clientName",
    "cli",
    "cliente",
  ]);
  const plantName = getPortfolioValue(selectedPortfolio, [
    "plantaName",
    "pl",
    "plantName",
  ]);
  const executiveName = getPortfolioValue(selectedPortfolio, [
    "ejecutivoName",
    "ej",
    "executiveName",
  ]);
  const wrappingName = getPortfolioValue(selectedPortfolio, [
    "envoltura",
    "env",
    "wrappingName",
  ]);
  const useFinalName = getPortfolioValue(selectedPortfolio, [
    "usoFinal",
    "uf",
    "useFinalName",
  ]);
  const packingMachineName = getPortfolioValue(selectedPortfolio, [
    "maquinaCliente",
    "maq",
    "packingMachineName",
  ]);

  const availableCausals = useMemo(() => {
    return form.requestReason ? getCausalsByReason(form.requestReason) : [];
  }, [form.requestReason]);

  const materials = useMemo(() => {
    return parseMaterials(form.materialsList);
  }, [form.materialsList]);

  const structureSummary = materials.join(" / ");
  const unitSelectOptions = useMemo(() => unitOptions(), []);

  const existingProductSuggestions = useMemo(() => {
    const term = normalizeSearch(form.commercialName);

    if (term.length < 2) return [];

    const currentClient = normalizeSearch(clientName);
    const currentWrapping = normalizeSearch(wrappingName);

    return getProductPreliminaryRecords()
      .filter((product) => {
        const productName = normalizeSearch(product.commercialName);
        const calculatedName = normalizeSearch(product.calculatedName);
        const productClient = normalizeSearch(product.clientName);
        const productWrapping = normalizeSearch(product.wrappingName);

        const sameClient = !currentClient || productClient === currentClient;
        const sameWrapping =
          !currentWrapping || productWrapping === currentWrapping;

        return (
          sameClient &&
          sameWrapping &&
          (productName.includes(term) || calculatedName.includes(term))
        );
      })
      .slice(0, 8);
  }, [form.commercialName, clientName, wrappingName]);

  const calculateProductName = (): string => {
    const commercialName = form.commercialName.trim();
    const capacityValue = form.capacityValue.trim();
    const capacityUnit = form.capacityUnit.trim();

    const name = [commercialName, capacityValue, capacityUnit]
      .filter(Boolean)
      .join(" ");

    return name || "Producto preliminar";
  };

  const handleReasonChange = (value: ProductRequestReason | "") => {
    setForm((prev) => ({
      ...prev,
      requestReason: value,
      causal: "",
    }));

    setErrors((prev) => ({
      ...prev,
      requestReason: "",
      causal: "",
    }));
  };

  useEffect(() => {
    if (!form.requestReason || !form.causal) return;

    const allowed = getCausalsByReason(form.requestReason);

    if (!allowed.includes(form.causal as ProductCausal)) {
      setForm((prev) => ({
        ...prev,
        causal: "",
      }));
    }
  }, [form.requestReason, form.causal]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPortfolio || !portfolioCode) {
      newErrors.portfolioCode = "Selecciona un portafolio base.";
    }

    if (!form.requestReason) {
      newErrors.requestReason = "Motivo es requerido.";
    }

    if (!form.causal) {
      newErrors.causal = "Causal es requerida.";
    }

    if (!form.commercialName.trim()) {
      newErrors.commercialName = "Nombre comercial es requerido.";
    }

    if (!form.capacityValue.trim()) {
      newErrors.capacityValue = "Contenido es requerido.";
    }

    if (!form.capacityUnit.trim()) {
      newErrors.capacityUnit = "Unidad de contenido es requerida.";
    }

    if (materials.length === 0) {
      newErrors.materialsList = "Debe registrar al menos un material.";
    }

    if (form.hasSpecialDesign === "") {
      newErrors.hasSpecialDesign = "Diseño especial es requerido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const layers = materials.map((material, index) => ({
      layerNumber: index + 1,
      material,
      materialGroup: undefined,
      micron: undefined,
      grammage: undefined,
    }));

    const requestReason = form.requestReason as ProductRequestReason;
    const causal = form.causal as ProductCausal;
    const hasSpecialDesign = form.hasSpecialDesign as "Sí" | "No";

    const resultOdiseo = resolveInitialResultOdiseo(requestReason, causal);
    const validationRoute = resolveInitialValidationRoute(
      requestReason,
      causal,
      hasSpecialDesign
    );

    const newProduct = createProductPreliminaryRecord({
      portfolioCode,
      status: "Pendiente referencia",

      requestReason,
      causal,

      commercialName: form.commercialName.trim(),
      calculatedName: calculateProductName(),

      clientName,
      wrappingName,
      useFinalName,
      packingMachineName,
      plantName,

      materials,
      layers,
      structureSummary,
      layerCount: materials.length,

      hasSpecialDesign,

      capacityValue: form.capacityValue.trim(),
      capacityUnit: form.capacityUnit,
      assignedProjectCode: form.assignedProjectCode.trim(),

      resultOdiseo,
      validationRoute,
    });

    onProductCreated?.(newProduct);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 py-10">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Crear Producto Preliminar
            </h3>
            <p className="text-sm text-slate-500">
              Completa la información mínima para buscar una referencia y preparar
              el producto para cotización.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              {!isPortfolioLocked && (
                <section>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Portafolio Base
                  </h4>
                  <PortfolioSearch
                    value={selectedPortfolioCode}
                    onChange={setSelectedPortfolioCode}
                    label="Portafolio base *"
                    error={errors.portfolioCode}
                  />
                </section>
              )}

              <section>
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  Clasificación
                </h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <SelectBox
                    label="Motivo *"
                    tooltip={getReasonHelpText(form.requestReason)}
                    value={form.requestReason}
                    onChange={(value) =>
                      handleReasonChange(value as ProductRequestReason | "")
                    }
                    options={[
                      { value: "", label: "Seleccionar..." },
                      ...PRODUCT_REQUEST_REASONS.map((reason) => ({
                        value: reason,
                        label: reason,
                      })),
                    ]}
                    error={errors.requestReason}
                  />

                  <SelectBox
                    label="Causal *"
                    tooltip={getCausalHelpText(form.causal)}
                    value={form.causal}
                    onChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        causal: value as ProductCausal | "",
                      }));
                      setErrors((prev) => ({ ...prev, causal: "" }));
                    }}
                    options={[
                      {
                        value: "",
                        label: form.requestReason
                          ? "Seleccionar..."
                          : "Seleccione primero un motivo",
                      },
                      ...availableCausals.map((causal) => ({
                        value: causal,
                        label: causal,
                      })),
                    ]}
                    error={errors.causal}
                    disabled={!form.requestReason}
                  />
                </div>
              </section>

              <section>
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  Producto Comercial
                </h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr]">
                  <div className="relative">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Nombre *
                    </label>

                    <input
                      value={form.commercialName}
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          commercialName: event.target.value,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          commercialName: "",
                        }));
                        setShowProductSuggestions(true);
                      }}
                      onFocus={() => setShowProductSuggestions(true)}
                      onBlur={() => {
                        window.setTimeout(
                          () => setShowProductSuggestions(false),
                          150
                        );
                      }}
                      placeholder="Buscar o escribir. Ej: Salsa BBQ"
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 transition focus:outline-none focus:ring-1 ${
                        errors.commercialName
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:border-brand-primary focus:ring-brand-primary"
                      }`}
                    />

                    {errors.commercialName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.commercialName}
                      </p>
                    )}

                    {showProductSuggestions &&
                      existingProductSuggestions.length > 0 && (
                        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                          {existingProductSuggestions.map((product) => (
                            <button
                              key={product.productCode}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  commercialName: product.commercialName,
                                  capacityValue:
                                    product.capacityValue || prev.capacityValue,
                                  capacityUnit:
                                    product.capacityUnit || prev.capacityUnit,
                                  materialsList:
                                    product.materials?.length > 0
                                      ? product.materials.join(", ")
                                      : prev.materialsList,
                                }));

                                setErrors((prev) => ({
                                  ...prev,
                                  commercialName: "",
                                  capacityValue: "",
                                  capacityUnit: "",
                                  materialsList: "",
                                }));

                                setShowProductSuggestions(false);
                              }}
                              className="w-full border-b border-slate-100 px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                            >
                              <div className="font-semibold text-slate-900">
                                {product.calculatedName ||
                                  product.commercialName}
                              </div>

                              <div className="text-xs text-slate-500">
                                {product.productCode} ·{" "}
                                {product.wrappingName || "Sin envoltura"} ·{" "}
                                {product.structureSummary || "Sin estructura"}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>

                  <FormInput
                    label="Contenido *"
                    value={form.capacityValue}
                    onChange={(value) => {
                      setForm((prev) => ({ ...prev, capacityValue: value }));
                      setErrors((prev) => ({
                        ...prev,
                        capacityValue: "",
                      }));
                    }}
                    placeholder="Ej: 250"
                    error={errors.capacityValue}
                  />

                  <FormSelect
                    label="Unidad *"
                    value={form.capacityUnit}
                    onChange={(value) => {
                      setForm((prev) => ({ ...prev, capacityUnit: value }));
                      setErrors((prev) => ({
                        ...prev,
                        capacityUnit: "",
                      }));
                    }}
                    options={unitSelectOptions}
                    error={errors.capacityUnit}
                  />
                </div>
              </section>

              <section>
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  Estructura del producto
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Materiales*
                    </label>

                    <textarea
                      value={form.materialsList}
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          materialsList: event.target.value,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          materialsList: "",
                        }));
                      }}
                      placeholder="Ej: PET, BOPP, PE"
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 transition focus:outline-none focus:ring-1 ${
                        errors.materialsList
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:border-brand-primary focus:ring-brand-primary"
                      }`}
                      rows={2}
                    />

                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span
                        className={
                          errors.materialsList
                            ? "text-red-600"
                            : "text-slate-500"
                        }
                      >
                        {errors.materialsList ||
                          `${materials.length} ${
                            materials.length === 1 ? "capa" : "capas"
                          }`}
                      </span>

                      {structureSummary && (
                        <span className="font-medium text-slate-500">
                          {structureSummary}
                        </span>
                      )}
                    </div>
                  </div>

                  <FormSelect
                    label="¿Diseño Especial? *"
                    value={form.hasSpecialDesign}
                    onChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        hasSpecialDesign: value as "Sí" | "No" | "",
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        hasSpecialDesign: "",
                      }));
                    }}
                    options={[
                      { value: "", label: "Seleccionar..." },
                      { value: "Sí", label: "Sí" },
                      { value: "No", label: "No" },
                    ]}
                    error={errors.hasSpecialDesign}
                  />

                  <FormInput
                    label="Proyecto Asignado"
                    value={form.assignedProjectCode}
                    onChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        assignedProjectCode: value,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        assignedProjectCode: "",
                      }));
                    }}
                    placeholder="Ej: PRJ-001"
                    error={errors.assignedProjectCode}
                  />
                </div>
              </section>
            </div>

            <aside className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
              <h4 className="mb-4 border-b border-brand-primary/10 pb-2 font-bold text-brand-primary">
                Herencia del Portafolio
              </h4>

              {isPortfolioLocked && selectedPortfolio ? (
                <div className="rounded-lg border border-blue-200 bg-white p-3 mb-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {portfolioCode} - {portfolioName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {clientName && `Cliente: ${clientName}`}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                <PreviewRow label="Portafolio" value={portfolioCode} />
                <PreviewRow label="Cliente" value={clientName} />
                <PreviewRow label="Planta" value={plantName} />
                <PreviewRow label="Ejecutivo Comercial" value={executiveName} />
                <PreviewRow label="Envoltura" value={wrappingName} />
                <PreviewRow label="Uso Final" value={useFinalName} />
                <PreviewRow
                  label="Máquina / Envasado"
                  value={packingMachineName}
                />
                <PreviewRow
                  label="Sector"
                  value={getPortfolioValue(selectedPortfolio, ["sector"])}
                />
                <PreviewRow
                  label="Segmento"
                  value={getPortfolioValue(selectedPortfolio, ["segmento", "seg"])}
                />
                <PreviewRow
                  label="Sub-segmento"
                  value={getPortfolioValue(selectedPortfolio, [
                    "subSegmento",
                    "subseg",
                  ])}
                />
                <PreviewRow
                  label="AFMarketID"
                  value={getPortfolioValue(selectedPortfolio, ["afMarketId", "af"])}
                />
              </div>

              <div className="mt-6 border-t border-blue-100 pt-4">
                <h5 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Nombre Calculado
                </h5>

                <div className="rounded-lg border border-blue-200 bg-white p-3">
                  <p className="line-clamp-3 text-sm font-semibold text-slate-900">
                    {calculateProductName()}
                  </p>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Regla: nombre comercial + contenido + unidad.
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-blue-100 bg-white p-3">
                <h5 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Resultado inicial ODISEO
                </h5>

                <p className="text-xs text-slate-600">
                  El producto quedará como{" "}
                  <strong>Pendiente referencia</strong>. Luego, ODISEO buscará
                  proyectos aprobados similares para asignar una referencia.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={
              !selectedPortfolio ||
              !form.commercialName.trim() ||
              !form.requestReason ||
              !form.causal ||
              !form.capacityValue.trim()
            }
          >
            Crear Producto
          </Button>
        </div>
      </div>
    </div>
  );
if (!isOpen) return null;
  return createPortal(modalContent, document.body);
}
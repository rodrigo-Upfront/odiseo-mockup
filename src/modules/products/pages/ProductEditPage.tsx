import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { useLayout } from "../../../components/layout/LayoutContext";
import { getPortfolioDisplayRecords } from "../../../shared/data/portfolioStorage";
import {
  getProjectByCode,
  getProjectRecords,
  updateProjectRecord,
  type ProjectRecord,
  type BooleanLike,
  type YesNoPending,
} from "../../../shared/data/projectStorage";
import {
  computeProjectPreparationStatus,
  normalizeProjectStatus,
  normalizeProjectWorkflow,
  hasAnyEditableSection2To6Data,
  resolveProjectStage,
  requiresManualGraphicArtsValidation,
  resolveTechnicalSubAreaBySubclassification,
  resolveTechnicalSubAreaByProjectType,
  getProductOdiseoStatus,
} from "../../../shared/data/projectWorkflow";
import { getActiveExecutiveRecords } from "../../../shared/data/executiveStorage";
import { getActiveUsers } from "../../../shared/data/userStorage";
import { isGenericPackingMachine } from "../../../shared/utils/validationUtils";
import {
  isGuidedFormatEnabled,
  calculateBolsaFormatPlan,
  calculateLaminaFormatPlan,
  isPouchWrapping,
  isBolsaWrapping,
  isLaminaWrapping,
  calculatePouchFormatPlan,
} from "../../../shared/data/formatPlanRules";
import { getCatalogOptions } from "../../../shared/catalogs";
import { PRODUCT_CATALOGS } from "../../../shared/data/productCatalogs";
import {
  getActiveProductClassificationOptions,
  getActiveModificationOptionsByClassification,
  normalizeProductClassificationToCatalog,
} from "../../../shared/data/productModificationCatalog";
import {
  getDimensionRestrictionsByFormat,
  formatDimensionRange,
  isDimensionValueInRange,
  normalizeFormatPlan,
  type DimensionRange,
} from "../../../shared/data/dimensionRestrictionRules";
import {
  getActiveUnitMeasureOptions,
  normalizeUnitMeasureCode,
} from "../../../shared/data/unitMeasureCatalog";
import {
  getActiveMaterialGroupOptions,
  getMaterialLayerOptionsByGroup,
  getMicronFrontendControl,
  resolveMaterialLayer,
  buildLayerTechnicalSnapshot,
  getAllMaterialLayerOptions,
  type MicronFrontendControl,
} from "../../../shared/data/productMaterialCatalog";
import { getSKUCycleLabel } from "../../../shared/utils/productCodeRules";

import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormSelect from "../../../shared/components/forms/FormSelect";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import FormActionButtons from "../../../shared/components/forms/FormActionButtons";
import PreviewRow from "../../../shared/components/display/PreviewRow";
import ProductOdiseoStatusBadge from "../../../shared/components/display/ProductOdiseoStatusBadge";
import CommercialExecutiveMultiSearch from "../../../shared/components/forms/CommercialExecutiveMultiSearch";
import ProjectPlansUploadSection from "../components/ProjectPlansUploadSection";
import CustomerTechnicalSpecUploadSection from "../components/CustomerTechnicalSpecUploadSection";
import DimensionalPlanPreview from "../components/DimensionalPlanPreview";
import RewindingDirectionSelector from "../components/RewindingDirectionSelector";

export type ProjectEditFormData = {
  code: string;
  status: string;
  portfolioCode: string;
  executiveId: string[];

  projectName: string;
  projectDescription: string;
  classification: string;
  subClassification: string;
  projectType: string;
  motivoModificacion: string;
  salesforceAction: string;

  designPlanType: string;
  designPlanComments: string;

  blueprintFormat: string;
  tipoPresentacionBolsa: string;
  tipoSelloBolsa: string;
  acabadoBolsa: string;
  tieneFuelleBolsa: string;
  tipoFuelleBolsa: string;
  tipoFormatoLamina: string;
  tipoFamiliaPouch: string;
  tipoStandUpPouch: string;
  formaDoyPackPouch: string;
  tipoFuelleStandUpPouch: string;
  cantidadSellosPouchPlano: string;
  tieneFuelleSelloCentralPouch: string;
  materialSelloCentralPouch: string;
  tipoSelloEnFuellePouch: string;

  estimatedVolume: string;
  unitOfMeasure: string;
  technicalApplication: string;
  portafolioEstandar: string;
  approvedProductCode: string;
  customerPackingCode: string;

  printClass: string;
  printType: string;
  printForm: string;
  designAreaWidth: string;
  designAreaHeight: string;
  coPrinting: string;
  codesToPrint: string;
  rewindingDirection: string;
  rewindingDirectionRef: string;
  hasPhotocell: string;
  photocellLocation: string;
  fr1Width: string;
  fr1Height: string;
  fr1MarginRight: string;
  fr1MarginBottom: string;
  fr1MarginLeft: string;
  fr1MarginTop: string;
  fr2Width: string;
  fr2Height: string;
  fr2MarginRight: string;
  fr2MarginBottom: string;
  fr2MarginLeft: string;
  fr2MarginTop: string;
  hasDesignPlan: string;
  hasEdagReference: string;
  referenceEdagCode: string;
  referenceEdagVersion: string;
  specialDesignSpecs: string;
  specialDesignComments: string;
  edagCode: string;
  edagVersion: string;

  colorObjectiveCode: string;
  colorObjective: string;
  colorObjectiveOther: string;
  pressApproverCode: string;
  pressApprover: string;
  alusaReferenceCode: string;
  designWorkInstructions: string;

  perimeterMm: string;
  dimensionCrossCheckStatus: string;
  perimeterValidationStatus: string;
  perimeterComment: string;

  hasPhotoregister1: string;
  hasPhotoregister2: string;

  hasReferenceStructure: string;
  referenceEmCode: string;
  referenceEmVersion: string;
  hasCustomerTechnicalSpec: string;
  customerTechnicalSpecAttachment: string;
  customerTechnicalSpecFiles: string[];
  customerTechnicalSpecComments: string;
  structureType: string;

  layer1MaterialGroup: string;
  layer1Material: string;
  layer1Micron: string;
  layer1Grammage: string;
  layer2MaterialGroup: string;
  layer2Material: string;
  layer2Micron: string;
  layer2Grammage: string;
  layer3MaterialGroup: string;
  layer3Material: string;
  layer3Micron: string;
  layer3Grammage: string;
  layer4MaterialGroup: string;
  layer4Material: string;
  layer4Micron: string;
  layer4Grammage: string;

  specialStructureSpecs: string;
  grammageTolerance: string;
  grammage: string;
  sampleRequest: string;

  width: string;
  length: string;
  repetition: string;
  doyPackBase: string;
  doyPackRepeticionExacta: string;
  toleranciaRepExactaDoyPack: string;
  toleranciaRepDoyPack: string;
  fuelleCerrado: string;
  selloAnchoLateral: string;
  gussetWidth: string;
  gussetType: string;

  hasMicroperforado: string;
  ladoMicroperforado: string;
  separacionPuas: string;
  distanciaLadoPouch: string;

  distanciaAbocaZipper: string;
  distanciaAbocaValvula: string;
  hasZipper: string;
  zipperType: string;
  hasTinTie: string;
  hasValve: string;
  valveType: string;
  hasRiñonera: string;

  hasWicket: string;
  wicketDiameter: string;
  wicketDistSuperior: string;
  wicketDistDerecho: string;

  hasWicketControl: string;
  wicketControlDiameter: string;
  wicketControlUbicacion: string;
  wicketControlDistSuperior: string;
  wicketControlDistDerecho: string;

  anchoSolapa: string;
  hasCortaAliviador: string;
  cortaAliviadorDistDerecho: string;
  hasDispensador: string;
  dispensadorDistIzquierdo: string;
  hasFotocelulaBolsaWicket: string;

  hasPrecorteWicket: string;
  precorteWicketLargo: string;
  precorteWicketUbicacion: string;
  precorteWicketDistDerecho: string;

  hasDieCutHandle: string;
  hasReinforcement: string;
  reinforcementThickness: string;
  reinforcementWidth: string;
  ladoCorteAngular: string;
  distanciaAbocaMuesca: string;
  hasRoundedCorners: string;
  roundedCornersType: string;
  hasNotch: string;
  distanciaAbocaPerforacion: string;
  hasPerforation: string;
  pouchPerforationType: string;
  bagPerforationType: string;
  perforationLocation: string;
  tipoPerfPouchSelloCentral: string;
  tipoPerfFuelleBolsaWicket: string;
  perforacionParaAire: string;
  perforacionFugaAire: string;
  distMargenSuperiorPerforacion: string;
  distFuellePerforacion: string;
  hasAngularCut: string;
  hasPreCut: string;
  preCutType: string;
  distanciaAbocaPrecorte: string;
  precutFuelleAbreFacil: string;
  precutFuelleA10mm: string;
  otherAccessories: string;

  materialPackaging: string;
  specialMaterialPackaging: string;
  exportProductPackaging: string;
  splices: string;

  saleType: string;
  incoterm: string;
  destinationCountry: string;
  targetPrice: string;
  currencyType: string;
  coreMaterial: string;
  coreDiameter: string;
  externalDiameter: string;
  externalVariationPlus: string;
  externalVariationMinus: string;
  maxRollWeight: string;
  customerAdditionalInfo: string;
  deliveryAddress: string;
  additionalComment: string;

  licitacion: string;
  designPlanFiles: string[];

  // SKU codes
  skuCode: string;
  currentSkuCode: string;
  productCode: string;
  skuSequence: string;
  skuLifecycleCode: string;
  skuVersion: string;
};

const YES_NO_OPTIONS = [
  { value: "Sí", label: "Sí" },
  { value: "No", label: "No" },
];

const COLOR_OBJECTIVE_OPTIONS = [
  {
    code: "1",
    value: "No existe objetivo trabajar a criterio",
    label: "No existe objetivo trabajar a criterio",
    catalogCode: "ODC",
  },
  {
    code: "2",
    value: "Muestra física",
    label: "Muestra física",
    catalogCode: "ODC",
  },
  {
    code: "3",
    value: "Color Pantone del archivo",
    label: "Color Pantone del archivo",
    catalogCode: "ODC",
  },
  {
    code: "4",
    value: "Producción de referencia",
    label: "Producción de referencia",
    catalogCode: "ODC",
  },
  {
    code: "5",
    value: "Otros",
    label: "Otros",
    catalogCode: "ODC",
  },
];

const PRESS_APPROVER_OPTIONS = [
  {
    code: "1",
    value: "Cliente",
    label: "Cliente",
    catalogCode: "APR",
  },
  {
    code: "2",
    value: "Supervisor",
    label: "Supervisor",
    catalogCode: "APR",
  },
  {
    code: "3",
    value: "Ejecutivo Comercial / Coordinador AAGG",
    label: "Ejecutivo Comercial / Coordinador AAGG",
    catalogCode: "APR",
  },
];

// MOT (Motivo de Modificación) - Configuración central que define qué campos se habilitan/bloquean
const MOT_FIELD_RULES: Record<string, {
  mode: "new" | "modified";
  enabledSections: string[];
  editableFieldGroups: string[];
  lockedFieldGroups: string[];
  requiresBaseProductAutofill: boolean;
}> = {
  "Nueva estructura": {
    mode: "new",
    enabledSections: ["producto", "diseno", "estructura", "dimensiones", "embalaje"],
    editableFieldGroups: ["productBase", "format", "structure", "dimensions", "packaging"],
    lockedFieldGroups: [],
    requiresBaseProductAutofill: false
  },
  "Nuevos insumos": {
    mode: "new",
    enabledSections: ["producto", "estructura", "dimensiones", "embalaje"],
    editableFieldGroups: ["productBase", "materials", "structure", "technicalComments", "sample"],
    lockedFieldGroups: [],
    requiresBaseProductAutofill: false
  },
  "Nuevo formato de envasado": {
    mode: "new",
    enabledSections: ["producto", "diseno", "estructura", "dimensiones", "embalaje"],
    editableFieldGroups: ["formatDecisionTree", "dimensions", "accessories", "packaging"],
    lockedFieldGroups: [],
    requiresBaseProductAutofill: false
  },
  "Nuevo diseño": {
    mode: "new",
    enabledSections: ["producto", "diseno", "estructura", "dimensiones", "embalaje"],
    editableFieldGroups: ["design", "printing", "edag", "photoregister", "rewinding", "photocell", "designPlans"],
    lockedFieldGroups: [],
    requiresBaseProductAutofill: false
  },
  "Nuevo equipamiento / proceso / temperatura": {
    mode: "modified",
    enabledSections: ["producto", "estructura", "dimensiones", "embalaje"],
    editableFieldGroups: ["process", "packingMachine", "technicalComments", "sample"],
    lockedFieldGroups: ["design", "structureBase"],
    requiresBaseProductAutofill: true
  },
  "Modifica dimensiones": {
    mode: "modified",
    enabledSections: ["producto", "estructura"],
    editableFieldGroups: ["dimensions", "perimeter", "dimensionValidation"],
    lockedFieldGroups: ["design", "materials", "packaging"],
    requiresBaseProductAutofill: true
  },
  "Modifica propiedades": {
    mode: "modified",
    enabledSections: ["producto", "estructura"],
    editableFieldGroups: ["properties", "grammage", "technicalComments", "sample"],
    lockedFieldGroups: ["design", "dimensions"],
    requiresBaseProductAutofill: true
  },
  "Cambia estructura": {
    mode: "modified",
    enabledSections: ["producto", "estructura"],
    editableFieldGroups: ["structure", "materials", "layers", "micron", "grammage"],
    lockedFieldGroups: ["design", "packaging"],
    requiresBaseProductAutofill: true
  },
  "Cambia materia prima": {
    mode: "modified",
    enabledSections: ["producto", "estructura"],
    editableFieldGroups: ["materials", "layers", "micron", "grammage"],
    lockedFieldGroups: ["design", "dimensions", "packaging"],
    requiresBaseProductAutofill: true
  },
  "Cambia diseño": {
    mode: "modified",
    enabledSections: ["producto", "diseno"],
    editableFieldGroups: ["design", "printing", "edag", "photoregister", "rewinding", "photocell", "designPlans"],
    lockedFieldGroups: ["structure", "materials", "dimensions"],
    requiresBaseProductAutofill: true
  },
  "Misma estructura": {
    mode: "modified",
    enabledSections: ["producto", "estructura"],
    editableFieldGroups: ["technicalComments"],
    lockedFieldGroups: ["structure", "materials", "layers", "dimensions", "design"],
    requiresBaseProductAutofill: true
  },
  "Cambia dimensión fuera de tolerancia": {
    mode: "modified",
    enabledSections: ["producto", "estructura"],
    editableFieldGroups: ["dimensions", "perimeter", "dimensionValidation", "designPlans"],
    lockedFieldGroups: ["materials"],
    requiresBaseProductAutofill: true
  },
  "Cambia diseño por variante": {
    mode: "modified",
    enabledSections: ["producto", "diseno"],
    editableFieldGroups: ["designVariant", "edag", "printing", "photoregister", "rewinding", "photocell"],
    lockedFieldGroups: ["structure", "materials", "dimensions"],
    requiresBaseProductAutofill: true
  },
  "Referencia aprobada sin cambios": {
    mode: "modified",
    enabledSections: ["producto", "diseno", "estructura", "embalaje"],
    editableFieldGroups: ["productBase", "comments"],
    lockedFieldGroups: ["design", "structure", "materials", "dimensions", "packaging"],
    requiresBaseProductAutofill: true
  },
  "Mismo producto, misma especificación": {
    mode: "modified",
    enabledSections: ["producto", "diseno", "estructura", "embalaje"],
    editableFieldGroups: ["productBase", "comments"],
    lockedFieldGroups: ["design", "structure", "materials", "dimensions", "packaging"],
    requiresBaseProductAutofill: true
  },
  "Cambio de insumo no homologado": {
    mode: "modified",
    enabledSections: ["producto", "estructura"],
    editableFieldGroups: ["materials", "inputs", "technicalComments", "sample", "validation"],
    lockedFieldGroups: ["design", "dimensions"],
    requiresBaseProductAutofill: true
  }
};

// Mapeo de campos a grupos de edición
const FIELD_TO_EDITABLE_GROUP: Record<string, string> = {
  projectName: "productBase",
  projectDescription: "productBase",
  portfolioCode: "productBase",
  executiveId: "productBase",
  customerAdditionalInfo: "productBase",
  additionalComment: "productBase",
  deliveryAddress: "productBase",
  blueprintFormat: "formatDecisionTree",
  tipoFormatoLamina: "formatDecisionTree",
  tipoPresentacionBolsa: "formatDecisionTree",
  tipoSelloBolsa: "formatDecisionTree",
  acabadoBolsa: "formatDecisionTree",
  tieneFuelleBolsa: "formatDecisionTree",
  tipoFuelleBolsa: "formatDecisionTree",
  tipoFamiliaPouch: "formatDecisionTree",
  tipoStandUpPouch: "formatDecisionTree",
  formaDoyPackPouch: "formatDecisionTree",
  tipoFuelleStandUpPouch: "formatDecisionTree",
  cantidadSellosPouchPlano: "formatDecisionTree",
  tieneFuelleSelloCentralPouch: "formatDecisionTree",
  materialSelloCentralPouch: "formatDecisionTree",
  tipoSelloEnFuellePouch: "formatDecisionTree",
  printClass: "design",
  printType: "design",
  printForm: "design",
  specialDesignSpecs: "design",
  specialDesignComments: "design",
  hasEdagReference: "edag",
  referenceEdagCode: "edag",
  referenceEdagVersion: "edag",
  edagCode: "edag",
  edagVersion: "edag",
  hasDesignPlan: "designPlans",
  designPlanFiles: "designPlans",
  colorObjectiveCode: "design",
  colorObjective: "design",
  colorObjectiveOther: "design",
  pressApproverCode: "design",
  pressApprover: "design",
  alusaReferenceCode: "design",
  designWorkInstructions: "design",
  hasReferenceStructure: "structure",
  referenceEmCode: "structure",
  referenceEmVersion: "structure",
  structureType: "structure",
  layer1MaterialGroup: "materials",
  layer1Material: "materials",
  layer1Micron: "materials",
  layer1Grammage: "materials",
  layer2MaterialGroup: "materials",
  layer2Material: "materials",
  layer2Micron: "materials",
  layer2Grammage: "materials",
  layer3MaterialGroup: "materials",
  layer3Material: "materials",
  layer3Micron: "materials",
  layer3Grammage: "materials",
  layer4MaterialGroup: "materials",
  layer4Material: "materials",
  layer4Micron: "materials",
  layer4Grammage: "materials",
  grammage: "properties",
  sampleRequest: "sample",
  specialStructureSpecs: "technicalComments",
  width: "dimensions",
  length: "dimensions",
  repetition: "dimensions",
  doyPackBase: "dimensions",
  gussetWidth: "dimensions",
  gussetType: "dimensions",
  hasZipper: "accessories",
  zipperType: "accessories",
  hasTinTie: "accessories",
  hasValve: "accessories",
  valveType: "accessories",
  hasDieCutHandle: "accessories",
  hasReinforcement: "accessories",
  reinforcementThickness: "accessories",
  reinforcementWidth: "accessories",
  hasAngularCut: "accessories",
  hasRoundedCorners: "accessories",
  roundedCornersType: "accessories",
  hasNotch: "accessories",
  hasPerforation: "accessories",
  pouchPerforationType: "accessories",
  bagPerforationType: "accessories",
  perforationLocation: "accessories",
  hasPreCut: "accessories",
  preCutType: "accessories",
  otherAccessories: "accessories",
  materialPackaging: "packaging",
  specialMaterialPackaging: "packaging",
  exportProductPackaging: "packaging",
  splices: "packaging",
  hasCustomerTechnicalSpec: "technicalSpec",
  customerTechnicalSpecAttachment: "technicalSpec",
  estimatedVolume: "commercial",
  unitOfMeasure: "commercial",
  saleType: "commercial",
  incoterm: "commercial",
  destinationCountry: "commercial",
  targetPrice: "commercial",
  currencyType: "commercial",
  coreMaterial: "core",
  coreDiameter: "core",
  externalDiameter: "core",
  externalVariationPlus: "core",
  externalVariationMinus: "core",
  maxRollWeight: "core",
  perimeterMm: "dimensions",
  dimensionCrossCheckStatus: "dimensions",
  perimeterValidationStatus: "dimensions",
  perimeterComment: "dimensions",
  hasPhotoregister1: "design",
  fr1Width: "design",
  fr1Height: "design",
  fr1MarginLeft: "design",
  fr1MarginRight: "design",
  fr1MarginTop: "design",
  fr1MarginBottom: "design",
  hasPhotoregister2: "design",
  fr2Width: "design",
  fr2Height: "design",
  fr2MarginLeft: "design",
  fr2MarginRight: "design",
  fr2MarginTop: "design",
  fr2MarginBottom: "design",
  rewindingDirection: "design",
  rewindingDirectionRef: "design",
  hasPhotocell: "design",
  photocellLocation: "design",
};

// Helpers para MOT
function getMotRule(mot: string) {
  return MOT_FIELD_RULES[mot] || null;
}

function isFieldEditableByMot(fieldName: string, mot: string | null): boolean {
  if (!mot) return true;
  const rule = getMotRule(mot);
  if (!rule) return true;
  const group = FIELD_TO_EDITABLE_GROUP[fieldName];
  if (!group) return true;
  return rule.editableFieldGroups.includes(group);
}

function isFieldLockedByMot(fieldName: string, mot: string | null): boolean {
  if (!mot) return false;
  const rule = getMotRule(mot);
  if (!rule) return false;
  const group = FIELD_TO_EDITABLE_GROUP[fieldName];
  if (!group) return false;
  return rule.lockedFieldGroups.includes(group);
}

function getEnabledSectionsByMot(mot: string | null): string[] {
  if (!mot) return ["producto", "diseno", "estructura", "embalaje"];
  const rule = getMotRule(mot);
  return rule?.enabledSections || ["producto", "diseno", "estructura", "embalaje"];
}

function requiresBaseProductAutofill(mot: string | null): boolean {
  if (!mot) return false;
  const rule = getMotRule(mot);
  return rule?.requiresBaseProductAutofill || false;
}

// Nueva función: Determinar si un campo debe ser visible (basado en FDP, NO en MOT)
function shouldFieldBeVisibleByFormat(fieldName: string, blueprintFormat: string | null | undefined): boolean {
  if (!blueprintFormat) {
    return true; // Sin FDP, mostrar todos
  }
  const rules = FORMAT_FIELD_RULES_BY_FDP[blueprintFormat];
  if (!rules) {
    return true; // Sin reglas FDP, mostrar campo
  }
  return rules.visibleFields.has(fieldName);
}

// Nueva función: Determinar si un campo debe estar deshabilitado
function shouldFieldBeDisabledByMot(
  fieldName: string,
  mot: string | null,
  inheritedFields?: Set<string>
): boolean {
  // 1. Si es heredado, deshabilitar
  if (inheritedFields?.has(fieldName)) {
    return true;
  }

  // 2. Si está bloqueado por MOT, deshabilitar
  if (isFieldLockedByMot(fieldName, mot)) {
    return true;
  }

  return false;
}

// Nueva función: Determinar si un campo es requerido por MOT
function isFieldRequiredByMot(fieldName: string, mot: string | null): boolean {
  if (!mot) return false;
  const rule = getMotRule(mot);
  if (!rule) return false;
  const fieldGroup = FIELD_TO_EDITABLE_GROUP[fieldName];
  if (!fieldGroup) return false;
  return rule.editableFieldGroups.includes(fieldGroup);
}

// Nueva función: Determinar si una sección debe ser visible por MOT
function shouldSectionBeVisibleByMot(section: string, mot: string | null): boolean {
  if (!mot) return true; // Sin MOT, mostrar todas las secciones
  const rule = getMotRule(mot);
  if (!rule) return true;
  return rule.enabledSections.includes(section);
}

// Fields that are sent to Sistema Integral
const SI_FIELDS = new Set<string>([
  "approvedProductCode",
  "technicalApplication",
  "portafolioEstandar",
  "customerPackingCode",
  "structureType",
  "layer1Material",
  "layer2Material",
  "layer3Material",
  "layer4Material",
  "grammage",
  "grammageTolerance",
  "width",
  "length",
  "repetition",
  "gussetWidth",
  "gussetType",
  "blueprintFormat",
  "rewindingDirection",
  "hasPhotocell",
  "coreMaterial",
  "coreDiameter",
  "materialPackaging",
  "splices",
]);

// FORMAT_FIELD_RULES_BY_FDP - Define visible/required fields by blueprint format
const FORMAT_FIELD_RULES_BY_FDP: Record<string, {
  visibleFields: Set<string>;
  requiredFields: Set<string>;
  siFields: Set<string>;
}> = {
  // LAMINA formats
  "GENERICA": {
    visibleFields: new Set([
      "width", "length", "repetition", "perimeterMm", "dimensionCrossCheckStatus", "perimeterValidationStatus",
      "rewindingDirection", "rewindingDirectionRef", "hasPhotocell", "photocellLocation",
      "fr1Width", "fr1Height", "fr1MarginRight", "fr1MarginBottom", "fr1MarginLeft", "fr1MarginTop",
      "fr2Width", "fr2Height", "fr2MarginRight", "fr2MarginBottom", "fr2MarginLeft", "fr2MarginTop",
      "coreMaterial", "coreDiameter", "externalDiameter", "externalVariationPlus", "externalVariationMinus", "maxRollWeight",
      "materialPackaging", "specialMaterialPackaging", "exportProductPackaging", "splices"
    ]),
    requiredFields: new Set(["width", "rewindingDirection", "coreMaterial"]),
    siFields: new Set(["width", "length", "repetition", "rewindingDirection", "hasPhotocell", "coreMaterial", "coreDiameter", "materialPackaging", "splices"])
  },
  "TISSUE": {
    visibleFields: new Set([
      "width", "repetition", "perimeterMm", "dimensionCrossCheckStatus", "perimeterValidationStatus",
      "rewindingDirection", "rewindingDirectionRef", "hasPhotocell", "photocellLocation",
      "fr1Width", "fr1Height", "fr1MarginRight", "fr1MarginBottom", "fr1MarginLeft", "fr1MarginTop",
      "fr2Width", "fr2Height", "fr2MarginRight", "fr2MarginBottom", "fr2MarginLeft", "fr2MarginTop",
      "coreMaterial", "coreDiameter", "externalDiameter", "externalVariationPlus", "externalVariationMinus", "maxRollWeight",
      "materialPackaging", "specialMaterialPackaging", "exportProductPackaging", "splices"
    ]),
    requiredFields: new Set(["width", "rewindingDirection", "coreMaterial"]),
    siFields: new Set(["width", "repetition", "rewindingDirection", "hasPhotocell", "coreMaterial", "coreDiameter", "materialPackaging", "splices"])
  },
  "FOOD": {
    visibleFields: new Set([
      "width", "repetition", "perimeterMm", "dimensionCrossCheckStatus", "perimeterValidationStatus",
      "rewindingDirection", "rewindingDirectionRef", "hasPhotocell", "photocellLocation",
      "fr1Width", "fr1Height", "fr1MarginRight", "fr1MarginBottom", "fr1MarginLeft", "fr1MarginTop",
      "fr2Width", "fr2Height", "fr2MarginRight", "fr2MarginBottom", "fr2MarginLeft", "fr2MarginTop",
      "coreMaterial", "coreDiameter", "externalDiameter", "externalVariationPlus", "externalVariationMinus", "maxRollWeight",
      "materialPackaging", "specialMaterialPackaging", "exportProductPackaging", "splices"
    ]),
    requiredFields: new Set(["width", "rewindingDirection", "coreMaterial"]),
    siFields: new Set(["width", "repetition", "rewindingDirection", "hasPhotocell", "coreMaterial", "coreDiameter", "materialPackaging", "splices"])
  },
  // Default POUCH format (shows all POUCH-related fields)
  "POUCH_DEFAULT": {
    visibleFields: new Set([
      "width", "length", "repetition", "gussetWidth", "gussetType",
      "hasZipper", "zipperType", "hasTinTie", "hasValve", "valveType",
      "hasRiñonera", "hasWicket", "wicketDiameter", "wicketDistSuperior", "wicketDistDerecho",
      "hasWicketControl", "wicketControlDiameter", "wicketControlUbicacion", "wicketControlDistSuperior", "wicketControlDistDerecho",
      "hasDieCutHandle", "hasReinforcement", "reinforcementThickness", "reinforcementWidth",
      "hasRoundedCorners", "roundedCornersType", "hasNotch", "distanciaAbocaPerforacion",
      "hasPerforation", "pouchPerforationType", "perforationLocation",
      "hasAngularCut", "hasPreCut", "preCutType", "distanciaAbocaPrecorte", "otherAccessories",
      "materialPackaging", "specialMaterialPackaging", "exportProductPackaging", "splices",
      "rewindingDirection", "rewindingDirectionRef", "hasPhotocell", "photocellLocation",
      "fr1Width", "fr1Height", "fr1MarginRight", "fr1MarginBottom", "fr1MarginLeft", "fr1MarginTop",
      "fr2Width", "fr2Height", "fr2MarginRight", "fr2MarginBottom", "fr2MarginLeft", "fr2MarginTop"
    ]),
    requiredFields: new Set(["width", "length", "gussetWidth", "materialPackaging"]),
    siFields: new Set(["width", "length", "repetition", "gussetWidth", "gussetType", "rewindingDirection", "hasPhotocell", "materialPackaging", "splices"])
  },
  // Default BOLSA format (shows all BOLSA-related fields)
  "BOLSA_DEFAULT": {
    visibleFields: new Set([
      "width", "length", "repetition",
      "hasWicket", "wicketDiameter", "wicketDistSuperior", "wicketDistDerecho",
      "hasWicketControl", "wicketControlDiameter", "wicketControlUbicacion", "wicketControlDistSuperior", "wicketControlDistDerecho",
      "hasDieCutHandle", "hasReinforcement", "reinforcementThickness", "reinforcementWidth",
      "hasRoundedCorners", "roundedCornersType", "hasNotch", "distanciaAbocaPerforacion",
      "hasPerforation", "bagPerforationType", "perforationLocation",
      "hasAngularCut", "hasPreCut", "preCutType", "distanciaAbocaPrecorte", "otherAccessories",
      "materialPackaging", "specialMaterialPackaging", "exportProductPackaging", "splices",
      "rewindingDirection", "rewindingDirectionRef", "hasPhotocell", "photocellLocation",
      "fr1Width", "fr1Height", "fr1MarginRight", "fr1MarginBottom", "fr1MarginLeft", "fr1MarginTop",
      "fr2Width", "fr2Height", "fr2MarginRight", "fr2MarginBottom", "fr2MarginLeft", "fr2MarginTop"
    ]),
    requiredFields: new Set(["width", "length", "materialPackaging"]),
    siFields: new Set(["width", "length", "repetition", "rewindingDirection", "hasPhotocell", "materialPackaging", "splices"])
  },
};

// Helper functions for FORMAT_FIELD_RULES_BY_FDP
function getFormatRulesByFdp(blueprintFormat: string | null | undefined) {
  if (!blueprintFormat) return null;

  // Check if it's a specific LAMINA format
  if (blueprintFormat === "GENERICA" || blueprintFormat === "TISSUE" || blueprintFormat === "FOOD") {
    return FORMAT_FIELD_RULES_BY_FDP[blueprintFormat];
  }

  // Check if it's a POUCH format
  if (blueprintFormat.includes("POUCH")) {
    return FORMAT_FIELD_RULES_BY_FDP["POUCH_DEFAULT"];
  }

  // Check if it's a BOLSA format
  if (blueprintFormat.includes("SELLO") || blueprintFormat.includes("FONDO") || blueprintFormat === "WICKET" || blueprintFormat === "HOJAS") {
    return FORMAT_FIELD_RULES_BY_FDP["BOLSA_DEFAULT"];
  }

  return null;
}

function isFieldVisibleByFormat(fieldName: string, blueprintFormat: string | null | undefined): boolean {
  const rule = getFormatRulesByFdp(blueprintFormat);
  return rule ? rule.visibleFields.has(fieldName) : true; // Default to visible if no format selected
}

function isFieldRequiredByFormat(fieldName: string, blueprintFormat: string | null | undefined, mot: string | null): boolean {
  const rule = getFormatRulesByFdp(blueprintFormat);
  if (!rule) return false;

  // Field must be both visible and in required set for the format
  if (!rule.visibleFields.has(fieldName) || !rule.requiredFields.has(fieldName)) {
    return false;
  }

  // Additional MOT-based requirement filtering could go here
  return true;
}

function isSiField(fieldName: string, blueprintFormat: string | null | undefined): boolean {
  const rule = getFormatRulesByFdp(blueprintFormat);
  if (rule && rule.siFields.has(fieldName)) return true;
  return SI_FIELDS.has(fieldName); // Fallback to global SI_FIELDS
}

function getVisibleFieldsByFormat(blueprintFormat: string | null | undefined): Set<string> {
  const rule = getFormatRulesByFdp(blueprintFormat);
  return rule ? rule.visibleFields : new Set();
}

function getRequiredFieldsByFormat(blueprintFormat: string | null | undefined, mot: string | null): Set<string> {
  const rule = getFormatRulesByFdp(blueprintFormat);
  if (!rule) return new Set();

  const requiredFields = new Set(rule.requiredFields);

  // MOT-based requirements could be added here
  // For example, if MOT requires certain structure fields, add them to requiredFields

  return requiredFields;
}

// Determine if a field should be visible/enabled based on MOT and FDP
function shouldFieldBeVisible(
  fieldName: string,
  mot: string | null,
  blueprintFormat: string | null | undefined
): boolean {
  // Check MOT visibility first
  const motRule = getMotRule(mot);
  if (motRule) {
    // If MOT is set, only show fields in its editable groups or non-locked groups
    const fieldGroup = FIELD_TO_EDITABLE_GROUP[fieldName];
    if (fieldGroup && motRule.lockedFieldGroups.includes(fieldGroup)) {
      return false; // Field is locked by MOT
    }
  }

  // Check FDP visibility
  if (blueprintFormat) {
    if (!isFieldVisibleByFormat(fieldName, blueprintFormat)) {
      return false; // Field is not visible for this FDP
    }
  }

  return true; // Field is visible
}

// Determine if a field should be disabled (locked) based on MOT
function shouldFieldBeDisabled(
  fieldName: string,
  mot: string | null,
  inheritedFields: Set<string>
): boolean {
  // Inherited fields from modified product are effectively disabled/read-only
  if (inheritedFields.has(fieldName)) {
    return true;
  }

  // Check if field is locked by MOT
  const motRule = getMotRule(mot);
  if (motRule) {
    const fieldGroup = FIELD_TO_EDITABLE_GROUP[fieldName];
    if (fieldGroup && motRule.lockedFieldGroups.includes(fieldGroup)) {
      return true;
    }
  }

  return false;
}

// Generar opciones de Modificación desde TABMODPRODODISEO
const getCausalOptions = (classification: string) => {
  const normalized = normalizeProductClassificationToCatalog(classification);
  if (!normalized) return [];
  return getActiveModificationOptionsByClassification(normalized);
};

// Material configuration for Moment 1 (ProductInitialCreateModal style)
const MATERIAL_MICRON_CONFIG: Record<
  string,
  {
    label: string;
    micronOptions?: string[];
    defaultMicron?: string;
  }
> = {
  BOPP: {
    label: "BOPP",
    micronOptions: ["13.5", "15", "17", "20", "25", "27", "30", "35"],
  },
  PET: {
    label: "PET / Poliéster",
    micronOptions: ["10", "12"],
    defaultMicron: "12",
  },
  BOPA: {
    label: "BOPA / Nylon",
    micronOptions: ["15"],
    defaultMicron: "15",
  },
  PAPEL: {
    label: "Papel",
    micronOptions: ["40", "60", "70"],
  },
  COEX: {
    label: "COEX",
    micronOptions: [],
  },
  ALUMINIO: {
    label: "Aluminio / Foil",
    micronOptions: ["7", "8", "9"],
    defaultMicron: "7",
  },
  AMPRIMA: {
    label: "AmPrima",
    micronOptions: ["25"],
  },
  PPCAST: {
    label: "PP Cast",
    micronOptions: ["20", "25", "30", "60"],
  },
  PE: {
    label: "PE / Polietileno",
    micronOptions: ["70", "80", "90"],
  },
  PE_SELLANTE: {
    label: "PE sellante",
    micronOptions: ["70", "80", "90"],
    defaultMicron: "80",
  },
  TERMOFORMADOS: {
    label: "Termoformados",
    micronOptions: ["75", "90", "100", "110", "150", "178", "200"],
  },
};

const MATERIAL_OPTIONS = Object.entries(MATERIAL_MICRON_CONFIG).map(
  ([value, config]) => ({
    value,
    label: config.label,
  }),
);

const getMaterialLabel = (material: string) =>
  MATERIAL_MICRON_CONFIG[material]?.label || material;

const getMicronOptionsByMaterial = (material: string): string[] => {
  return MATERIAL_MICRON_CONFIG[material]?.micronOptions ?? [];
};

const getDefaultMicronByMaterial = (material: string): string => {
  return MATERIAL_MICRON_CONFIG[material]?.defaultMicron ?? "";
};

const formatLayerForTechnicalName = (material: string, micron?: string): string => {
  const label = getMaterialLabel(material);
  if (!micron || !material) return label;
  return `${label} ${micron} µ`;
};

// Subclassification options mapped by classification type
const getSubclassificationOptions = (classification: string) => {
  if (classification === "Producto Nuevo") {
    return [
      { value: "Desarrollo_RD", label: "Desarrollo_RD" },
      { value: "Área_Técnica", label: "Área_Técnica" },
    ];
  }
  if (classification === "Producto Modificado") {
    return [
      { value: "Diseño y Dimensiones", label: "Diseño y Dimensiones" },
      { value: "Estructura", label: "Estructura" },
    ];
  }
  return [];
};

const PROJECT_TYPE_RD_OPTIONS = [
  { value: "Producto nuevo", label: "Producto nuevo" },
  { value: "Nuevo equipamiento de envasado", label: "Nuevo equipamiento de envasado" },
  { value: "Nuevos insumos", label: "Nuevos insumos" },
  { value: "Nueva estructura", label: "Nueva estructura" },
  { value: "Nuevo formato de envasado", label: "Nuevo formato de envasado" },
  { value: "Nuevos accesorios", label: "Nuevos accesorios" },
  { value: "Nuevos procesos por el lado del cliente", label: "Nuevos procesos por el lado del cliente" },
  { value: "Nuevas temperaturas de envasado y almacenaje", label: "Nuevas temperaturas de envasado y almacenaje" },
];

const PROJECT_TYPE_TECNICA_OPTIONS = [
  { value: "Extensión de línea por familia (EM de referencia)", label: "Extensión de línea por familia (EM de referencia)" },
  { value: "Modifica Dimensiones", label: "Modifica Dimensiones" },
  { value: "Modifica Propiedades", label: "Modifica Propiedades" },
  { value: "Portafolio Estándar", label: "Portafolio Estándar" },
  { value: "ICO (Intercompany), BCP (Business Continous Production)", label: "ICO (Intercompany), BCP (Business Continous Production)" },
];

const POUCH_FORMAT_OPTIONS = [
  { value: "POUCH C/SELLO EN FUELLE\\TIPO 4-1\\FUELLE PROPIO", label: "POUCH C/SELLO EN FUELLE\\TIPO 4-1\\FUELLE PROPIO" },
  { value: "POUCH STAND UP\\TIPO K\\FUELLE PROPIO", label: "POUCH STAND UP\\TIPO K\\FUELLE PROPIO" },
  { value: "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE PROPIO", label: "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE PROPIO" },
  { value: "POUCH STAND UP\\DOY PACK CUADRADO\\FUELLE PROPIO", label: "POUCH STAND UP\\DOY PACK CUADRADO\\FUELLE PROPIO" },
  { value: "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE INSERTADO", label: "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE INSERTADO" },
  { value: "POUCH STAND UP\\DOY PACK CUADRADO\\FUELLE INSERTADO", label: "POUCH STAND UP\\DOY PACK CUADRADO\\FUELLE INSERTADO" },
  { value: "POUCH STAND UP\\NORMAL\\FUELLE PROPIO", label: "POUCH STAND UP\\NORMAL\\FUELLE PROPIO" },
  { value: "POUCH PLANO\\DOS SELLOS", label: "POUCH PLANO\\DOS SELLOS" },
  { value: "POUCH PLANO\\TRES SELLOS", label: "POUCH PLANO\\TRES SELLOS" },
  { value: "POUCH C/SELLO CENTRAL\\TIPO ALETA\\CON FUELLE", label: "POUCH C/SELLO CENTRAL\\TIPO ALETA\\CON FUELLE" },
  { value: "POUCH C/SELLO CENTRAL\\TIPO ALETA\\SIN FUELLE", label: "POUCH C/SELLO CENTRAL\\TIPO ALETA\\SIN FUELLE" },
  { value: "POUCH C/SELLO EN FUELLE\\TIPO 1-1", label: "POUCH C/SELLO EN FUELLE\\TIPO 1-1" },
  { value: "POUCH C/SELLO CENTRAL\\TIPO ALETA\\CON FUELLE (PE-PE/PE)", label: "POUCH C/SELLO CENTRAL\\TIPO ALETA\\CON FUELLE (PE-PE/PE)" },
  { value: "POUCH C/SELLO CENTRAL\\TIPO ALETA\\SIN FUELLE (PE-PE/PE)", label: "POUCH C/SELLO CENTRAL\\TIPO ALETA\\SIN FUELLE (PE-PE/PE)" },
];

const BOLSA_FORMAT_OPTIONS = [
  { value: "SELLO LATERAL\\CORTE\\CON FUELLE FONDO", label: "SELLO LATERAL\\CORTE\\CON FUELLE FONDO" },
  { value: "SELLO LATERAL\\PESTAÑA\\CON FUELLE FONDO", label: "SELLO LATERAL\\PESTAÑA\\CON FUELLE FONDO" },
  { value: "SELLO LATERAL\\PESTAÑA\\SIN FUELLE FONDO", label: "SELLO LATERAL\\PESTAÑA\\SIN FUELLE FONDO" },
  { value: "SELLO LATERAL\\CORTE\\SIN FUELLE FONDO", label: "SELLO LATERAL\\CORTE\\SIN FUELLE FONDO" },
  { value: "SELLO DE FONDO\\CON FUELLE LATERAL", label: "SELLO DE FONDO\\CON FUELLE LATERAL" },
  { value: "SELLO DE FONDO\\SIN FUELLE LATERAL", label: "SELLO DE FONDO\\SIN FUELLE LATERAL" },
  { value: "WICKET", label: "WICKET" },
  { value: "HOJAS", label: "HOJAS" },
];

const LAMINA_FORMAT_OPTIONS = [
  { value: "GENERICA", label: "GENERICA" },
  { value: "TISSUE", label: "TISSUE" },
  { value: "FOOD", label: "FOOD" },
];

function normalizeWrapping(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function normalizeWrappingName(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function getWrappingImage(name: string): string {
  const normalized = normalizeWrappingName(name);
  if (normalized.includes("lamina")) return "/assets/envolturas/lamina.png";
  if (normalized.includes("bolsa")) return "/assets/envolturas/bolsa.png";
  if (normalized.includes("pouch")) return "/assets/envolturas/pouch.png";
  return "/assets/envolturas/default.png";
}

function normalizeOptionValue(value: string): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "_")
    .trim();
}

function parseNumberInput(value: string): number | null {
  if (!value?.trim()) return null;
  const normalizedValue = value.replace(",", ".").trim();
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

const getAnyProjectValue = (
  project: ProjectRecord | null | undefined,
  keys: string[],
): string => {
  const source = project as Record<string, unknown> | null;

  if (!source) return "";

  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
};

const normalizeTextValue = (value: unknown): string =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeInitialClassification = (
  project: ProjectRecord | null | undefined,
): "Nuevo" | "Modificado" | "" => {
  const raw = getAnyProjectValue(project, [
    "classification",
    "clasificacion",
    "motivo",
    "requestReason",
    "tipoSolicitud",
  ]);

  const normalized = normalizeTextValue(raw);

  if (normalized.includes("modificado")) return "Modificado";
  if (normalized.includes("nuevo")) return "Nuevo";

  return "";
};

const resolveInitialProjectType = (
  project: ProjectRecord | null | undefined,
): string => {
  return getAnyProjectValue(project, [
    "projectType",
    "tipoProyecto",
    "causal",
    "motivoNuevaValidacion",
    "validationReason",
    "causalValidacion",
  ]);
};

const resolveInitialProjectDescription = (
  project: ProjectRecord | null | undefined,
): string => {
  return getAnyProjectValue(project, [
    "projectDescription",
    "descripcionNecesidad",
    "descripcion",
    "description",
  ]);
};

const resolveInitialVolume = (
  project: ProjectRecord | null | undefined,
): string => {
  return getAnyProjectValue(project, [
    "estimatedVolume",
    "volumenReferencial",
    "volumenCantidadReferencial",
    "volumen",
    "volume",
  ]);
};

const resolveInitialUnit = (
  project: ProjectRecord | null | undefined,
): string => {
  return getAnyProjectValue(project, [
    "unitOfMeasure",
    "unidad",
    "unidadVolumen",
    "unit",
  ]);
};

// NUEVA FUNCIÓN: Resolver comentarios desde múltiples alias de storage
const resolveInitialComment = (
  project: ProjectRecord | null | undefined,
): string => {
  return getAnyProjectValue(project, [
    "additionalComment",
    "comentarios",
    "comment",
    "comentario",
  ]);
};

// NUEVA FUNCIÓN: Resolver tipo de estructura desde múltiples alias
const resolveInitialStructureType = (
  project: ProjectRecord | null | undefined,
): string => {
  const explicit = getAnyProjectValue(project, [
    "structureType",
    "estructura",
  ]);
  if (explicit) return explicit;

  // Si no hay structureType explícito, intenta calcularlo desde estructuraCalculada
  return getAnyProjectValue(project, [
    "estructuraCalculada",
  ]);
};

const isProductoNuevo = (classification: string): boolean => {
  const normalized = normalizeProductClassificationToCatalog(classification);
  return normalized === "Producto Nuevo";
};

const isProductoModificado = (classification: string): boolean => {
  const normalized = normalizeProductClassificationToCatalog(classification);
  return normalized === "Producto Modificado";
};

const isDisenoNuevo = (classification: string, projectType: string): boolean =>
  isProductoNuevo(classification) && projectType === "Nuevo diseño";

const isCambioDiseno = (classification: string, projectType: string): boolean =>
  isProductoModificado(classification) && projectType === "Cambia diseño";

const goesToGraphicArts = (
  classification: string,
  projectType: string,
): boolean => {
  return (
    isDisenoNuevo(classification, projectType) ||
    isCambioDiseno(classification, projectType)
  );
};

const goesToRDDesarrollo = (
  classification: string,
  projectType: string,
): boolean => {
  return (
    isProductoNuevo(classification) &&
    [
      "Nueva estructura",
      "Nuevos insumos",
      "Nuevo formato de envasado",
    ].includes(projectType)
  );
};

const goesToRDAreaTecnica = (
  classification: string,
  projectType: string,
): boolean => {
  return (
    isProductoModificado(classification) &&
    [
      "Nuevo equipamiento / proceso / temperatura",
      "Modifica dimensiones",
      "Modifica propiedades",
      "Cambia estructura",
      "Cambia materia prima",
    ].includes(projectType)
  );
};

function canEditDesign(motivoModificacion: string): boolean {
  return motivoModificacion === "Diseño y Dimensiones" || motivoModificacion === "Diseño y Estructura";
}

function canEditDimensions(motivoModificacion: string): boolean {
  return motivoModificacion === "Diseño y Dimensiones" || motivoModificacion === "Diseño y Estructura";
}

function canEditStructure(motivoModificacion: string): boolean {
  return motivoModificacion === "Estructura" || motivoModificacion === "Diseño y Estructura";
}

function getBlueprintFormatOptions(wrapping: string | undefined): Array<{ value: string; label: string }> {
  if (!wrapping) return [];
  const normalized = normalizeWrapping(wrapping);
  if (normalized === "pouch") return POUCH_FORMAT_OPTIONS;
  if (normalized === "bolsa") return BOLSA_FORMAT_OPTIONS;
  if (normalized === "lamina") return LAMINA_FORMAT_OPTIONS;
  return [];
}

function extractMaterialGroupFromValue(materialValue: string): string {
  if (!materialValue) return "";
  // Try to resolve from catalog using TbMatCapCod
  const material = resolveMaterialLayer(materialValue);
  if (material) return material.TbMatCapGmp;
  // Fallback to old format (for backward compatibility)
  const group = materialValue.split(" - ")[0];
  return Object.keys(MATERIAL_CATALOG).includes(group) ? group : "";
}

// Use getAllMaterialLayerOptions from catalog
const MATERIAL_LAYER_OPTIONS = getAllMaterialLayerOptions().map(m => ({
  value: m.code,
  label: m.materialName,
}));

type LayerNumber = 1 | 2 | 3 | 4;

const getLayerFieldNames = (layer: LayerNumber) => ({
  materialGroup: `layer${layer}MaterialGroup` as keyof ProjectEditFormData,
  material: `layer${layer}Material` as keyof ProjectEditFormData,
  micron: `layer${layer}Micron` as keyof ProjectEditFormData,
  grammage: `layer${layer}Grammage` as keyof ProjectEditFormData,
});

const STRUCTURE_FIXED_GRAMMAGE: Record<string, number> = {
  Monocapa: 2.5,
  Bilaminado: 5,
  Trilaminado: 7.5,
  Tetralaminado: 9.5,
};

function parseGrammageValue(value: string): number {
  if (!value?.trim()) return 0;

  const normalizedValue = value.replace(",", ".").trim();
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatGrammageValue(value: number): string {
  if (!Number.isFinite(value)) return "";

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, "");
}
function getLayerCountByStructureType(structureType: string): number {
  switch (structureType) {
    case "Monocapa":
      return 1;
    case "Bilaminado":
      return 2;
    case "Trilaminado":
      return 3;
    case "Tetralaminado":
      return 4;
    default:
      return 0;
  }
}

function getStructureTypeByLayerCount(layerCount: number): string {
  switch (layerCount) {
    case 1:
      return "Monocapa";
    case 2:
      return "Bilaminado";
    case 3:
      return "Trilaminado";
    case 4:
      return "Tetralaminado";
    default:
      return "";
  }
}

function getMaterialTypeForSummary(materialValue: string): string {
  if (!materialValue) return "";

  const parts = materialValue.split(" - ");

  // Ejemplo:
  // "PAPEL - PAPEL ANTIGRASA - 60" => "PAPEL ANTIGRASA"
  // "COEX - PE BLANCO - Libre" => "PE BLANCO"
  if (parts.length >= 3) {
    return parts.slice(1, -1).join(" - ");
  }

  return materialValue;
}
// Unidad de Medida - desde TABUNIMEDODISEO (única fuente oficial)
const UNIT_OPTIONS = getActiveUnitMeasureOptions();
const UNIT_OPTIONS_MOMENT1 = UNIT_OPTIONS;

const PRINT_CLASS_OPTIONS = [
  { value: "Flexo", label: "Flexo" },
  { value: "Huecograbado", label: "Huecograbado" },
  { value: "Sin impresión", label: "Sin impresión" },
];

const PRINT_TYPE_OPTIONS = [
  { value: "Continuo", label: "Continuo" },
  { value: "Repetitivo", label: "Repetitivo" },
];

const STRUCTURE_TYPE_OPTIONS = [
  { value: "Monocapa", label: "Monocapa" },
  { value: "Bilaminado", label: "Bilaminado" },
  { value: "Trilaminado", label: "Trilaminado" },
  { value: "Tetralaminado", label: "Tetralaminado" },
];

type MaterialEntry = {
  value: string; label: string; micron: string; grammage: string; isFree: boolean;
};

type MaterialCatalog = Record<string, MaterialEntry[]>;
const fixedMaterial = (
  value: string,
  label: string,
  micron: string,
  grammage: string
): MaterialEntry => ({
  value,
  label,
  micron,
  grammage,
  isFree: false,
});

const freeMaterial = (
  value: string,
  label: string
): MaterialEntry => ({
  value,
  label,
  micron: "",
  grammage: "",
  isFree: true,
});

const MATERIAL_CATALOG: MaterialCatalog = {
  BOPP: [
    fixedMaterial("BOPP - BOPP CRISTAL - 15", "BOPP CRISTAL - 15", "15", "13.5"),
    fixedMaterial("BOPP - BOPP CRISTAL - 17", "BOPP CRISTAL - 17", "17", "15.5"),
    fixedMaterial("BOPP - BOPP CRISTAL - 20", "BOPP CRISTAL - 20", "20", "18"),
    fixedMaterial("BOPP - BOPP CRISTAL - 25", "BOPP CRISTAL - 25", "25", "22.5"),
    fixedMaterial("BOPP - BOPP CRISTAL - 30", "BOPP CRISTAL - 30", "30", "27"),
    fixedMaterial("BOPP - BOPP CRISTAL - 35", "BOPP CRISTAL - 35", "35", "31.5"),
    fixedMaterial("BOPP - BOPP CRISTAL ETIQUETA - 13.5", "BOPP CRISTAL ETIQUETA - 13.5", "13.5", "12.2"),
    fixedMaterial("BOPP - BOPP BLANCO/MATE - 17", "BOPP MATE - 17", "17", "15.5"),
    fixedMaterial("BOPP - BOPP BLANCO/MATE - 20", "BOPP MATE - 20", "20", "18"),
    fixedMaterial("BOPP - BOPP BLANCO/MATE - 27", "BOPP BLANCO - 27", "27", "17.3"),
    fixedMaterial("BOPP - BOPP ALOX - 16", "BOPP ALOX - 16", "16", "14"),
    fixedMaterial("BOPP - BOPP METALIZADO - 15", "BOPP METALIZADO - 15", "15", "13.5"),
    fixedMaterial("BOPP - BOPP METALIZADO - 17", "BOPP METALIZADO - 17", "17", "15.5"),
    fixedMaterial("BOPP - BOPP METALIZADO - 20", "BOPP METALIZADO - 20", "20", "18"),
    fixedMaterial("BOPP - BOPP METALIZADO - 25", "BOPP METALIZADO - 25", "25", "22.5"),
    fixedMaterial("BOPP - BOPP METALIZADO - 30", "BOPP METALIZADO - 30", "30", "27"),
    fixedMaterial("BOPP - BOPP METALIZADO - 35", "BOPP METALIZADO - 35", "35", "32"),
    fixedMaterial("BOPP - BOPP METALIZADO UHB - 18", "BOPP METALIZADO UHB - 18", "18", "16"),
  ],

  POLIESTER: [
    fixedMaterial("POLIESTER - PET CRISTAL - 10", "PET CRISTAL - 10", "10", "14"),
    fixedMaterial("POLIESTER - PET CRISTAL - 12", "PET CRISTAL - 12", "12", "17"),
    fixedMaterial("POLIESTER - PET METALIZADO - 12", "PET METALIZADO - 12", "12", "17"),
    fixedMaterial("POLIESTER - PET METALIZADO UHB - 12", "PET METALIZADO UHB - 12", "12", "17"),
  ],

  PAPEL: [
    fixedMaterial("PAPEL - PAPEL ANTIGRASA - 40", "PAPEL ANTIGRASA - 40", "40", "40"),
    fixedMaterial("PAPEL - PAPEL ANTIGRASA - 60", "PAPEL ANTIGRASA - 60", "60", "60"),
    fixedMaterial("PAPEL - PAPEL ESTUCADO - 40", "PAPEL ESTUCADO - 40", "40", "40"),
    fixedMaterial("PAPEL - PAPEL ESTUCADO - 60", "PAPEL ESTUCADO - 60", "60", "60"),
    fixedMaterial("PAPEL - PAPEL ESTUCADO - 70", "PAPEL ESTUCADO - 70", "70", "70"),
    freeMaterial("PAPEL - PAPEL ESPECIAL - Libre", "PAPEL ESPECIAL - Libre"),
  ],

  COEX: [
    freeMaterial("COEX - PE CRISTAL - Libre", "PE CRISTAL - Libre"),
    freeMaterial("COEX - PE BLANCO - Libre", "PE BLANCO - Libre"),
    freeMaterial("COEX - BARVAL CRISTAL - Libre", "BARVAL CRISTAL - Libre"),
    freeMaterial("COEX - BARVAL BLANCO - Libre", "BARVAL BLANCO - Libre"),
    freeMaterial("COEX - BARLON CRISTAL - Libre", "BARLON CRISTAL - Libre"),
    freeMaterial("COEX - BARLON BLANCO - Libre", "BARLON BLANCO - Libre"),
    freeMaterial("COEX - PE PELABLE CRISTAL - Libre", "PE PELABLE CRISTAL - Libre"),
    freeMaterial("COEX - PE PELABLE BLANCO - Libre", "PE PELABLE BLANCO - Libre"),
    freeMaterial("COEX - UHT - Libre", "UHT - Libre"),
  ],

  ALUMINIO: [
    fixedMaterial("ALUMINIO - ALUMINIO - 7", "ALUMINIO - 7", "7", "19"),
    fixedMaterial("ALUMINIO - ALUMINIO - 8", "ALUMINIO - 8", "8", "22"),
    fixedMaterial("ALUMINIO - ALUMINIO - 9", "ALUMINIO - 9", "9", "24.3"),
  ],

  AMPRIMA: [
    fixedMaterial("AMPRIMA - AMPRIMA - 25", "AMPRIMA - 25", "25", "24.6"),
  ],

  PPCAST: [
    fixedMaterial("PPCAST - CAST CRISTAL - 20", "CAST CRISTAL - 20", "20", "18"),
    fixedMaterial("PPCAST - CAST CRISTAL - 25", "CAST CRISTAL - 25", "25", "22.5"),
    fixedMaterial("PPCAST - CAST CRISTAL - 30", "CAST CRISTAL - 30", "30", "27"),
    fixedMaterial("PPCAST - CAST CRISTAL - 60", "CAST CRISTAL - 60", "60", "54.3"),
  ],

  BOPA: [
    fixedMaterial("BOPA - BOPA CRISTAL - 15", "BOPA CRISTAL - 15", "15", "17"),
  ],

  TERMOFORMADOS: [
    fixedMaterial("TERMOFORMADOS - TERMOFORMADO ALTA - 75", "TERMOFORMADO ALTA - 75", "75", "75"),
    fixedMaterial("TERMOFORMADOS - TERMOFORMADO ALTA - 90", "TERMOFORMADO ALTA - 90", "90", "86"),
    fixedMaterial("TERMOFORMADOS - TERMOFORMADO ALTA - 100", "TERMOFORMADO ALTA - 100", "100", "97.5"),
    fixedMaterial("TERMOFORMADOS - TERMOFORMADO ALTA - 110", "TERMOFORMADO ALTA - 110", "110", "105"),
    fixedMaterial("TERMOFORMADOS - TERMOFORMADO ALTA - 150", "TERMOFORMADO ALTA - 150", "150", "145.5"),
    fixedMaterial("TERMOFORMADOS - TERMOFORMADO ALTA - 178", "TERMOFORMADO ALTA - 178", "178", "170.3"),
    fixedMaterial("TERMOFORMADOS - TERMOFORMADO ALTA - 200", "TERMOFORMADO ALTA - 200", "200", "191"),
  ],
};

const MATERIAL_GROUP_OPTIONS = Object.keys(MATERIAL_CATALOG).map(g => ({ value: g, label: g }));

const SALE_TYPE_OPTIONS = [
  { value: "Nacional", label: "Nacional" },
  { value: "Internacional", label: "Internacional" },
];

const INCOTERM_OPTIONS = [
  { value: "EXW", label: "EXW" },
  { value: "FCA", label: "FCA" },
  { value: "FAS", label: "FAS" },
  { value: "FOB", label: "FOB" },
  { value: "CPT", label: "CPT" },
  { value: "CIP", label: "CIP" },
  { value: "CFR", label: "CFR" },
  { value: "CIF", label: "CIF" },
  { value: "DAP", label: "DAP" },
  { value: "DPU", label: "DPU" },
  { value: "DDP", label: "DDP" },
];

const CURRENCY_OPTIONS = [
  { value: "Soles", label: "Soles" },
  { value: "Dólares", label: "Dólares" },
];

const SPECIAL_DESIGN_SPECS_OPTIONS = [
  { value: "Tintas Holográficas", label: "Tintas Holográficas" },
  { value: "Efectos/texturas/características especiales", label: "Efectos/texturas/características especiales" },
  { value: "Acabados Especiales o Barnices nuevos", label: "Acabados Especiales o Barnices nuevos" },
  { value: "Otros (comentar cuáles)", label: "Otros (comentar cuáles)" },
  { value: "No aplica", label: "No aplica" },
];

const DOY_PACK_BASE_OPTIONS = [
  { value: "Redonda", label: "Redonda" },
  { value: "Cuadrada", label: "Cuadrada" },
  { value: "No aplica", label: "No aplica" },
];

const CORE_MATERIAL_OPTIONS = [
  { value: "Cartón", label: "Cartón" },
  { value: "Plástico", label: "Plástico" },
  { value: "Metal", label: "Metal" },
  { value: "Otros", label: "Otros" },
];

const GUSSET_TYPE_OPTIONS = [
  { value: "Lateral", label: "Lateral" },
  { value: "Fondo", label: "Fondo" },
];

const ZIPPER_TYPE_OPTIONS = [
  { value: "Convencional", label: "Convencional" },
  { value: "String Zipper", label: "String Zipper" },
];

const VALVE_TYPE_OPTIONS = [
  { value: "Degasificadora", label: "Degasificadora" },
  { value: "Dosificadora", label: "Dosificadora" },
];

const ROUNDED_CORNERS_TYPE_OPTIONS = [
  { value: "Redondeo esquinas del Fondo", label: "Redondeo esquinas del Fondo" },
  { value: "Redondeo todas las esquinas", label: "Redondeo todas las esquinas" },
];

const POUCH_PERFORATION_TYPE_OPTIONS = [
  { value: "Ojal", label: "Ojal" },
  { value: "Circular", label: "Circular" },
  { value: "Europunch", label: "Europunch" },
];

const BAG_PERFORATION_TYPE_OPTIONS = [
  { value: "Cruz", label: "Cruz" },
  { value: "Media luna", label: "Media luna" },
];

const PERFORATION_LOCATION_OPTIONS = [
  { value: "Delantero", label: "Delantero" },
  { value: "Posterior", label: "Posterior" },
];

const PRECUT_TYPE_OPTIONS = [
  { value: "Pre-corte mecánico abre fácil sectorizado", label: "Pre-corte mecánico abre fácil sectorizado" },
  { value: "Pre-corte mecánico abre fácil", label: "Pre-corte mecánico abre fácil" },
];

const OTHER_ACCESSORIES_OPTIONS = [
  { value: "Pega-pega", label: "Pega-pega" },
  { value: "No aplica", label: "No aplica" },
];

const DESTINATION_COUNTRY_OPTIONS = [
  { value: "Perú", label: "Perú" },
  { value: "Chile", label: "Chile" },
  { value: "Colombia", label: "Colombia" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Portugal", label: "Portugal" },
  { value: "Otro", label: "Otro" },
];

const POUCH_DOY_PACK_REDONDO_FUELLE_PROPIO = "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE PROPIO";
const POUCH_DOY_PACK_DIMENSION_RESTRICTIONS = {
  width: { min: 80, max: 230, label: "Ancho" },
  length: { min: 134, max: 340, label: "Largo" },
  gussetWidth: { min: 0, max: 3, label: "Ancho fuelle" },
} as const;

const DESIGN_PLAN_TYPE_OPTIONS = [
  {
    value: "AI_ZIP_EMPAQUETADO",
    label: "Archivo .ai empaquetado en formato ZIP",
    description: "Guardado con la opción EMPAQUETAR de Illustrator.",
    acceptedExtensions: [".zip"],
    requiresFile: true,
  },
  {
    value: "AI_PDF_FUENTES_LINKS_ZIP",
    label: "Archivos individuales múltiples .ai, .pdf con fuentes y links empaquetados en ZIP",
    description: "Debe cargarse en un archivo ZIP consolidado.",
    acceptedExtensions: [".zip"],
    requiresFile: true,
  },
  {
    value: "AI_PDF_BAJA_ALTA_RESOLUCION",
    label: "Archivos individuales .ai, .pdf baja resolución y .pdf alta resolución",
    description: "Debe incluir fuentes y links correspondientes.",
    acceptedExtensions: [".ai", ".pdf", ".zip"],
    requiresFile: true,
  },
  {
    value: "SOLO_DATOS_SIN_WEBCENTER",
    label: "Solo datos. Archivo de arte no enviado con WebCenter.",
    description: "No se carga archivo de arte. Registrar comentario obligatorio.",
    acceptedExtensions: [],
    requiresFile: false,
  },
];

const STEPS = [
  { label: "Producto" },
  { label: "Diseño" },
  { label: "Estructura" },
  { label: "Embalaje y Empalmes" },
];

const STEP_FIELDS: Record<number, Array<keyof ProjectEditFormData>> = {
  // 0. Producto
  0: [
    "projectName",
    "projectDescription",
    "portfolioCode",
    "classification",
    "projectType",
    "licitacion",
    "customerAdditionalInfo",
    "additionalComment",
    "deliveryAddress",
  ],

  // 2. Diseño
  1: [
    "blueprintFormat",
    "tipoFormatoLamina",
    "tipoPresentacionBolsa",
    "tipoSelloBolsa",
    "acabadoBolsa",
    "tieneFuelleBolsa",
    "tipoFuelleBolsa",
    "hasEdagReference",
    "edagCode",
    "edagVersion",
    "printClass",
    "printType",
    "hasDesignPlan",
    "designPlanType",
    "designPlanComments",
    "designPlanFiles",
    "colorObjectiveCode",
    "colorObjective",
    "colorObjectiveOther",
    "pressApproverCode",
    "pressApprover",
    "alusaReferenceCode",
    "designWorkInstructions",
    "tipoFamiliaPouch",
    "tipoStandUpPouch",
    "formaDoyPackPouch",
    "tipoFuelleStandUpPouch",
    "cantidadSellosPouchPlano",
    "tieneFuelleSelloCentralPouch",
    "materialSelloCentralPouch",
    "tipoSelloEnFuellePouch",
    "specialDesignSpecs",
    "specialDesignComments",
    "perimeterMm",
    "dimensionCrossCheckStatus",
    "perimeterValidationStatus",
    "perimeterComment",
    "rewindingDirection",
    "rewindingDirectionRef",
    "hasPhotocell",
    "photocellLocation",
    "hasPhotoregister1",
    "fr1Width",
    "fr1Height",
    "fr1MarginLeft",
    "fr1MarginRight",
    "fr1MarginTop",
    "fr1MarginBottom",
    "hasPhotoregister2",
    "fr2Width",
    "fr2Height",
    "fr2MarginLeft",
    "fr2MarginRight",
    "fr2MarginTop",
    "fr2MarginBottom",
  ],

  // 3. Estructura
  2: [
    "hasReferenceStructure",
    "referenceEmCode",
    "referenceEmVersion",
    "structureType",

    "layer1MaterialGroup", "layer1Material", "layer1Micron", "layer1Grammage",
    "layer2MaterialGroup", "layer2Material", "layer2Micron", "layer2Grammage",
    "layer3MaterialGroup", "layer3Material", "layer3Micron", "layer3Grammage",
    "layer4MaterialGroup", "layer4Material", "layer4Micron", "layer4Grammage",

    "grammage", "sampleRequest", "specialStructureSpecs",

    "width", "length", "repetition", "doyPackBase", "gussetWidth",

    "hasZipper", "zipperType", "hasTinTie", "hasValve", "valveType",
    "hasDieCutHandle", "hasReinforcement", "reinforcementThickness", "reinforcementWidth",
    "hasAngularCut", "hasRoundedCorners", "roundedCornersType", "hasNotch",
    "hasPerforation", "pouchPerforationType", "bagPerforationType", "perforationLocation",
    "hasPreCut", "preCutType", "otherAccessories",

    "hasCustomerTechnicalSpec", "customerTechnicalSpecAttachment",
    "customerTechnicalSpecFiles", "customerTechnicalSpecComments",

    "coreMaterial", "coreDiameter", "externalDiameter",
    "externalVariationPlus", "externalVariationMinus", "maxRollWeight",
  ],

  // 4. Embalaje y Empalmes
  3: [
    "materialPackaging",
    "specialMaterialPackaging",
    "exportProductPackaging",
    "splices",
  ],
};
const FIELD_LABELS: Partial<Record<keyof ProjectEditFormData, string>> = {
  portfolioCode: "Portafolio base",
  executiveId: "Ejecutivo Comercial",
  projectName: "Nombre del producto",
  projectDescription: "Descripción del producto",

  blueprintFormat: "Formato de plano",

  printClass: "Clase de Impresión",
  printType: "Tipo de Impresión",
  printForm: "Forma de Impresión",

  width: "Ancho",
  length: "Largo",
  repetition: "Repetición",
  gussetWidth: "Ancho Fuelle",

  estimatedVolume: "Cantidad / Volumen estimado",
  unitOfMeasure: "Unidad de medida",
  coreMaterial: "Material del core",
  coreDiameter: "Diámetro core",
  externalDiameter: "Diámetro externo",
  maxRollWeight: "Peso máximo rollo",

  grammage: "Gramaje general (g/m2)",
  sampleRequest: "¿Solicitud de muestra?",
  designPlanFiles: "Planos",
  hasCustomerTechnicalSpec: "¿Tiene Especificación Técnica del Cliente?",
  customerTechnicalSpecAttachment: "Especificación Técnica del Cliente Adjunto",
  customerAdditionalInfo: "Información adicional cliente",
  additionalComment: "Comentario del Ejecutivo Comercial",
  classification: "Clasificación",
  projectType: "Tipo de Producto",

  hasDesignPlan: "¿Tiene plano de diseño?",
  hasEdagReference: "¿Tiene Diseño de referencia?",
  edagCode: "Código EDAG",
  edagVersion: "Versión EDAG",
  colorObjectiveCode: "Objetivo de color",
  colorObjective: "Objetivo de color",
  colorObjectiveOther: "Objetivo de color - otro",
  pressApproverCode: "Aprobador de prensa",
  pressApprover: "Aprobador de prensa",
  alusaReferenceCode: "Código de referencia (ALUSA)",
  designWorkInstructions: "Instrucciones de trabajo para diseño",
  tipoFormatoLamina: "Tipo de Lámina",
  tipoFamiliaPouch: "Familia de pouch",
  tipoStandUpPouch: "Tipo de Stand Up",
  formaDoyPackPouch: "Base Doy Pack",
  tipoFuelleStandUpPouch: "Tipo de fuelle Stand Up",
  cantidadSellosPouchPlano: "Cantidad de sellos del pouch plano",
  tieneFuelleSelloCentralPouch: "¿Tiene fuelle?",
  materialSelloCentralPouch: "Especificación de material",
  tipoSelloEnFuellePouch: "Tipo de sello en fuelle",
  specialDesignSpecs: "Especificaciones Especiales",
  specialDesignComments: "Comentarios de diseños especiales",

  perimeterMm: "Perímetro (mm)",
  dimensionCrossCheckStatus: "Validación de dimensiones",
  perimeterValidationStatus: "Validación de perímetros",
  perimeterComment: "Comentario de perímetro",

  rewindingDirection: "Sentido de bobinado",
  rewindingDirectionRef: "Referencia de sentido",
  hasPhotocell: "¿Tiene fotocelda?",
  photocellLocation: "Ubicación fotocelda",

  hasPhotoregister1: "¿Tiene Fotoregistro 1?",
  fr1Width: "FR1 - Ancho",
  fr1Height: "FR1 - Alto",
  fr1MarginLeft: "FR1 - Margen Izquierdo",
  fr1MarginRight: "FR1 - Margen Derecho",
  fr1MarginTop: "FR1 - Margen Superior",
  fr1MarginBottom: "FR1 - Margen Inferior",

  hasPhotoregister2: "¿Tiene Fotoregistro 2?",
  fr2Width: "FR2 - Ancho",
  fr2Height: "FR2 - Alto",
  fr2MarginLeft: "FR2 - Margen Izquierdo",
  fr2MarginRight: "FR2 - Margen Derecho",
  fr2MarginTop: "FR2 - Margen Superior",
  fr2MarginBottom: "FR2 - Margen Inferior",

  designPlanType: "Tipo de plano",
  designPlanComments: "Comentario de planos / WebCenter",

  customerTechnicalSpecFiles: "Archivos de especificación técnica del cliente",
  customerTechnicalSpecComments: "Comentario de especificación técnica",

  hasReferenceStructure: "¿Tiene estructura de referencia?",
  referenceEmCode: "Código E/M Referencia",
  referenceEmVersion: "Versión E/M",
  structureType: "Tipo de Estructura",

  doyPackBase: "Base Doy Pack",
  gussetType: "Tipo de Fuelle",

  incoterm: "Incoterm",
  destinationCountry: "País Destino",

  externalVariationPlus: "Variación Externa +",
  externalVariationMinus: "Variación Externa -",

  layer1MaterialGroup: "Capa 1 - Grupo Material",
  layer1Material: "Capa 1 - Tipo de Material y Micraje",
  layer1Micron: "Capa 1 - Micraje",
  layer1Grammage: "Capa 1 - Gramaje",

  layer2MaterialGroup: "Capa 2 - Grupo Material",
  layer2Material: "Capa 2 - Tipo de Material y Micraje",
  layer2Micron: "Capa 2 - Micraje",
  layer2Grammage: "Capa 2 - Gramaje",

  layer3MaterialGroup: "Capa 3 - Grupo Material",
  layer3Material: "Capa 3 - Tipo de Material y Micraje",
  layer3Micron: "Capa 3 - Micraje",
  layer3Grammage: "Capa 3 - Gramaje",

  layer4MaterialGroup: "Capa 4 - Grupo Material",
  layer4Material: "Capa 4 - Tipo de Material y Micraje",
  layer4Micron: "Capa 4 - Micraje",
  layer4Grammage: "Capa 4 - Gramaje",

  materialPackaging: "Embalaje de material",
  specialMaterialPackaging: "Embalaje de material especial",
  exportProductPackaging: "Embalaje de Productos de Exportación",
  splices: "Empalmes",

  licitacion: "Licitación",
};
const BASE_REQUIRED_FIELDS: Array<keyof ProjectEditFormData> = [
  // Información General
  "portfolioCode",
  "projectName",
  "projectDescription",

  // Producto Comercial
  "classification",
  "projectType",
  "blueprintFormat",

  // Diseño
  "hasEdagReference",
  "hasDesignPlan",
  "printClass",

  // Condiciones comerciales
  "estimatedVolume",
  "unitOfMeasure",
  "saleType",

  // Estructura
  "grammage",
  "sampleRequest",

  // Especificaciones técnicas
  "hasCustomerTechnicalSpec",
];

const isFieldEmpty = (value: unknown) => {
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || String(value).trim() === "";
};


function shouldShowRepetitionField(wrapping: string, blueprintFormat: string): boolean {
  const normalizedWrapping = normalizeWrappingName(wrapping);
  const normalizedFormat = normalizeOptionValue(blueprintFormat);

  const isBolsa = normalizedWrapping.includes("bolsa");

  const isRepetitionFormat =
    normalizedFormat.includes("tissue") ||
    normalizedFormat.includes("generica") ||
    normalizedFormat.includes("food");

  return isBolsa && isRepetitionFormat;
}

const SALESFORCE_ACTION_PREFIX = "A-";

function normalizeSalesforceAction(value: string): string {
  const rawValue = String(value || "").trim();

  const withoutPrefix = rawValue
    .replace(/^A-/i, "")
    .replace(/\D/g, "")
    .slice(0, 6);

  return withoutPrefix ? `${SALESFORCE_ACTION_PREFIX}${withoutPrefix}` : "";
}

function isValidSalesforceAction(value: string): boolean {
  return /^A-\d{6}$/.test(String(value || "").trim());
}

type ProjectRecordWithExecutives = ProjectRecord & {
  ejecutivoIds?: Array<string | number>;
  ejecutivoNames?: string;
  executiveIds?: Array<string | number>;
  commercialExecutiveIds?: Array<string | number>;
};

function getProjectExecutiveIds(project: ProjectRecord): string[] {
  const projectWithExecutives = project as ProjectRecordWithExecutives;

  const multiIds =
    projectWithExecutives.ejecutivoIds ||
    projectWithExecutives.executiveIds ||
    projectWithExecutives.commercialExecutiveIds;

  if (Array.isArray(multiIds) && multiIds.length > 0) {
    return multiIds.map(String);
  }

  if (project.ejecutivoId !== undefined && project.ejecutivoId !== null) {
    return [String(project.ejecutivoId)];
  }

  return [];
}

// Helper function to normalize form data for comparison
function normalizeComparableProjectForm(form: ProjectEditFormData): Record<string, any> {
  return {
    portfolioCode: form.portfolioCode,
    executiveId: form.executiveId.slice().sort(),
    projectName: form.projectName?.trim() || "",
    projectDescription: form.projectDescription?.trim() || "",
    classification: form.classification,
    projectType: form.projectType,
    salesforceAction: form.salesforceAction,
    blueprintFormat: form.blueprintFormat,
    estimatedVolume: form.estimatedVolume,
    unitOfMeasure: form.unitOfMeasure,
    printClass: form.printClass,
    printType: form.printType,
    hasEdagReference: form.hasEdagReference,
    referenceEdagCode: form.referenceEdagCode,
    referenceEdagVersion: form.referenceEdagVersion,
    specialDesignSpecs: form.specialDesignSpecs?.trim() || "",
    specialDesignComments: form.specialDesignComments?.trim() || "",
    edagCode: form.edagCode,
    edagVersion: form.edagVersion,
    designPlanType: form.designPlanType,
    designPlanComments: form.designPlanComments?.trim() || "",
    designPlanFiles: form.designPlanFiles.slice(),
    colorObjectiveCode: form.colorObjectiveCode,
    colorObjective: form.colorObjective,
    colorObjectiveOther: form.colorObjectiveOther?.trim() || "",
    pressApproverCode: form.pressApproverCode,
    pressApprover: form.pressApprover,
    alusaReferenceCode: form.alusaReferenceCode?.trim() || "",
    designWorkInstructions: form.designWorkInstructions?.trim() || "",
    perimeterMm: form.perimeterMm,
    dimensionCrossCheckStatus: form.dimensionCrossCheckStatus,
    perimeterValidationStatus: form.perimeterValidationStatus,
    perimeterComment: form.perimeterComment?.trim() || "",
    rewindingDirection: form.rewindingDirection,
    rewindingDirectionRef: form.rewindingDirectionRef?.trim() || "",
    hasPhotocell: form.hasPhotocell,
    photocellLocation: form.photocellLocation,
    hasPhotoregister1: form.hasPhotoregister1,
    fr1Width: form.fr1Width,
    fr1Height: form.fr1Height,
    fr1MarginLeft: form.fr1MarginLeft,
    fr1MarginRight: form.fr1MarginRight,
    fr1MarginTop: form.fr1MarginTop,
    fr1MarginBottom: form.fr1MarginBottom,
    hasPhotoregister2: form.hasPhotoregister2,
    fr2Width: form.fr2Width,
    fr2Height: form.fr2Height,
    fr2MarginLeft: form.fr2MarginLeft,
    fr2MarginRight: form.fr2MarginRight,
    fr2MarginTop: form.fr2MarginTop,
    fr2MarginBottom: form.fr2MarginBottom,
    hasReferenceStructure: form.hasReferenceStructure,
    referenceEmCode: form.referenceEmCode,
    referenceEmVersion: form.referenceEmVersion,
    hasCustomerTechnicalSpec: form.hasCustomerTechnicalSpec,
    customerTechnicalSpecAttachment: form.customerTechnicalSpecAttachment,
    customerTechnicalSpecFiles: form.customerTechnicalSpecFiles.slice(),
    customerTechnicalSpecComments: form.customerTechnicalSpecComments?.trim() || "",
    structureType: form.structureType,
    layer1MaterialGroup: form.layer1MaterialGroup,
    layer1Material: form.layer1Material,
    layer1Micron: form.layer1Micron,
    layer1Grammage: form.layer1Grammage,
    layer2MaterialGroup: form.layer2MaterialGroup,
    layer2Material: form.layer2Material,
    layer2Micron: form.layer2Micron,
    layer2Grammage: form.layer2Grammage,
    layer3MaterialGroup: form.layer3MaterialGroup,
    layer3Material: form.layer3Material,
    layer3Micron: form.layer3Micron,
    layer3Grammage: form.layer3Grammage,
    layer4MaterialGroup: form.layer4MaterialGroup,
    layer4Material: form.layer4Material,
    layer4Micron: form.layer4Micron,
    layer4Grammage: form.layer4Grammage,
    specialStructureSpecs: form.specialStructureSpecs?.trim() || "",
    grammage: form.grammage,
    sampleRequest: form.sampleRequest,
    width: form.width,
    length: form.length,
    repetition: form.repetition,
    doyPackBase: form.doyPackBase,
    gussetWidth: form.gussetWidth,
    gussetType: form.gussetType,
    hasZipper: form.hasZipper,
    zipperType: form.zipperType,
    hasTinTie: form.hasTinTie,
    hasValve: form.hasValve,
    valveType: form.valveType,
    hasDieCutHandle: form.hasDieCutHandle,
    hasReinforcement: form.hasReinforcement,
    reinforcementThickness: form.reinforcementThickness,
    reinforcementWidth: form.reinforcementWidth,
    hasAngularCut: form.hasAngularCut,
    hasRoundedCorners: form.hasRoundedCorners,
    roundedCornersType: form.roundedCornersType,
    hasNotch: form.hasNotch,
    hasPerforation: form.hasPerforation,
    pouchPerforationType: form.pouchPerforationType,
    bagPerforationType: form.bagPerforationType,
    perforationLocation: form.perforationLocation,
    hasPreCut: form.hasPreCut,
    preCutType: form.preCutType,
    otherAccessories: form.otherAccessories,
    materialPackaging: form.materialPackaging,
    specialMaterialPackaging: form.specialMaterialPackaging,
    exportProductPackaging: form.exportProductPackaging,
    splices: form.splices,
    saleType: form.saleType,
    incoterm: form.incoterm,
    destinationCountry: form.destinationCountry,
    targetPrice: form.targetPrice,
    currencyType: form.currencyType,
    coreMaterial: form.coreMaterial,
    coreDiameter: form.coreDiameter,
    externalDiameter: form.externalDiameter,
    externalVariationPlus: form.externalVariationPlus,
    externalVariationMinus: form.externalVariationMinus,
    maxRollWeight: form.maxRollWeight,
    customerAdditionalInfo: form.customerAdditionalInfo?.trim() || "",
    deliveryAddress: form.deliveryAddress?.trim() || "",
    additionalComment: form.additionalComment?.trim() || "",
    licitacion: form.licitacion,
  };
}

// Helper function to check if there are unsaved changes
function hasUnsavedChanges(
  initialFormState: Record<string, any>,
  currentForm: ProjectEditFormData
): boolean {
  const normalized = normalizeComparableProjectForm(currentForm);
  return JSON.stringify(initialFormState) !== JSON.stringify(normalized);
}

// Badge component for inherited and SI fields
interface FieldBadgesProps {
  isInherited?: boolean;
  isSiField?: boolean;
  isLocked?: boolean;
}

function FieldBadges({ isInherited, isSiField, isLocked }: FieldBadgesProps) {
  if (!isInherited && !isSiField && !isLocked) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {isInherited && (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
          Heredado del producto base
        </span>
      )}
      {isSiField && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          Campo SI
        </span>
      )}
      {isLocked && (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
          Bloqueado por MOT
        </span>
      )}
    </div>
  );
}

// Wrapper for FormInput with MOT/FDP visibility and badges
interface FormInputWithBadgesProps {
  fieldName: keyof ProjectEditFormData;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  mot?: string | null;
  blueprintFormat?: string | null;
  inheritedFields?: Set<string>;
  visibilityOverride?: boolean;
}

function FormInputWithBadges({
  fieldName,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled = false,
  mot = null,
  blueprintFormat = null,
  inheritedFields = new Set(),
  visibilityOverride = true,
}: FormInputWithBadgesProps) {
  const isInherited = inheritedFields.has(fieldName as string);
  const isLocked = shouldFieldBeDisabled(fieldName as string, mot, inheritedFields);
  const isSi = isSiField(fieldName as string, blueprintFormat);
  const isVisible = visibilityOverride || shouldFieldBeVisible(fieldName as string, mot, blueprintFormat);

  if (!isVisible) return null;

  return (
    <div>
      <FormInput
        label={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        error={error}
        disabled={disabled || isLocked}
      />
      <FieldBadges isInherited={isInherited} isSiField={isSi} isLocked={isLocked} />
    </div>
  );
}

/**
 * MOT (Motivo de Modificación) & FDP (Formato de Plano) Integration Guide
 *
 * This component integrates three key visibility/editability systems:
 *
 * 1. MOT System (Casuísticas):
 *    - MOT_FIELD_RULES defines which field groups are editable, locked, or visible per casuística
 *    - FIELD_TO_EDITABLE_GROUP maps each form field to its editable group
 *    - isFieldEditableByMot() checks if a field can be edited based on MOT
 *    - isFieldLockedByMot() checks if a field is locked by MOT
 *    - inheritedFields Set<string> tracks fields auto-filled from base product
 *    - Inherited fields are displayed with "Heredado del producto base" badge
 *
 * 2. FDP System (Blueprint Format):
 *    - FORMAT_FIELD_RULES_BY_FDP defines which fields are visible/required per FDP
 *    - isFieldVisibleByFormat() checks field visibility based on FDP
 *    - isSiField() determines if a field is sent to Sistema Integral
 *    - Fields can have "Campo SI" badge when they're SI fields
 *
 * 3. Field Display Pattern:
 *    For each form field, add:
 *    - FieldBadges component to show inheritance/SI status
 *    - shouldFieldBeDisabled() check for MOT-based disability
 *    - Example in width/length/gussetWidth fields (see lines 5014-5070)
 *
 * To apply this pattern to a new field:
 *    <div>
 *      <FormInput
 *        label="Field Label"
 *        value={form.fieldName}
 *        onChange={(value) => updateField("fieldName", value)}
 *        disabled={existingDisabledLogic || shouldFieldBeDisabled("fieldName", form.projectType, inheritedFields)}
 *      />
 *      <FieldBadges
 *        isInherited={inheritedFields.has("fieldName")}
 *        isSiField={isSiField("fieldName", form.blueprintFormat)}
 *        isLocked={isFieldLockedByMot("fieldName", form.projectType)}
 *      />
 *    </div>
 */

const normalizeRouteIdentifier = (value: unknown) =>
  decodeURIComponent(String(value ?? ""))
    .trim()
    .toLowerCase();

const getProductIdentifiers = (product: any) => {
  const normalizedProduct = normalizeProjectWorkflow(product);

  return [
    // Registro original
    product.code,
    product.projectCode,
    product.productRequestCode,
    product.id,
    product.productId,
    product.productCode,
    product.currentSkuCode,
    product.skuCode,
    product.siProductCode,

    // Compatibilidad con normalizado
    normalizedProduct.code,
    (normalizedProduct as any).projectCode,
    (normalizedProduct as any).productRequestCode,
    (normalizedProduct as any).id,
    (normalizedProduct as any).productId,
    (normalizedProduct as any).productCode,
    (normalizedProduct as any).currentSkuCode,
    (normalizedProduct as any).skuCode,
    (normalizedProduct as any).siProductCode,
  ]
    .filter(Boolean)
    .map(normalizeRouteIdentifier);
};

const findProductByRouteParam = (
  products: ProjectRecord[],
  routeParam: string
): ProjectRecord | undefined => {
  const normalizedParam = normalizeRouteIdentifier(routeParam);

  if (!normalizedParam) return undefined;

  return products.find((product) =>
    getProductIdentifiers(product).includes(normalizedParam)
  );
};

// ============ SKU Validation and Resolution Helpers ============

const SKU_CODE_PATTERN = /^SKU-\d{5}-[EBAI]-\d{2}$/;

function isValidSkuDisplayCode(value: unknown): boolean {
  return SKU_CODE_PATTERN.test(String(value ?? "").trim().toUpperCase());
}

function resolveProjectSkuCode(project: ProjectRecord | null | undefined): string {
  if (!project) return "";

  const source = project as Record<string, unknown>;

  const candidates = [
    source.skuCode,
    source.currentSkuCode,
    source.productCode,
    source.codigoSku,
    source.codigoProductoOdiseo,
    source.codigoProducto,
    // Don't use source.code as it might be PRJ-...
  ];

  const validSku = candidates
    .map((value) => String(value ?? "").trim().toUpperCase())
    .find((value) => isValidSkuDisplayCode(value));

  return validSku || "";
}

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const { productCode } = useParams<{ productCode: string }>();
  const projectCode = productCode;

  const [form, setForm] = useState<ProjectEditFormData>({
    code: "",
    status: "",
    portfolioCode: "",
    executiveId: [],
    projectName: "",
    projectDescription: "",
    classification: "",
    subClassification: "",
    projectType: "",
    motivoModificacion: "",
    salesforceAction: "",
    designPlanType: "",
    designPlanComments: "",
    blueprintFormat: "",
    tipoPresentacionBolsa: "",
    tipoSelloBolsa: "",
    acabadoBolsa: "",
    tieneFuelleBolsa: "",
    tipoFuelleBolsa: "",
    tipoFormatoLamina: "",
    tipoFamiliaPouch: "",
    tipoStandUpPouch: "",
    formaDoyPackPouch: "",
    tipoFuelleStandUpPouch: "",
    cantidadSellosPouchPlano: "",
    tieneFuelleSelloCentralPouch: "",
    materialSelloCentralPouch: "",
    tipoSelloEnFuellePouch: "",
    estimatedVolume: "",
    unitOfMeasure: "",
    technicalApplication: "",
    portafolioEstandar: "",
    approvedProductCode: "",
    customerPackingCode: "",
    printClass: "",
    printType: "",
    printForm: "",
    designAreaWidth: "",
    designAreaHeight: "",
    coPrinting: "",
    codesToPrint: "",
    rewindingDirection: "",
    rewindingDirectionRef: "",
    hasPhotocell: "",
    photocellLocation: "",
    fr1Width: "",
    fr1Height: "",
    fr1MarginRight: "",
    fr1MarginBottom: "",
    fr1MarginLeft: "",
    fr1MarginTop: "",
    fr2Width: "",
    fr2Height: "",
    fr2MarginRight: "",
    fr2MarginBottom: "",
    fr2MarginLeft: "",
    fr2MarginTop: "",
    hasDesignPlan: "",
    hasEdagReference: "",
    referenceEdagCode: "",
    referenceEdagVersion: "",
    specialDesignSpecs: "No aplica",
    specialDesignComments: "",
    edagCode: "",
    edagVersion: "",
    colorObjectiveCode: "",
    colorObjective: "",
    colorObjectiveOther: "",
    pressApproverCode: "",
    pressApprover: "",
    alusaReferenceCode: "",
    designWorkInstructions: "",
    perimeterMm: "",
    dimensionCrossCheckStatus: "",
    perimeterValidationStatus: "",
    perimeterComment: "",
    hasPhotoregister1: "",
    hasPhotoregister2: "",
    hasReferenceStructure: "",
    referenceEmCode: "",
    referenceEmVersion: "",
    hasCustomerTechnicalSpec: "",
    customerTechnicalSpecAttachment: "",
    customerTechnicalSpecFiles: [],
    customerTechnicalSpecComments: "",
    structureType: "",
    layer1MaterialGroup: "",
    layer1Material: "",
    layer1Micron: "",
    layer1Grammage: "",
    layer2MaterialGroup: "",
    layer2Material: "",
    layer2Micron: "",
    layer2Grammage: "",
    layer3MaterialGroup: "",
    layer3Material: "",
    layer3Micron: "",
    layer3Grammage: "",
    layer4MaterialGroup: "",
    layer4Material: "",
    layer4Micron: "",
    layer4Grammage: "",
    specialStructureSpecs: "",
    grammageTolerance: "",
    grammage: "",
    sampleRequest: "",
    width: "",
    length: "",
    repetition: "",
    doyPackBase: "",
    doyPackRepeticionExacta: "",
    toleranciaRepExactaDoyPack: "",
    toleranciaRepDoyPack: "",
    fuelleCerrado: "",
    selloAnchoLateral: "",
    gussetWidth: "",
    gussetType: "",
    hasMicroperforado: "",
    ladoMicroperforado: "",
    separacionPuas: "",
    distanciaLadoPouch: "",
    distanciaAbocaZipper: "",
    distanciaAbocaValvula: "",
    hasZipper: "",
    zipperType: "",
    hasTinTie: "",
    hasValve: "",
    valveType: "",
    hasRiñonera: "",
    hasWicket: "",
    wicketDiameter: "",
    wicketDistSuperior: "",
    wicketDistDerecho: "",
    hasWicketControl: "",
    wicketControlDiameter: "",
    wicketControlUbicacion: "",
    wicketControlDistSuperior: "",
    wicketControlDistDerecho: "",
    anchoSolapa: "",
    hasCortaAliviador: "",
    cortaAliviadorDistDerecho: "",
    hasDispensador: "",
    dispensadorDistIzquierdo: "",
    hasFotocelulaBolsaWicket: "",
    hasPrecorteWicket: "",
    precorteWicketLargo: "",
    precorteWicketUbicacion: "",
    precorteWicketDistDerecho: "",
    hasDieCutHandle: "",
    hasReinforcement: "",
    reinforcementThickness: "",
    reinforcementWidth: "",
    ladoCorteAngular: "",
    distanciaAbocaMuesca: "",
    hasAngularCut: "",
    hasRoundedCorners: "",
    roundedCornersType: "",
    hasNotch: "",
    distanciaAbocaPerforacion: "",
    hasPerforation: "",
    pouchPerforationType: "",
    bagPerforationType: "",
    perforationLocation: "",
    tipoPerfPouchSelloCentral: "",
    tipoPerfFuelleBolsaWicket: "",
    perforacionParaAire: "",
    perforacionFugaAire: "",
    distMargenSuperiorPerforacion: "",
    distFuellePerforacion: "",
    hasPreCut: "",
    preCutType: "",
    distanciaAbocaPrecorte: "",
    precutFuelleAbreFacil: "",
    precutFuelleA10mm: "",
    otherAccessories: "",
    materialPackaging: "",
    specialMaterialPackaging: "",
    exportProductPackaging: "",
    splices: "",
    saleType: "",
    incoterm: "",
    destinationCountry: "",
    targetPrice: "",
    currencyType: "",
    coreMaterial: "",
    coreDiameter: "",
    externalDiameter: "",
    externalVariationPlus: "",
    externalVariationMinus: "",
    maxRollWeight: "",
    customerAdditionalInfo: "",
    deliveryAddress: "",
    additionalComment: "",
    licitacion: "",
    designPlanFiles: [],
    // SKU codes
    skuCode: "",
    currentSkuCode: "",
    productCode: "",
    skuSequence: "",
    skuLifecycleCode: "",
    skuVersion: "",
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof ProjectEditFormData, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [originalProject, setOriginalProject] = useState<ProjectRecord | null>(null);
  const [initialClassification, setInitialClassification] = useState<"Nuevo" | "Modificado" | "">("");
  const [initialProjectType, setInitialProjectType] = useState("");
  const [initialVolume, setInitialVolume] = useState("");
  const [initialUnit, setInitialUnit] = useState("");
  const [initialDescription, setInitialDescription] = useState("");
  const [showValidationSuccessModal, setShowValidationSuccessModal] = useState(false);
  const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
  const [showInheritedDataModal, setShowInheritedDataModal] = useState(false);
  const [openStructureSections, setOpenStructureSections] = useState({
    specs: true,
    dimensions: true,
    documents: true,
  });
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [visibleLayerCount, setVisibleLayerCount] = useState(1);
  const [inheritedFields, setInheritedFields] = useState<Set<string>>(new Set());
  const allowIncompleteSaveRef = useRef(false);
  const initialFormStateRef = useRef<Record<string, any> | null>(null);

  const toggleStructureSection = (section: "specs" | "dimensions" | "documents") => {
    setOpenStructureSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const portfolios = useMemo(() => getPortfolioDisplayRecords(), []);
  const executives = useMemo(() => getActiveExecutiveRecords(), []);

  // Obtener opciones de Clasificación desde TABMODPRODODISEO
  const classificationOpt = useMemo(() => {
    return getActiveProductClassificationOptions();
  }, []);
  const subclassificationOpt = useMemo(() => getCatalogOptions("subclassification"), []);
  // unitOfMeasureOpt removed - using UNIT_OPTIONS from PRODUCT_CATALOGS directly
  const printClassOpt = useMemo(() => getCatalogOptions("print_class"), []);
  const printTypeOpt = useMemo(() => getCatalogOptions("print_type"), []);
  const structureTypeOpt = useMemo(() => getCatalogOptions("structure_type"), []);
  const saleTypeOpt = useMemo(() => getCatalogOptions("sale_type"), []);
  const incotermOpt = useMemo(() => getCatalogOptions("incoterm"), []);
  const countryOpt = useMemo(() => getCatalogOptions("destination_country"), []);
  const currencyOpt = useMemo(() => getCatalogOptions("currency"), []);
  const zipperTypeOpt = useMemo(() => getCatalogOptions("zipper_type"), []);
  const valveTypeOpt = useMemo(() => getCatalogOptions("valve_type"), []);
  const roundedCornersOpt = useMemo(() => getCatalogOptions("rounded_corners_type"), []);
  const pouchPerforationOpt = useMemo(() => getCatalogOptions("pouch_perforation_type"), []);
  const bagPerforationOpt = useMemo(() => getCatalogOptions("bag_perforation_type"), []);
  const precutTypeOpt = useMemo(() => getCatalogOptions("precut_type"), []);
  const coreMaterialOpt = useMemo(() => getCatalogOptions("core_material"), []);

  // Resolve and display SKU code
  const displaySkuCode = useMemo(() => {
    const fromForm =
      form.skuCode ||
      form.currentSkuCode ||
      form.productCode;

    if (isValidSkuDisplayCode(fromForm)) {
      return String(fromForm).trim().toUpperCase();
    }

    const fromOriginal = resolveProjectSkuCode(originalProject);

    if (isValidSkuDisplayCode(fromOriginal)) {
      return fromOriginal;
    }

    return "";
  }, [
    form.skuCode,
    form.currentSkuCode,
    form.productCode,
    originalProject,
  ]);

  // Calculate ODISEO status
  const odiseoStatus = useMemo(() => {
    return getProductOdiseoStatus(originalProject);
  }, [originalProject]);

  useEffect(() => {
    if (!projectCode) {
      setLoading(false);
      return;
    }

const allProjects = getProjectRecords();
const decodedProjectCode = decodeURIComponent(projectCode);

const project =
  findProductByRouteParam(allProjects, decodedProjectCode) ||
  getProjectByCode(decodedProjectCode) ||
  getProjectByCode(projectCode);

if (!project) {
  console.warn("[ProductEditPage] Producto no encontrado", {
    routeProductCode: projectCode,
    decodedProjectCode,
    availableIdentifiers: allProjects.map((product: any) => ({
      name: product.projectName || product.productName || product.name,
      identifiers: getProductIdentifiers(product),
    })),
  });

  setLoading(false);
  return;
}
    if (!project) {
      setLoading(false);
      return;
    }

    setOriginalProject(project);

    const toYesNo = (val: any) => {
      if (val === true || val === "Sí" || val === "Si") return "Sí";
      if (val === false || val === "No" || val === null || val === undefined) return "No";
      return val;
    };

    const initialClassification = normalizeInitialClassification(project);
    const initialProjectType = resolveInitialProjectType(project);
    const initialDescription = resolveInitialProjectDescription(project);
    const initialVolume = resolveInitialVolume(project);
    const initialUnit = resolveInitialUnit(project);

    const shouldGoGraphicArts = goesToGraphicArts(
      initialClassification,
      initialProjectType,
    );

    const shouldBeNewDesign = isDisenoNuevo(
      initialClassification,
      initialProjectType,
    );

    // Resolve SKU code from multiple possible fields
    const resolvedSkuCode = resolveProjectSkuCode(project);
    const skuParts = resolvedSkuCode ? resolvedSkuCode.split("-") : [];

    const convertedForm: ProjectEditFormData = {
      code: resolvedSkuCode || project.code || "",
      status: project.status || "",
      portfolioCode: project.portfolioCode || "",
      executiveId: getProjectExecutiveIds(project),
      projectName: project.projectName || "",
      projectDescription: initialDescription || project.projectDescription || "",
      classification: initialClassification || project.classification || "",
      subClassification: (project as any).subClassification || "",
      projectType: initialProjectType || project.projectType || "",
      motivoModificacion: (project as any).motivoModificacion || "",
      salesforceAction: normalizeSalesforceAction(project.salesforceAction || ""),
      blueprintFormat: project.blueprintFormat || "",
      tipoPresentacionBolsa: (project as any).tipoPresentacionBolsa || "",
      tipoSelloBolsa: (project as any).tipoSelloBolsa || "",
      acabadoBolsa: (project as any).acabadoBolsa || "",
      tieneFuelleBolsa: (project as any).tieneFuelleBolsa || "",
      tipoFuelleBolsa: (project as any).tipoFuelleBolsa || "",
      tipoFormatoLamina: (project as any).tipoFormatoLamina || "",
      tipoFamiliaPouch: (project as any).tipoFamiliaPouch || "",
      tipoStandUpPouch: (project as any).tipoStandUpPouch || "",
      formaDoyPackPouch: (project as any).formaDoyPackPouch || "",
      tipoFuelleStandUpPouch: (project as any).tipoFuelleStandUpPouch || "",
      cantidadSellosPouchPlano: (project as any).cantidadSellosPouchPlano || "",
      tieneFuelleSelloCentralPouch: (project as any).tieneFuelleSelloCentralPouch || "",
      materialSelloCentralPouch: (project as any).materialSelloCentralPouch || "",
      tipoSelloEnFuellePouch: (project as any).tipoSelloEnFuellePouch || "",
      estimatedVolume: initialVolume || project.estimatedVolume || "",
      unitOfMeasure: initialUnit || project.unitOfMeasure || "KGS",
      technicalApplication: (project as any).technicalApplication || "",
      portafolioEstandar: (project as any).portafolioEstandar || "",
      approvedProductCode: (project as any).approvedProductCode || "",
      customerPackingCode: (project as any).customerPackingCode || "",
      printClass: project.printClass || "",
      printType: project.printType || "",
      printForm: (project as any).printForm || "",
      designAreaWidth: (project as any).designAreaWidth || "",
      designAreaHeight: (project as any).designAreaHeight || "",
      coPrinting: (project as any).coPrinting || "",
      codesToPrint: (project as any).codesToPrint || "",
      rewindingDirection: (project as any).rewindingDirection || "",
      rewindingDirectionRef: (project as any).rewindingDirectionRef || "",
      hasPhotocell: toYesNo((project as any).hasPhotocell),
      photocellLocation: (project as any).photocellLocation || "",
      fr1Width: (project as any).fr1Width || "",
      fr1Height: (project as any).fr1Height || "",
      fr1MarginRight: (project as any).fr1MarginRight || "",
      fr1MarginBottom: (project as any).fr1MarginBottom || "",
      fr1MarginLeft: (project as any).fr1MarginLeft || "",
      fr1MarginTop: (project as any).fr1MarginTop || "",
      fr2Width: (project as any).fr2Width || "",
      fr2Height: (project as any).fr2Height || "",
      fr2MarginRight: (project as any).fr2MarginRight || "",
      fr2MarginBottom: (project as any).fr2MarginBottom || "",
      fr2MarginLeft: (project as any).fr2MarginLeft || "",
      fr2MarginTop: (project as any).fr2MarginTop || "",
      hasDesignPlan: toYesNo((project as any).hasDesignPlan),
      hasEdagReference: shouldBeNewDesign
        ? "No"
        : toYesNo(
            (project as any).hasEdagReference ??
            project.isPreviousDesign ??
            (project as any).isPreviousDesign
          ),
      referenceEdagCode: project.previousEdagCode || "",
      referenceEdagVersion: project.previousEdagVersion || "",
      specialDesignSpecs: project.specialDesignSpecs || "No aplica",
      specialDesignComments: project.specialDesignComments || "",
      edagCode: project.edagCode || "",
      edagVersion: project.edagVersion || "",
      designPlanType: (project as any).designPlanType || "",
      designPlanComments: (project as any).designPlanComments || "",
      colorObjectiveCode: getAnyProjectValue(project, [
        "colorObjectiveCode",
        "objetivoColorCodigo",
      ]),
      colorObjective: getAnyProjectValue(project, [
        "colorObjective",
        "objetivoColor",
      ]),
      colorObjectiveOther: getAnyProjectValue(project, [
        "colorObjectiveOther",
        "objetivoColorOtro",
      ]),
      pressApproverCode: getAnyProjectValue(project, [
        "pressApproverCode",
        "aprobadorPrensaCodigo",
      ]),
      pressApprover: getAnyProjectValue(project, [
        "pressApprover",
        "aprobadorPrensa",
      ]),
      alusaReferenceCode: getAnyProjectValue(project, [
        "alusaReferenceCode",
        "codigoReferenciaAlusa",
      ]),
      designWorkInstructions: getAnyProjectValue(project, [
        "designWorkInstructions",
        "instruccionesTrabajoDiseno",
      ]),
      perimeterMm: (project as any).perimeterMm || "",
      dimensionCrossCheckStatus: (project as any).dimensionCrossCheckStatus || "",
      perimeterValidationStatus: (project as any).perimeterValidationStatus || "",
      perimeterComment: (project as any).perimeterComment || "",
      hasPhotoregister1: (project as any).hasPhotoregister1 || "",
      hasPhotoregister2: (project as any).hasPhotoregister2 || "",
      hasReferenceStructure: toYesNo(project.hasReferenceStructure),
      referenceEmCode: project.referenceEmCode || "",
      referenceEmVersion: project.referenceEmVersion || "",
      hasCustomerTechnicalSpec: toYesNo((project as any).hasCustomerTechnicalSpec),
      customerTechnicalSpecAttachment: (project as any).customerTechnicalSpecAttachment || "",
      customerTechnicalSpecFiles: (project as any).customerTechnicalSpecFiles || [],
      customerTechnicalSpecComments: (project as any).customerTechnicalSpecComments || "",
      // CORRECCIÓN: Usar resolver para structureType (puede venir como estructuraCalculada desde modal)
      structureType: resolveInitialStructureType(project) || "Monocapa",
      // CORRECCIÓN: Intentar cargar material group si viene del modal (ProductInitialCreateModal guarda esto)
      layer1MaterialGroup: (project as any).layer1MaterialGroup || extractMaterialGroupFromValue(project.layer1Material || (project as any).layer1MaterialLabel || ""),
      layer1Material: project.layer1Material || (project as any).layer1MaterialLabel || "",
      layer1Micron: project.layer1Micron || (project as any).layer1Micraje || "",
      layer1Grammage: project.layer1Grammage || "",
      // CORRECCIÓN: Material groups con fallback a extracción
      layer2MaterialGroup: (project as any).layer2MaterialGroup || extractMaterialGroupFromValue(project.layer2Material || (project as any).layer2MaterialLabel || ""),
      layer2Material: project.layer2Material || (project as any).layer2MaterialLabel || "",
      layer2Micron: project.layer2Micron || (project as any).layer2Micraje || "",
      layer2Grammage: project.layer2Grammage || "",
      layer3MaterialGroup: (project as any).layer3MaterialGroup || extractMaterialGroupFromValue(project.layer3Material || (project as any).layer3MaterialLabel || ""),
      layer3Material: project.layer3Material || (project as any).layer3MaterialLabel || "",
      layer3Micron: project.layer3Micron || (project as any).layer3Micraje || "",
      layer3Grammage: project.layer3Grammage || "",
      layer4MaterialGroup: (project as any).layer4MaterialGroup || extractMaterialGroupFromValue(project.layer4Material || (project as any).layer4MaterialLabel || ""),
      layer4Material: project.layer4Material || (project as any).layer4MaterialLabel || "",
      layer4Micron: project.layer4Micron || (project as any).layer4Micraje || "",
      layer4Grammage: project.layer4Grammage || "",
      specialStructureSpecs: project.specialStructureSpecs || "",
      grammageTolerance: (project as any).grammageTolerance || "",
      grammage: project.grammage || "",
      sampleRequest: toYesNo(project.sampleRequest),
      width: project.width || "",
      length: project.length || "",
      repetition: project.repetition || "",
      doyPackBase: project.doyPackBase || "",
      doyPackRepeticionExacta: (project as any).doyPackRepeticionExacta || "",
      toleranciaRepExactaDoyPack: (project as any).toleranciaRepExactaDoyPack || "",
      toleranciaRepDoyPack: (project as any).toleranciaRepDoyPack || "",
      fuelleCerrado: toYesNo((project as any).fuelleCerrado),
      selloAnchoLateral: (project as any).selloAnchoLateral || "",
      gussetWidth: project.gussetWidth || "",
      gussetType: project.gussetType || "",
      hasMicroperforado: toYesNo((project as any).hasMicroperforado),
      ladoMicroperforado: (project as any).ladoMicroperforado || "",
      separacionPuas: (project as any).separacionPuas || "",
      distanciaLadoPouch: (project as any).distanciaLadoPouch || "",
      distanciaAbocaZipper: (project as any).distanciaAbocaZipper || "",
      distanciaAbocaValvula: (project as any).distanciaAbocaValvula || "",
      hasZipper: toYesNo(project.hasZipper),
      zipperType: project.zipperType || "",
      hasTinTie: toYesNo(project.hasTinTie),
      hasValve: toYesNo(project.hasValve),
      valveType: project.valveType || "",
      hasRiñonera: toYesNo((project as any).hasRiñonera),
      hasWicket: toYesNo((project as any).hasWicket),
      wicketDiameter: (project as any).wicketDiameter || "",
      wicketDistSuperior: (project as any).wicketDistSuperior || "",
      wicketDistDerecho: (project as any).wicketDistDerecho || "",
      hasWicketControl: toYesNo((project as any).hasWicketControl),
      wicketControlDiameter: (project as any).wicketControlDiameter || "",
      wicketControlUbicacion: (project as any).wicketControlUbicacion || "",
      wicketControlDistSuperior: (project as any).wicketControlDistSuperior || "",
      wicketControlDistDerecho: (project as any).wicketControlDistDerecho || "",
      anchoSolapa: (project as any).anchoSolapa || "",
      hasCortaAliviador: toYesNo((project as any).hasCortaAliviador),
      cortaAliviadorDistDerecho: (project as any).cortaAliviadorDistDerecho || "",
      hasDispensador: toYesNo((project as any).hasDispensador),
      dispensadorDistIzquierdo: (project as any).dispensadorDistIzquierdo || "",
      hasFotocelulaBolsaWicket: toYesNo((project as any).hasFotocelulaBolsaWicket),
      hasPrecorteWicket: toYesNo((project as any).hasPrecorteWicket),
      precorteWicketLargo: (project as any).precorteWicketLargo || "",
      precorteWicketUbicacion: (project as any).precorteWicketUbicacion || "",
      precorteWicketDistDerecho: (project as any).precorteWicketDistDerecho || "",
      hasDieCutHandle: toYesNo(project.hasDieCutHandle),
      hasReinforcement: toYesNo(project.hasReinforcement),
      reinforcementThickness: project.reinforcementThickness || "",
      reinforcementWidth: project.reinforcementWidth || "",
      ladoCorteAngular: (project as any).ladoCorteAngular || "",
      distanciaAbocaMuesca: (project as any).distanciaAbocaMuesca || "",
      hasRoundedCorners: toYesNo(project.hasRoundedCorners),
      roundedCornersType: project.roundedCornersType || "",
      hasNotch: toYesNo(project.hasNotch),
      distanciaAbocaPerforacion: (project as any).distanciaAbocaPerforacion || "",
      hasPerforation: toYesNo(project.hasPerforation),
      pouchPerforationType: project.pouchPerforationType || "",
      bagPerforationType: project.bagPerforationType || "",
      perforationLocation: project.perforationLocation || "",
      tipoPerfPouchSelloCentral: (project as any).tipoPerfPouchSelloCentral || "",
      tipoPerfFuelleBolsaWicket: (project as any).tipoPerfFuelleBolsaWicket || "",
      perforacionParaAire: toYesNo((project as any).perforacionParaAire),
      perforacionFugaAire: toYesNo((project as any).perforacionFugaAire),
      distMargenSuperiorPerforacion: (project as any).distMargenSuperiorPerforacion || "",
      distFuellePerforacion: (project as any).distFuellePerforacion || "",
      hasAngularCut: toYesNo(project.hasAngularCut),
      hasPreCut: toYesNo(project.hasPreCut),
      preCutType: project.preCutType || "",
      distanciaAbocaPrecorte: (project as any).distanciaAbocaPrecorte || "",
      precutFuelleAbreFacil: toYesNo((project as any).precutFuelleAbreFacil),
      precutFuelleA10mm: toYesNo((project as any).precutFuelleA10mm),
      otherAccessories: project.otherAccessories || "",
      materialPackaging: (project as any).materialPackaging || "",
      specialMaterialPackaging: (project as any).specialMaterialPackaging || "",
      exportProductPackaging: (project as any).exportProductPackaging || "",
      splices: (project as any).splices || "",
      saleType: project.saleType || "Nacional",
      incoterm: project.incoterm || "No aplica",
      destinationCountry: project.destinationCountry || "Perú",
      targetPrice: project.targetPrice || "",
      currencyType: project.currencyType || "Soles",
      coreMaterial: project.coreMaterial || "",
      coreDiameter: project.coreDiameter || "",
      externalDiameter: project.externalDiameter || "",
      externalVariationPlus: project.externalVariationPlus || "",
      externalVariationMinus: project.externalVariationMinus || "",
      maxRollWeight: project.maxRollWeight || "",
      customerAdditionalInfo: project.customerAdditionalInfo || "",
      deliveryAddress: (project as any).deliveryAddress || "",
      // CORRECCIÓN: Usar resolver para comentarios (puede venir como "comentarios" desde modal)
      additionalComment: resolveInitialComment(project),
      licitacion: toYesNo((project as any).licitacion),
      designPlanFiles: (project as any).designPlanFiles || [],
      // SKU codes
      skuCode: (project as any).skuCode || resolvedSkuCode || "",
      currentSkuCode: (project as any).currentSkuCode || resolvedSkuCode || "",
      productCode: (project as any).productCode || resolvedSkuCode || "",
      skuSequence: String((project as any).skuSequence || skuParts[1] || ""),
      skuLifecycleCode: (project as any).skuLifecycleCode || skuParts[2] || "E",
      skuVersion: String((project as any).skuVersion || skuParts[3] || ""),
    };

    // Apply MOT-based autofill for modified products
    const motRule = getMotRule(convertedForm.motivoModificacion);
    const inheritedFieldsSet = new Set<string>();

    if (
      initialClassification === "Modificado" &&
      motRule &&
      requiresBaseProductAutofill(convertedForm.motivoModificacion) &&
      project.approvedProductSnapshot
    ) {
      const baseProduct = project.approvedProductSnapshot as Record<string, any>;
      const editableFieldGroups = motRule.editableFieldGroups;

      // Only autofill fields that are NOT in editableFieldGroups (i.e., they're inherited/locked)
      for (const [fieldName, groupName] of Object.entries(FIELD_TO_EDITABLE_GROUP)) {
        if (!editableFieldGroups.includes(groupName) && (convertedForm as any)[fieldName] === "") {
          const baseValue = baseProduct[fieldName];
          if (baseValue !== undefined && baseValue !== null && baseValue !== "") {
            (convertedForm as any)[fieldName] = baseValue;
            inheritedFieldsSet.add(fieldName);
          }
        }
      }
    }

    setForm(convertedForm);
    setInheritedFields(inheritedFieldsSet);

    // Initialize visibleLayerCount based on existing layers
    const layerCount = [
      convertedForm.layer1Material,
      convertedForm.layer2Material,
      convertedForm.layer3Material,
      convertedForm.layer4Material,
    ].filter(Boolean).length;
    setVisibleLayerCount(Math.max(1, layerCount));

    setInitialClassification(initialClassification);
    setInitialProjectType(initialProjectType);
    setInitialVolume(initialVolume);
    setInitialUnit(initialUnit);
    setInitialDescription(initialDescription);
    initialFormStateRef.current = normalizeComparableProjectForm(convertedForm);
    setLoading(false);
  }, [projectCode]);

  useEffect(() => {
    if (projectCode && !loading) {
      const projectTitle = form.projectName?.trim()
        ? `Editar Producto: ${form.projectName}`
        : "Editar Producto";

      const projectSubtitle = form.projectDescription?.trim()
        ? form.projectDescription
        : "Completa y gestiona todos los detalles de tu producto";

      setHeader({
        title: projectTitle,
        subtitle: projectSubtitle,
        breadcrumbs: [
          { label: "Productos", href: "/products" },
          { label: projectCode },
          { label: "Editar" },
        ],
        badges: (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            ID: {projectCode}
          </span>
        ),
      });
    }

    return () => resetHeader();
  }, [
    setHeader,
    resetHeader,
    projectCode,
    loading,
    form.projectName,
    form.projectDescription,
  ]);

  const selectedPortfolio = useMemo(() => {
    return (
      portfolios.find(
        (portfolio) =>
          portfolio.id === form.portfolioCode ||
          portfolio.codigo === form.portfolioCode ||
          portfolio.code === form.portfolioCode
      ) || null
    );
  }, [form.portfolioCode, portfolios]);

  const selectedExecutives = useMemo(() => {
    const selectedIds = new Set(form.executiveId.map(String));
    return executives.filter((executive) => selectedIds.has(String(executive.id)));
  }, [executives, form.executiveId]);

  const inheritedPortfolioCode = selectedPortfolio?.id || selectedPortfolio?.codigo || selectedPortfolio?.code || "";
  const inheritedPortfolioName = selectedPortfolio?.nom || selectedPortfolio?.name || selectedPortfolio?.portfolioName || "";
  const inheritedPortfolioDisplay = inheritedPortfolioCode
    ? `${inheritedPortfolioCode} - ${inheritedPortfolioName || "Sin nombre de portafolio registrado"}`
    : "";

  const inheritedClient = selectedPortfolio?.cli || selectedPortfolio?.clientName || "";
  const inheritedPlant = selectedPortfolio?.pl || selectedPortfolio?.plantaName || selectedPortfolio?.plantaCode || "";
  const inheritedWrapping = selectedPortfolio?.env || selectedPortfolio?.envoltura || selectedPortfolio?.wrappingName || "";
  const inheritedFinalUse = selectedPortfolio?.uf || selectedPortfolio?.usoFinal || selectedPortfolio?.useFinalName || "";
  const inheritedSector = selectedPortfolio?.sector || "";
  const inheritedSegment = selectedPortfolio?.seg || selectedPortfolio?.segmento || selectedPortfolio?.segment || "";
  const inheritedSubSegment = selectedPortfolio?.subseg || selectedPortfolio?.subSegmento || selectedPortfolio?.subSegment || "";
  const inheritedAfMarketId = selectedPortfolio?.af || selectedPortfolio?.afMarketId || "";
  const inheritedMachine = selectedPortfolio?.maq || selectedPortfolio?.maquinaCliente || selectedPortfolio?.packingMachineName || "";

  const isPouch = isPouchWrapping(inheritedWrapping);
  const isBolsa = isBolsaWrapping(inheritedWrapping);
  const isLamina = isLaminaWrapping(inheritedWrapping);
  const shouldApplyPouchDoyPackRestrictions = isPouch && form.blueprintFormat === POUCH_DOY_PACK_REDONDO_FUELLE_PROPIO;
  const shouldShowInternalAccessories = isBolsa || isPouch;

  // Perforation type field visibility
  const hasPerforation = form.hasPerforation === "Sí";
  const shouldShowPouchPerforationType = isPouch && hasPerforation;
  const shouldShowBolsaPerforationType = isBolsa && hasPerforation;

  const layerGrammageTotal = useMemo(() => {
    const layerGrammages = [
      form.layer1Grammage,
      form.layer2Grammage,
      form.layer3Grammage,
      form.layer4Grammage,
    ];

    return layerGrammages
      .slice(0, visibleLayerCount)
      .reduce((total, value) => total + parseGrammageValue(value), 0);
  }, [
    visibleLayerCount,
    form.layer1Grammage,
    form.layer2Grammage,
    form.layer3Grammage,
    form.layer4Grammage,
  ]);

  const fixedInkAdhesiveGrammage = useMemo(() => {
    return STRUCTURE_FIXED_GRAMMAGE[form.structureType] || 0;
  }, [form.structureType]);

  const calculatedGrammageTotal = useMemo(() => {
    if (!form.structureType) return "";

    return formatGrammageValue(layerGrammageTotal + fixedInkAdhesiveGrammage);
  }, [form.structureType, layerGrammageTotal, fixedInkAdhesiveGrammage]);

  const estructuraCalculada = useMemo(() => {
    const layers = [
      form.layer1Material,
      form.layer2Material,
      form.layer3Material,
      form.layer4Material,
    ].filter(Boolean);

    if (layers.length === 1) return "Monocapa";
    if (layers.length === 2) return "Bilaminado";
    if (layers.length === 3) return "Trilaminado";
    if (layers.length === 4) return "Tetralaminado";
    return "";
  }, [form.layer1Material, form.layer2Material, form.layer3Material, form.layer4Material]);

  const nombreTecnicoCalculado = useMemo(() => {
    const formatLayerForName = (material: string, micron?: string): string => {
      if (!material) return "";

      // Try Moment 1 material config first (MATERIAL_MICRON_CONFIG)
      const moment1Label = getMaterialLabel(material);
      if (moment1Label && moment1Label !== material) {
        if (!micron) return moment1Label;
        return `${moment1Label} ${micron} µm`;
      }

      // Fallback to Moment 2+ material catalog (MATERIAL_CATALOG)
      const entry = Object.values(MATERIAL_CATALOG)
        .flat()
        .find(m => m.value === material || m.label === material);
      const label = entry?.label || material;
      if (!micron) return label;
      return `${label} ${micron} µm`;
    };

    const capasStr = [
      form.layer1Material ? formatLayerForName(form.layer1Material, form.layer1Micron) : "",
      form.layer2Material ? formatLayerForName(form.layer2Material, form.layer2Micron) : "",
      form.layer3Material ? formatLayerForName(form.layer3Material, form.layer3Micron) : "",
      form.layer4Material ? formatLayerForName(form.layer4Material, form.layer4Micron) : "",
    ]
      .filter(Boolean)
      .join(" - ");

    return [
      form.projectName.trim(),
      form.estimatedVolume.trim() && form.unitOfMeasure ? `${form.estimatedVolume.trim()} ${form.unitOfMeasure}` : "",
      inheritedWrapping,
      capasStr,
    ]
      .filter(Boolean)
      .join(" - ")
      .replace(/\s+/g, " ")
      .trim();
  }, [
    form.layer1Material, form.layer2Material, form.layer3Material, form.layer4Material,
    form.layer1Micron, form.layer2Micron, form.layer3Micron, form.layer4Micron,
    form.projectName, form.estimatedVolume, form.unitOfMeasure, inheritedWrapping,
  ]);

  useEffect(() => {
    setForm((prev) => {
      if (prev.grammage === calculatedGrammageTotal) return prev;

      return {
        ...prev,
        grammage: calculatedGrammageTotal,
      };
    });
  }, [calculatedGrammageTotal]);
  useEffect(() => {
    setForm((prev) => {
      let changed = false;
      const next: ProjectEditFormData = { ...prev };

      for (let layer = 1; layer <= 4; layer++) {
        const groupKey = `layer${layer}MaterialGroup` as keyof ProjectEditFormData;
        const materialKey = `layer${layer}Material` as keyof ProjectEditFormData;
        const micronKey = `layer${layer}Micron` as keyof ProjectEditFormData;
        const grammageKey = `layer${layer}Grammage` as keyof ProjectEditFormData;

        const group = prev[groupKey] as string;
        const material = prev[materialKey] as string;

        if (!group || !material) continue;

        const entry = MATERIAL_CATALOG[group]?.find(
          (item) => item.value === material || item.label === material
        );

        if (!entry || entry.isFree) continue;

        if (prev[micronKey] !== entry.micron) {
          (next[micronKey] as string) = entry.micron;
          changed = true;
        }

        if (prev[grammageKey] !== entry.grammage) {
          (next[grammageKey] as string) = entry.grammage;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [
    form.layer1MaterialGroup,
    form.layer1Material,
    form.layer2MaterialGroup,
    form.layer2Material,
    form.layer3MaterialGroup,
    form.layer3Material,
    form.layer4MaterialGroup,
    form.layer4Material,
  ]);

  useEffect(() => {
    if (!isDisenoNuevo(form.classification, form.projectType)) return;

    setForm((prev) => {
      if (prev.hasEdagReference === "No") return prev;

      return {
        ...prev,
        hasEdagReference: "No",
        referenceEdagCode: "",
        referenceEdagVersion: "",
        edagCode: "",
        edagVersion: "",
      };
    });
  }, [form.classification, form.projectType]);

  // Actualizar tipo de estructura automáticamente según la cantidad de capas visibles
  useEffect(() => {
    const calculatedStructureType = getStructureTypeByLayerCount(visibleLayerCount);

    setForm((prev) => {
      if (prev.structureType === calculatedStructureType) return prev;

      return {
        ...prev,
        structureType: calculatedStructureType,
      };
    });
  }, [visibleLayerCount]);

  const projectTypeOptions = useMemo(() => {
    if (isProductoNuevo(form.classification)) {
      return PROJECT_TYPE_RD_OPTIONS;
    }

    if (isProductoModificado(form.classification)) {
      return PROJECT_TYPE_TECNICA_OPTIONS;
    }

    return [];
  }, [form.classification]);

  const dimensionRestrictions = useMemo(() => {
    return getDimensionRestrictionsByFormat(form.blueprintFormat || "");
  }, [form.blueprintFormat]);

  const isModifiedProject =
    isProductoModificado(form.classification) ||
    isProductoModificado(originalProject?.classification || "");

  const motivoModificacion =
    form.motivoModificacion ||
    originalProject?.motivoModificacion ||
    originalProject?.modificationReason ||
    "";

  // NUEVA LÓGICA: Basada en MOT_FIELD_RULES
  const motRule = getMotRule(form.projectType);
  const enabledGroupsByMot = motRule?.editableFieldGroups || [];

  const canEditDesignByMot = enabledGroupsByMot.some(group =>
    ["design", "printing", "edag", "photoregister", "rewinding", "photocell", "designPlans", "designVariant"].includes(group)
  );

  const canEditDimensionsByMot = enabledGroupsByMot.includes("dimensions") || enabledGroupsByMot.includes("perimeter");

  const canEditStructureByMot = enabledGroupsByMot.some(group =>
    ["structure", "materials", "layers", "micron", "grammage"].includes(group)
  );

  const canEditPackagingByMot = enabledGroupsByMot.includes("packaging") || enabledGroupsByMot.includes("accessories");

  // Si es Producto Nuevo, habilitar todo. Si es Modificado, usar lógica MOT
  const isNuevoClassification = isProductoNuevo(form.classification);
  const canEditDesign = isNuevoClassification || (isProductoModificado(form.classification) && canEditDesignByMot);
  const canEditDimensions = isNuevoClassification || (isProductoModificado(form.classification) && canEditDimensionsByMot);
  const canEditStructure = isNuevoClassification || (isProductoModificado(form.classification) && canEditStructureByMot);
  const canEditPackaging = isNuevoClassification || (isProductoModificado(form.classification) && canEditPackagingByMot);

  const canEditCommercial = !isModifiedProject;

  const canEditAdditionalCustomerData = !isModifiedProject;

  const requiredFields = useMemo<Array<keyof ProjectEditFormData>>(() => {
    const fields = [...BASE_REQUIRED_FIELDS];

    // Add FDP-based required fields
    const fDPRequiredFields = getRequiredFieldsByFormat(form.blueprintFormat, form.motivoModificacion);
    if (fDPRequiredFields.size > 0) {
      fDPRequiredFields.forEach(field => {
        const fieldKey = field as keyof ProjectEditFormData;
        if (!fields.includes(fieldKey)) {
          fields.push(fieldKey);
        }
      });
    }

    if (form.hasReferenceStructure !== "Sí") {
      fields.push("structureType");

      for (let layer = 1; layer <= visibleLayerCount; layer++) {
        fields.push(
          `layer${layer}MaterialGroup` as keyof ProjectEditFormData,
          `layer${layer}Material` as keyof ProjectEditFormData,
          `layer${layer}Micron` as keyof ProjectEditFormData,
          `layer${layer}Grammage` as keyof ProjectEditFormData
        );
      }
    }
    if (form.printClass && form.printClass !== "Sin impresión") {
      fields.push("printType");
    }

    const isProjectTypeEnabled =
      projectTypeOptions.length > 0;

    if (isProjectTypeEnabled) {
      fields.push("projectType");
    }

    if (shouldShowRepetitionField(inheritedWrapping, form.blueprintFormat)) {
      fields.push("repetition");
    }

    // Dimensiones - siempre requeridas excepto en casos específicos
    const normalizedFormat = String(form.blueprintFormat || "").trim().toUpperCase();
    const isLaminaFood = isLaminaWrapping(inheritedWrapping) && normalizedFormat === "FOOD";

    if (!isLaminaFood) {
      // width solo si es POUCH/BOLSA o LÁMINA (pero no LÁMINA FOOD)
      const shouldRequireWidth = isPouchWrapping(inheritedWrapping) || isBolsaWrapping(inheritedWrapping) ||
        (isLaminaWrapping(inheritedWrapping) && (normalizedFormat === "TISSUE" || normalizedFormat === "GENERICA"));
      if (shouldRequireWidth) {
        fields.push("width");
      }
      // length y gussetWidth siempre requeridos en esta sección
      fields.push("length", "gussetWidth");
    }

    if (shouldApplyPouchDoyPackRestrictions) {
      fields.push("doyPackBase", "gussetType");
    }

    // BOLSA fields - all required when BOLSA wrapping is selected
    if (isBolsaWrapping(inheritedWrapping)) {
      fields.push("tipoPresentacionBolsa");

      // Fields dependent on tipoPresentacionBolsa
      if (form.tipoPresentacionBolsa === "Bolsa sellada") {
        fields.push("tipoSelloBolsa", "tieneFuelleBolsa");
      }

      // Fields dependent on tipoSelloBolsa
      if (form.tipoSelloBolsa === "Sello lateral") {
        fields.push("acabadoBolsa");
      }

      // Fields dependent on tieneFuelleBolsa
      if (form.tieneFuelleBolsa === "Sí") {
        fields.push("tipoFuelleBolsa");
      }
    }

    // POUCH fields - all required when POUCH wrapping is selected
    if (isPouchWrapping(inheritedWrapping)) {
      fields.push("tipoFamiliaPouch");

      // Fields dependent on tipoFamiliaPouch
      if (form.tipoFamiliaPouch === "Pouch Stand Up") {
        fields.push("tipoStandUpPouch");
      }

      if (form.tipoFamiliaPouch === "Pouch Stand Up" && form.tipoStandUpPouch === "Doy Pack") {
        fields.push("formaDoyPackPouch");
      }

      if (form.tipoFamiliaPouch === "Pouch Stand Up" && form.tipoStandUpPouch === "Stand Up con Fuelle") {
        fields.push("tipoFuelleStandUpPouch");
      }

      if (form.tipoFamiliaPouch === "Pouch Plano") {
        fields.push("cantidadSellosPouchPlano");
      }

      if (form.tipoFamiliaPouch === "Pouch con Sello Central") {
        fields.push("tieneFuelleSelloCentralPouch", "materialSelloCentralPouch");
      }

      if (form.tipoFamiliaPouch === "Pouch con Sello en Fuelle") {
        fields.push("tipoSelloEnFuellePouch");
      }
    }

    // LÁMINA fields
    if (isLaminaWrapping(inheritedWrapping)) {
      fields.push("tipoFormatoLamina");
    }

    if (form.hasDesignPlan === "Sí") {
      fields.push("designPlanFiles");
    }

    // Note: hasCustomerTechnicalSpec validation is handled separately with custom validation
    // to check if documents are uploaded via ProjectDocumentsSection

    if (isLaminaWrapping(inheritedWrapping)) {
      fields.push("coreMaterial", "coreDiameter", "externalDiameter", "maxRollWeight");
    }

    return fields;
  }, [
    inheritedWrapping,
    form.blueprintFormat,
    form.classification,
    form.printClass,
    form.hasReferenceStructure,
    form.structureType,
    form.motivoModificacion,
    visibleLayerCount,
    projectTypeOptions,
    shouldApplyPouchDoyPackRestrictions,
    form.hasDesignPlan,
    form.hasCustomerTechnicalSpec,
    form.tipoPresentacionBolsa,
    form.tipoSelloBolsa,
    form.tieneFuelleBolsa,
    form.tipoFamiliaPouch,
    form.tipoStandUpPouch,
    form.formaDoyPackPouch,
    form.cantidadSellosPouchPlano,
    form.tieneFuelleSelloCentralPouch,
    form.tipoSelloEnFuellePouch,
  ]);
  const updateField = (field: keyof ProjectEditFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const markFieldAsTouched = (field: keyof ProjectEditFormData) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Layer helper functions for Moment 1 materials
  const getLayerValue = (index: number) => {
    const values = [
      form.layer1Material,
      form.layer2Material,
      form.layer3Material,
      form.layer4Material,
    ];
    return values[index] || "";
  };

  const getLayerMicronValue = (index: number) => {
    const values = [
      form.layer1Micron,
      form.layer2Micron,
      form.layer3Micron,
      form.layer4Micron,
    ];
    return values[index] || "";
  };

  const getLayerMaterialField = (index: number): keyof ProjectEditFormData => {
    return `layer${index + 1}Material` as keyof ProjectEditFormData;
  };

  const getLayerMicronField = (index: number): keyof ProjectEditFormData => {
    return `layer${index + 1}Micron` as keyof ProjectEditFormData;
  };

  const getLayerGroupField = (index: number): keyof ProjectEditFormData => {
    return `layer${index + 1}MaterialGroup` as keyof ProjectEditFormData;
  };

  const getLayerGrammageField = (index: number): keyof ProjectEditFormData => {
    return `layer${index + 1}Grammage` as keyof ProjectEditFormData;
  };

  const clearLayersAfter = (index: number) => {
    setForm((prev) => {
      const next = { ...prev };
      for (let i = index + 1; i < 4; i++) {
        next[getLayerMaterialField(i)] = "" as never;
        next[getLayerMicronField(i)] = "" as never;
        next[getLayerGroupField(i)] = "" as never;
        next[getLayerGrammageField(i)] = "" as never;
      }
      return next;
    });
  };

  const handleLayerChange = (index: number, value: string) => {
    const materialField = getLayerMaterialField(index);
    const micronField = getLayerMicronField(index);
    const defaultMicron = getDefaultMicronByMaterial(value);

    setForm((prev) => ({
      ...prev,
      [materialField]: value,
      [micronField]: defaultMicron || "",
    }));

    if (!value) {
      clearLayersAfter(index);
      setVisibleLayerCount(Math.max(1, index + 1));
    }
  };

  const handleLayerMicronChange = (index: number, value: string) => {
    const micronField = getLayerMicronField(index);
    updateField(micronField, value);
  };

  const handleAddLayer = () => {
    if (visibleLayerCount >= 4) return;
    const lastVisibleLayerValue = getLayerValue(visibleLayerCount - 1);
    if (!lastVisibleLayerValue) return;
    setVisibleLayerCount((prev) => Math.min(prev + 1, 4));
  };

  const handleRemoveLastLayer = () => {
    if (visibleLayerCount <= 1) return;
    const layerIndexToRemove = visibleLayerCount - 1;
    setForm((prev) => ({
      ...prev,
      [getLayerMaterialField(layerIndexToRemove)]: "",
      [getLayerMicronField(layerIndexToRemove)]: "",
      [getLayerGroupField(layerIndexToRemove)]: "",
      [getLayerGrammageField(layerIndexToRemove)]: "",
    }));
    clearLayersAfter(layerIndexToRemove);
    setVisibleLayerCount((prev) => Math.max(prev - 1, 1));
  };

  // Efecto para calcular Formato de Plano (Bolsa)
  useEffect(() => {
    if (isGuidedFormatEnabled(inheritedWrapping)) {
      const calculatedFormat = calculateBolsaFormatPlan({
        tipoPresentacionBolsa: form.tipoPresentacionBolsa,
        tipoSelloBolsa: form.tipoSelloBolsa,
        acabadoBolsa: form.acabadoBolsa,
        tieneFuelleBolsa: form.tieneFuelleBolsa,
      });

      if (calculatedFormat) {
        setForm(prev => {
          if (prev.blueprintFormat === calculatedFormat) return prev;
          return { ...prev, blueprintFormat: calculatedFormat };
        });
      }
    }
  }, [
    inheritedWrapping,
    form.tipoPresentacionBolsa,
    form.tipoSelloBolsa,
    form.acabadoBolsa,
    form.tieneFuelleBolsa
  ]);

  // Efecto para calcular Formato de Plano (Pouch)
  useEffect(() => {
    if (!isPouch) return;

    const calculatedFormat = calculatePouchFormatPlan({
      tipoFamiliaPouch: form.tipoFamiliaPouch,
      tipoStandUpPouch: form.tipoStandUpPouch,
      formaDoyPackPouch: form.formaDoyPackPouch,
      tipoFuelleStandUpPouch: form.tipoFuelleStandUpPouch,
      cantidadSellosPouchPlano: form.cantidadSellosPouchPlano,
      tieneFuelleSelloCentralPouch: form.tieneFuelleSelloCentralPouch,
      materialSelloCentralPouch: form.materialSelloCentralPouch,
      tipoSelloEnFuellePouch: form.tipoSelloEnFuellePouch,
    });

    if (calculatedFormat) {
      setForm((prev) => {
        if (prev.blueprintFormat === calculatedFormat) return prev;
        return { ...prev, blueprintFormat: calculatedFormat };
      });
    }
  }, [
    isPouch,
    form.tipoFamiliaPouch,
    form.tipoStandUpPouch,
    form.formaDoyPackPouch,
    form.tipoFuelleStandUpPouch,
    form.cantidadSellosPouchPlano,
    form.tieneFuelleSelloCentralPouch,
    form.materialSelloCentralPouch,
    form.tipoSelloEnFuellePouch,
  ]);

  // Efecto para calcular Formato de Plano (Lámina)
  useEffect(() => {
    if (!isLaminaWrapping(inheritedWrapping)) return;

    const calculatedFormat = calculateLaminaFormatPlan({
      tipoFormatoLamina: form.tipoFormatoLamina,
    });

    if (calculatedFormat) {
      setForm((prev) => {
        if (prev.blueprintFormat === calculatedFormat) return prev;
        return { ...prev, blueprintFormat: calculatedFormat };
      });
    }
  }, [inheritedWrapping, form.tipoFormatoLamina]);

  // Efecto para auto-completar campos con 0 cuando el rango sea 0 a 0
  useEffect(() => {
    setForm((prev) => {
      let changed = false;
      const next = { ...prev };

      const widthRestriction = dimensionRestrictions.width;
      const lengthRestriction = dimensionRestrictions.length;
      const gussetRestriction = dimensionRestrictions.gussetWidth;

      if (gussetRestriction?.min === 0 && gussetRestriction?.max === 0 && prev.gussetWidth !== "0") {
        next.gussetWidth = "0";
        changed = true;
      }

      if (widthRestriction?.min === 0 && widthRestriction?.max === 0 && prev.width !== "0") {
        next.width = "0";
        changed = true;
      }

      if (lengthRestriction?.min === 0 && lengthRestriction?.max === 0 && prev.length !== "0") {
        next.length = "0";
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [
    dimensionRestrictions.width?.min,
    dimensionRestrictions.width?.max,
    dimensionRestrictions.length?.min,
    dimensionRestrictions.length?.max,
    dimensionRestrictions.gussetWidth?.min,
    dimensionRestrictions.gussetWidth?.max,
  ]);

  // Clean up perforation types based on wrapping type and hasPerforation checkbox
  useEffect(() => {
    setForm((prev) => {
      let changed = false;
      const next = { ...prev };

      // If hasPerforation is unchecked, clear both perforation types
      if (prev.hasPerforation !== "Sí") {
        if (prev.pouchPerforationType || prev.bagPerforationType || prev.perforationLocation) {
          next.pouchPerforationType = "";
          next.bagPerforationType = "";
          next.perforationLocation = "";
          changed = true;
        }
      }

      // If POUCH wrapping, clear bagPerforationType
      if (isPouchWrapping(inheritedWrapping) && prev.bagPerforationType) {
        next.bagPerforationType = "";
        changed = true;
      }

      // If BOLSA wrapping, clear pouchPerforationType
      if (isBolsaWrapping(inheritedWrapping) && prev.pouchPerforationType) {
        next.pouchPerforationType = "";
        changed = true;
      }

      // If LÁMINA wrapping, clear all perforation data
      if (isLaminaWrapping(inheritedWrapping)) {
        if (prev.hasPerforation || prev.pouchPerforationType || prev.bagPerforationType || prev.perforationLocation) {
          next.hasPerforation = "";
          next.pouchPerforationType = "";
          next.bagPerforationType = "";
          next.perforationLocation = "";
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [inheritedWrapping, form.hasPerforation]);

  const handleLicitacionChange = (value: string) => {
  const licitacion = value as "Sí" | "No";

  setForm((prev) => ({
    ...prev,
    licitacion,
  }));
};


  const handlePouchFamilyChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tipoFamiliaPouch: value,
      tipoStandUpPouch: "",
      formaDoyPackPouch: "",
      tipoFuelleStandUpPouch: "",
      cantidadSellosPouchPlano: "",
      tieneFuelleSelloCentralPouch: "",
      materialSelloCentralPouch: "",
      tipoSelloEnFuellePouch: "",
      blueprintFormat: "",
    }));
    markFieldAsTouched("tipoFamiliaPouch");
  };

  const handlePouchStandUpChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tipoStandUpPouch: value,
      formaDoyPackPouch: "",
      tipoFuelleStandUpPouch: "",
      blueprintFormat: "",
    }));
    markFieldAsTouched("tipoStandUpPouch");
  };

  const handlePouchDoyPackShapeChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      formaDoyPackPouch: value,
      blueprintFormat: "",
    }));
    markFieldAsTouched("formaDoyPackPouch");
  };

  const handlePouchStandUpFuelleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tipoFuelleStandUpPouch: value,
      blueprintFormat: "",
    }));
    markFieldAsTouched("tipoFuelleStandUpPouch");
  };

  const handlePouchPlanoSealCountChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      cantidadSellosPouchPlano: value,
      blueprintFormat: "",
    }));
    markFieldAsTouched("cantidadSellosPouchPlano");
  };

  const handlePouchCentralFuelleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tieneFuelleSelloCentralPouch: value,
      blueprintFormat: "",
    }));
    markFieldAsTouched("tieneFuelleSelloCentralPouch");
  };

  const handlePouchCentralMaterialChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      materialSelloCentralPouch: value,
      blueprintFormat: "",
    }));
    markFieldAsTouched("materialSelloCentralPouch");
  };

  const handlePouchSealInGussetTypeChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tipoSelloEnFuellePouch: value,
      blueprintFormat: "",
    }));
    markFieldAsTouched("tipoSelloEnFuellePouch");
  };

  const shouldValidateField = (field: keyof ProjectEditFormData): boolean => {
    if (!isModifiedProject) return true;

    // Verificar si el campo es editable según el MOT
    const mot = form.projectType;
    if (!isFieldEditableByMot(field as string, mot)) return false;

    return true;
  };

  const validationErrors = useMemo(() => {
    const errors: Partial<Record<keyof ProjectEditFormData, string>> = {};

    requiredFields.forEach((field) => {
      // Skip validation for fields that shouldn't be editable in modified projects
      if (!shouldValidateField(field)) {
        return;
      }

      // Skip doyPackBase if it's not POUCH Stand Up Doy Pack
      if (field === "doyPackBase") {
        if (
          isPouchWrapping(inheritedWrapping) &&
          form.tipoFamiliaPouch === "Pouch Stand Up" &&
          form.tipoStandUpPouch === "Doy Pack" &&
          isFieldEmpty(form[field])
        ) {
          errors[field] = "Selecciona la base del Doy Pack.";
        }
      }
      // Skip internal accessories fields when LÁMINA wrapping is selected
      else if (
        !shouldShowInternalAccessories &&
        [
          "hasAngularCut", "hasRoundedCorners", "roundedCornersType", "hasNotch",
          "hasPerforation", "pouchPerforationType", "bagPerforationType", "perforationLocation",
          "hasPreCut", "preCutType"
        ].includes(field as string)
      ) {
        // Skip validation for internal accessories when not showing
        return;
      }
      else if (isFieldEmpty(form[field])) {
        const label = FIELD_LABELS[field] || String(field);
        errors[field] = `${label} es obligatorio.`;
      }
    });

    // Validar restricciones de dimensiones por formato de plano
    const validateDimensionRange = (
      field: "width" | "length" | "gussetWidth",
      label: string,
      range?: DimensionRange
    ) => {
      if (!range) return;

      const value = form[field];

      if (!value || String(value).trim() === "") {
        // El campo ya está validado como requerido en otra parte
        return;
      }

      const parsedValue = parseNumberInput(value);

      if (parsedValue === null) {
        errors[field] = `${label} debe ser un número válido.`;
      } else if (!isDimensionValueInRange(value, range)) {
        errors[field] = `${label} debe estar entre ${range.min} mm y ${range.max} mm.`;
      }
    };

    // Validar ancho si tiene restricción y es editable
    const widthRestriction = dimensionRestrictions.width;
    if (widthRestriction && canEditDimensions) {
      validateDimensionRange("width", "Ancho", widthRestriction);
    }

    // Validar largo/repetición si tiene restricción y es editable
    const lengthRestriction = dimensionRestrictions.length;
    if (lengthRestriction && canEditDimensions) {
      const isLamina = isLaminaWrapping(inheritedWrapping);
      validateDimensionRange("length", isLamina ? "Repetición / Largo" : "Largo", lengthRestriction);
    }

    // Validar ancho fuelle si tiene restricción y es editable
    const gussetRestriction = dimensionRestrictions.gussetWidth;
    if (gussetRestriction && canEditDimensions) {
      validateDimensionRange("gussetWidth", "Ancho Fuelle", gussetRestriction);
    }

    if (canEditDesign) {
      if (form.hasDesignPlan === "Sí") {
        if (!form.designPlanType) {
          errors.designPlanType = "Selecciona el tipo de plano.";
        } else {
          const selectedDesignPlanType = DESIGN_PLAN_TYPE_OPTIONS.find(
            (item) => item.value === form.designPlanType
          );

          if (selectedDesignPlanType?.requiresFile && (!form.designPlanFiles || form.designPlanFiles.length === 0)) {
            errors.designPlanFiles = "Debe cargar al menos un archivo de plano de diseño.";
          }

          if (form.designPlanType === "SOLO_DATOS_SIN_WEBCENTER" && !form.designPlanComments?.trim()) {
            errors.designPlanComments = "Registra el comentario cuando el archivo de arte no se envía con WebCenter.";
          }
        }
      }
    }

    // Validar Especificación Técnica del Cliente
    // Si selecciona "Sí", debe haber al menos un archivo cargado
    if (form.hasCustomerTechnicalSpec === "Sí") {
      if (form.customerTechnicalSpecFiles.length === 0) {
        errors.customerTechnicalSpecFiles =
          "Debe adjuntar al menos un archivo de especificación técnica del cliente.";
      }
    }

    // Validar Objetivo de color - otro
    // Solo se valida si se selecciona "Otros" (código "5")
    if (
      (form.colorObjectiveCode === "5" || form.colorObjective === "Otros") &&
      !form.colorObjectiveOther.trim()
    ) {
      errors.colorObjectiveOther = "Debe especificar el objetivo de color.";
    }

    // Validar tipo de perforación según la envoltura
    if (hasPerforation && shouldShowInternalAccessories) {
      if (isPouch && !form.pouchPerforationType) {
        errors.pouchPerforationType = "Selecciona el tipo de perforación pouch.";
      }
      if (isBolsa && !form.bagPerforationType) {
        errors.bagPerforationType = "Selecciona el tipo de perforación bolsa.";
      }
    }

    return errors;
  }, [form, requiredFields, shouldApplyPouchDoyPackRestrictions, inheritedWrapping, projectCode, shouldShowInternalAccessories, hasPerforation, isPouch, isBolsa, dimensionRestrictions, canEditDesign]);

  const shouldShowFieldError = (field: keyof ProjectEditFormData) => {
    return Boolean(validationErrors[field] && (submitAttempted || touchedFields[field]));
  };

  const getError = (field: keyof ProjectEditFormData) => {
    return shouldShowFieldError(field) ? validationErrors[field] || "" : "";
  };

  const missingFieldsByStep = useMemo(() => {
    const missing = requiredFields.filter((field) => isFieldEmpty(form[field]));

    const result: Record<number, string[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
    };

    missing.forEach((field) => {
      for (const [step, fields] of Object.entries(STEP_FIELDS)) {
        if (fields.includes(field)) {
          result[Number(step)].push(field);
          return;
        }
      }
    });

    return result;
  }, [form, requiredFields]);

  const stepsWithErrors = useMemo(() => {
    const result: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

    Object.keys(validationErrors).forEach((field) => {
      for (const [step, fields] of Object.entries(STEP_FIELDS)) {
        if (fields.includes(field as keyof ProjectEditFormData)) {
          result[Number(step)]++;
          break;
        }
      }
    });

    if (submitAttempted) {
      Object.entries(missingFieldsByStep).forEach(([step, fields]) => {
        result[Number(step)] += fields.length;
      });
    }

    return result;
  }, [validationErrors, missingFieldsByStep, submitAttempted]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const completedCount = requiredFields.filter(
      (field) => !isFieldEmpty(form[field])
    ).length;

    return Math.round((completedCount / requiredFields.length) * 100);
  }, [form, requiredFields]);

  const isProjectCompleteForValidation = completionPercentage === 100;

  const primaryButtonLabel = isProjectCompleteForValidation
    ? "Solicitar aprobación"
    : "Actualizar producto";

  const missingFieldCount = useMemo(() => {
    return Object.values(missingFieldsByStep).flat().length;
  }, [missingFieldsByStep]);

  const firstMissingStep = useMemo(() => {
    const entry = Object.entries(missingFieldsByStep).find(
      ([, fields]) => fields.length > 0
    );

    return entry ? Number(entry[0]) : 0;
  }, [missingFieldsByStep]);

  const hasMissingRequiredFields = useMemo(() => {
    return Object.values(missingFieldsByStep).some((fields) => fields.length > 0);
  }, [missingFieldsByStep]);

  const handleReviewMissingFields = () => {
    setShowMissingFieldsModal(false);
    setSubmitAttempted(true);

    const fieldsWithErrors = Object.values(missingFieldsByStep)
      .flat()
      .reduce((acc, field) => {
        acc[field as keyof ProjectEditFormData] = true;
        return acc;
      }, {} as Partial<Record<keyof ProjectEditFormData, boolean>>);

    setTouchedFields((prev) => ({
      ...prev,
      ...fieldsWithErrors,
    }));

    setActiveStep(firstMissingStep);

    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleSaveProgressAnyway = () => {
    allowIncompleteSaveRef.current = true;
    setShowMissingFieldsModal(false);

    window.setTimeout(() => {
      const formElement = document.getElementById("project-edit-form") as HTMLFormElement | null;
      formElement?.requestSubmit();
    }, 0);
  };

  const navigateToProjectList = () => {
    navigate("/products");
  };

  const handleCancel = () => {
    if (initialFormStateRef.current && hasUnsavedChanges(initialFormStateRef.current, form)) {
      setShowCancelConfirmModal(true);
    } else {
      navigateToProjectList();
    }
  };

  const handleContinueEditing = () => {
    setShowCancelConfirmModal(false);
  };

  const handleExitWithoutSaving = () => {
    setShowCancelConfirmModal(false);
    navigateToProjectList();
  };

  const handleSaveAndExit = () => {
    if (!projectCode || !originalProject) return;

    const now = new Date().toISOString();
    const finalExecutiveIds = form.executiveId.map(String);
    const finalExecutiveId =
      finalExecutiveIds.length > 0
        ? Number(finalExecutiveIds[0])
        : originalProject?.ejecutivoId || undefined;
    const finalExecutiveName =
      selectedExecutives.length > 0
        ? selectedExecutives.map((executive) => executive.name).join(", ")
        : originalProject?.ejecutivoName || "";

    const nextCompletionPercentage = Math.round(
      (requiredFields.filter((field) => !isFieldEmpty(form[field])).length / requiredFields.length) * 100
    );

    const nextStatus = computeProjectPreparationStatus({
      project: form,
      completionPercentage: nextCompletionPercentage,
      currentStatus: normalizeProjectStatus(originalProject?.status),
    });

    const nextStage = resolveProjectStage(nextStatus);

    // Helper variables for LÁMINA format handling
    const isLaminaFormat = isLaminaWrapping(inheritedWrapping);
    const normalizedBlueprintFormat = String(form.blueprintFormat || "")
      .trim()
      .toUpperCase();
    const shouldClearWidthForFood = isLaminaFormat && normalizedBlueprintFormat === "FOOD";

    const hasModifications = hasUnsavedChanges(initialFormStateRef.current, form);
    const wasValidated = originalProject?.status === "Validado";
    const needsRevalidation = wasValidated && hasModifications;

    if (needsRevalidation) {
      if (!window.confirm("Al guardar estos cambios el producto requerirá una nueva aprobación (cambio de versión de línea base). ¿Desea continuar?")) {
        return;
      }
    }

    updateProjectRecord(projectCode, {
      id: projectCode,
      code: projectCode,

      portfolioCode: form.portfolioCode,
      portfolioName: selectedPortfolio?.nom || selectedPortfolio?.portfolioName || "",

      clientCode: selectedPortfolio?.clientCode,
      clientName: inheritedClient,

      projectName: form.projectName,
      projectDescription: form.projectDescription,
      descripcionNecesidad: form.projectDescription,

      ejecutivoId: finalExecutiveId,
      ejecutivoName: finalExecutiveName,

      ejecutivoIds: finalExecutiveIds,
      ejecutivoNames: finalExecutiveName,
      executiveIds: finalExecutiveIds,
      commercialExecutiveIds: finalExecutiveIds,

      plantaName: inheritedPlant,
      wrappingName: inheritedWrapping,
      useFinalName: inheritedFinalUse,
      subSegment: inheritedSubSegment,
      segment: inheritedSegment,
      sector: inheritedSector,
      afMarketId: inheritedAfMarketId,
      maquinaCliente: inheritedMachine,
      packingMachineName: inheritedMachine,

      classification: form.classification,
      clasificacion: form.classification,
      projectType: form.projectType,
      tipoProyecto: form.projectType,
      causal: form.projectType,
      motivoNuevaValidacion: form.projectType,
      motivoModificacion: form.motivoModificacion,
      salesforceAction: originalProject?.salesforceAction || "",

      blueprintFormat: form.blueprintFormat,
      estimatedVolume: form.estimatedVolume,
      volumenReferencial: form.estimatedVolume,
      volumenCantidadReferencial: form.estimatedVolume,
      unitOfMeasure: normalizeUnitMeasureCode(form.unitOfMeasure),
      unidad: normalizeUnitMeasureCode(form.unitOfMeasure),

      // LÁMINA guided format fields
      tipoFormatoLamina: form.tipoFormatoLamina || "",

      // BOLSA guided format fields
      tipoPresentacionBolsa: form.tipoPresentacionBolsa || "",
      tipoSelloBolsa: form.tipoSelloBolsa || "",
      acabadoBolsa: form.acabadoBolsa || "",
      tieneFuelleBolsa: form.tieneFuelleBolsa || "",
      tipoFuelleBolsa: form.tipoFuelleBolsa || "",

      // POUCH guided format fields
      tipoFamiliaPouch: form.tipoFamiliaPouch || "",
      tipoStandUpPouch: form.tipoStandUpPouch || "",
      formaDoyPackPouch: form.formaDoyPackPouch || "",
      tipoFuelleStandUpPouch: form.tipoFuelleStandUpPouch || "",
      cantidadSellosPouchPlano: form.cantidadSellosPouchPlano || "",
      tieneFuelleSelloCentralPouch: form.tieneFuelleSelloCentralPouch || "",
      materialSelloCentralPouch: form.materialSelloCentralPouch || "",
      tipoSelloEnFuellePouch: form.tipoSelloEnFuellePouch || "",

      format: form.blueprintFormat,
      volume: form.estimatedVolume,
      unit: form.unitOfMeasure,

      printClass: form.printClass,
      printType: form.printType,
      specialDesignSpecs: form.specialDesignSpecs,
      specialDesignComments: form.specialDesignComments,
      edagCode: form.edagCode,
      edagVersion: form.edagVersion,
      isPreviousDesign: form.hasEdagReference as BooleanLike,
      hasEdagReference: form.hasEdagReference as BooleanLike,
      previousEdagCode: form.referenceEdagCode,
      previousEdagVersion: form.referenceEdagVersion,
      hasDesignPlan: form.hasDesignPlan as BooleanLike,
      designPlanType: form.designPlanType,
      designPlanComments: form.designPlanComments,

      colorObjectiveCode: form.colorObjectiveCode,
      colorObjective: form.colorObjective,
      colorObjectiveOther: form.colorObjectiveOther,
      objetivoColorCodigo: form.colorObjectiveCode,
      objetivoColor: form.colorObjective,
      objetivoColorOtro: form.colorObjectiveOther,

      pressApproverCode: form.pressApproverCode,
      pressApprover: form.pressApprover,
      aprobadorPrensaCodigo: form.pressApproverCode,
      aprobadorPrensa: form.pressApprover,

      alusaReferenceCode: form.alusaReferenceCode,
      codigoReferenciaAlusa: form.alusaReferenceCode,
      designWorkInstructions: form.designWorkInstructions,
      instruccionesTrabajoDiseno: form.designWorkInstructions,

      hasReferenceStructure: form.hasReferenceStructure as BooleanLike,
      referenceEmCode: form.referenceEmCode,
      referenceEmVersion: form.referenceEmVersion,
      hasCustomerTechnicalSpec: form.hasCustomerTechnicalSpec as BooleanLike,
      customerTechnicalSpecAttachment: form.customerTechnicalSpecAttachment,
      customerTechnicalSpecFiles: form.customerTechnicalSpecFiles,
      customerTechnicalSpecComments: form.customerTechnicalSpecComments,
      structureType: form.structureType,

      layer1Material: form.layer1Material,
      layer1Micron: form.layer1Micron,
      layer1Grammage: form.layer1Grammage,
      layer2Material: form.layer2Material,
      layer2Micron: form.layer2Micron,
      layer2Grammage: form.layer2Grammage,
      layer3Material: form.layer3Material,
      layer3Micron: form.layer3Micron,
      layer3Grammage: form.layer3Grammage,
      layer4Material: form.layer4Material,
      layer4Micron: form.layer4Micron,
      layer4Grammage: form.layer4Grammage,

      layers: form.structureType,
      microns: [form.layer1Micron, form.layer2Micron, form.layer3Micron, form.layer4Micron]
        .filter(Boolean)
        .join(" / "),

      estructuraCalculada: estructuraCalculada,
      estructura: estructuraCalculada,
      estructuraMateriales: nombreTecnicoCalculado,
      nombreTecnicoCalculado: nombreTecnicoCalculado,

      specialStructureSpecs: form.specialStructureSpecs,
      grammage: form.grammage,
      sampleRequest: form.sampleRequest === "Sí",

      width: shouldClearWidthForFood ? "" : form.width,
      length: form.length,
      repetition: form.repetition,
      doyPackBase: form.doyPackBase,
      gussetWidth: form.gussetWidth,
      gussetType: form.gussetType,
      dimensions: [shouldClearWidthForFood ? "" : form.width, form.length, form.gussetWidth]
        .filter(Boolean)
        .join(" x "),

      hasZipper: form.hasZipper as BooleanLike,
      zipperType: form.zipperType,
      hasTinTie: form.hasTinTie as BooleanLike,
      hasValve: form.hasValve as BooleanLike,
      valveType: form.valveType,
      hasDieCutHandle: form.hasDieCutHandle as BooleanLike,
      hasReinforcement: form.hasReinforcement as BooleanLike,
      reinforcementThickness: form.reinforcementThickness,
      reinforcementWidth: form.reinforcementWidth,
      hasAngularCut: shouldShowInternalAccessories ? (form.hasAngularCut as BooleanLike) : false,
      hasRoundedCorners: shouldShowInternalAccessories ? (form.hasRoundedCorners as BooleanLike) : false,
      roundedCornersType: shouldShowInternalAccessories ? form.roundedCornersType : "",
      hasNotch: shouldShowInternalAccessories ? (form.hasNotch as BooleanLike) : false,
      hasPerforation: shouldShowInternalAccessories ? (form.hasPerforation as BooleanLike) : false,
      pouchPerforationType: shouldShowPouchPerforationType ? form.pouchPerforationType : "",
      bagPerforationType: shouldShowBolsaPerforationType ? form.bagPerforationType : "",
      perforationLocation: shouldShowInternalAccessories ? form.perforationLocation : "",
      hasPreCut: shouldShowInternalAccessories ? (form.hasPreCut as BooleanLike) : false,
      preCutType: shouldShowInternalAccessories ? form.preCutType : "",
      otherAccessories: form.otherAccessories,
      materialPackaging: form.materialPackaging,
      specialMaterialPackaging: form.specialMaterialPackaging,
      exportProductPackaging: form.exportProductPackaging,
      splices: form.splices,

      saleType: form.saleType,
      incoterm: form.incoterm,
      destinationCountry: form.destinationCountry,
      targetPrice: form.targetPrice,
      currencyType: form.currencyType,
      coreMaterial: isLaminaWrapping(inheritedWrapping) ? form.coreMaterial : "",
      coreDiameter: isLaminaWrapping(inheritedWrapping) ? form.coreDiameter : "",
      externalDiameter: isLaminaWrapping(inheritedWrapping) ? form.externalDiameter : "",
      externalVariationPlus: isLaminaWrapping(inheritedWrapping) ? form.externalVariationPlus : "",
      externalVariationMinus: isLaminaWrapping(inheritedWrapping) ? form.externalVariationMinus : "",
      maxRollWeight: isLaminaWrapping(inheritedWrapping) ? form.maxRollWeight : "",
      customerAdditionalInfo: form.customerAdditionalInfo,
      deliveryAddress: form.deliveryAddress,
      additionalComment: form.additionalComment,
      licitacion: form.licitacion as YesNoPending,
      designPlanFiles: form.designPlanFiles,

      // Design field persistence - Perímetros, Fotoregistro, Sentido de Bobinado, Fotocelda
      perimeterMm: form.perimeterMm,
      dimensionCrossCheckStatus: form.dimensionCrossCheckStatus,
      perimeterValidationStatus: form.perimeterValidationStatus,
      perimeterComment: form.perimeterComment,
      hasPhotoregister1: form.hasPhotoregister1 as BooleanLike,
      fr1Width: form.fr1Width,
      fr1Height: form.fr1Height,
      fr1MarginLeft: form.fr1MarginLeft,
      fr1MarginRight: form.fr1MarginRight,
      fr1MarginTop: form.fr1MarginTop,
      fr1MarginBottom: form.fr1MarginBottom,
      hasPhotoregister2: form.hasPhotoregister2 as BooleanLike,
      fr2Width: form.fr2Width,
      fr2Height: form.fr2Height,
      fr2MarginLeft: form.fr2MarginLeft,
      fr2MarginRight: form.fr2MarginRight,
      fr2MarginTop: form.fr2MarginTop,
      fr2MarginBottom: form.fr2MarginBottom,
      rewindingDirection: form.rewindingDirection,
      rewindingDirectionRef: form.rewindingDirectionRef,
      hasPhotocell: form.hasPhotocell as BooleanLike,
      photocellLocation: form.photocellLocation,

      status: needsRevalidation ? (nextStatus === "Validado" ? "Ficha Completa" : nextStatus) : nextStatus,
      stage: needsRevalidation ? (nextStage === "P3_GESTION_PRODUCTOS_PRELIMINARES" ? "P1_FICHA_PROYECTO" : nextStage) : nextStage,
      completionPercentage: nextCompletionPercentage,
      hasStartedExtendedFicha: nextStatus !== "Registrado",
      statusUpdatedAt: (originalProject?.status !== nextStatus || needsRevalidation) ? now : originalProject?.statusUpdatedAt,
      stageUpdatedAt: needsRevalidation ? now : now,
      updatedAt: now,

      requiresRevalidation: needsRevalidation ? true : originalProject?.requiresRevalidation,
      baselineInvalidatedAt: needsRevalidation ? now : originalProject?.baselineInvalidatedAt,
    } as unknown as ProjectRecord);

    setShowCancelConfirmModal(false);
    navigateToProjectList();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!projectCode || !form) return;

    const hasValidationErrors = Object.keys(validationErrors).length > 0;
    const shouldForceSaveAsDraft = allowIncompleteSaveRef.current;

    // If there are validation errors and user didn't click "Guardar avance", show modal
    if ((hasValidationErrors || hasMissingRequiredFields) && !shouldForceSaveAsDraft) {
      setShowMissingFieldsModal(true);
      return;
    }

    // User either has no errors or clicked "Guardar avance"
    allowIncompleteSaveRef.current = false;

    const hasModifications = hasUnsavedChanges(initialFormStateRef.current, form);
    const wasValidated = originalProject?.status === "Validado";
    const needsRevalidation = wasValidated && hasModifications;

    const shouldSubmitForValidation =
      isProjectCompleteForValidation && !shouldForceSaveAsDraft;

    // Block submission if "Máquina genérica" is selected
    if (shouldSubmitForValidation && isGenericPackingMachine(inheritedMachine)) {
      alert("No se puede enviar el producto para aprobación mientras se tiene seleccionado 'Máquina genérica'. Por favor, seleccione una máquina específica.");
      return;
    }

    if (needsRevalidation && !shouldSubmitForValidation) {
      if (!window.confirm("Al guardar estos cambios el producto requerirá una nueva aprobación (cambio de versión de línea base). ¿Desea continuar?")) {
        return;
      }
    }

    const now = new Date().toISOString();

    // Calculate the preparation status based on actual form data
    // Pass current status to avoid overriding advanced statuses
    const calculatedStatus = computeProjectPreparationStatus({
      project: form,
      completionPercentage,
      currentStatus: normalizeProjectStatus(originalProject?.status),
    });

    // Prepare validation logic for "Solicitar validación"
    const requiresManualAG = shouldSubmitForValidation
      ? requiresManualGraphicArtsValidation(form)
      : false;

    // Ensure commercial executives are properly resolved and persisted
    const finalExecutiveIds = form.executiveId.map(String);

    const finalExecutiveId =
      finalExecutiveIds.length > 0
        ? Number(finalExecutiveIds[0])
        : originalProject?.ejecutivoId || undefined;

    const finalExecutiveName =
      selectedExecutives.length > 0
        ? selectedExecutives.map((executive) => executive.name).join(", ")
        : originalProject?.ejecutivoName || "";

    // Helper variables for LÁMINA format handling
    const isLaminaFormat = isLaminaWrapping(inheritedWrapping);
    const normalizedBlueprintFormat = String(form.blueprintFormat || "")
      .trim()
      .toUpperCase();
    const shouldClearWidthForFood = isLaminaFormat && normalizedBlueprintFormat === "FOOD";

    updateProjectRecord(projectCode, {
      id: projectCode,
      code: projectCode,

      portfolioCode: form.portfolioCode,
      portfolioName: selectedPortfolio?.nom || selectedPortfolio?.portfolioName || "",

      clientCode: selectedPortfolio?.clientCode,
      clientName: inheritedClient,

      projectName: form.projectName,
      projectDescription: form.projectDescription,
      descripcionNecesidad: form.projectDescription,

      ejecutivoId: finalExecutiveId,
      ejecutivoName: finalExecutiveName,

      // Campos múltiples para persistir todos los ejecutivos comerciales seleccionados
      ejecutivoIds: finalExecutiveIds,
      ejecutivoNames: finalExecutiveName,
      executiveIds: finalExecutiveIds,
      commercialExecutiveIds: finalExecutiveIds,

      plantaName: inheritedPlant,
      wrappingName: inheritedWrapping,
      useFinalName: inheritedFinalUse,
      subSegment: inheritedSubSegment,
      segment: inheritedSegment,
      sector: inheritedSector,
      afMarketId: inheritedAfMarketId,
      maquinaCliente: inheritedMachine,
      packingMachineName: inheritedMachine,

      classification: form.classification,
      clasificacion: form.classification,
      projectType: form.projectType,
      tipoProyecto: form.projectType,
      causal: form.projectType,
      motivoNuevaValidacion: form.projectType,
      motivoModificacion: form.motivoModificacion,
      salesforceAction: originalProject?.salesforceAction || "",

      blueprintFormat: form.blueprintFormat,
      estimatedVolume: form.estimatedVolume,
      volumenReferencial: form.estimatedVolume,
      volumenCantidadReferencial: form.estimatedVolume,
      unitOfMeasure: normalizeUnitMeasureCode(form.unitOfMeasure),
      unidad: normalizeUnitMeasureCode(form.unitOfMeasure),

      // LÁMINA guided format fields
      tipoFormatoLamina: form.tipoFormatoLamina || "",

      // BOLSA guided format fields
      tipoPresentacionBolsa: form.tipoPresentacionBolsa || "",
      tipoSelloBolsa: form.tipoSelloBolsa || "",
      acabadoBolsa: form.acabadoBolsa || "",
      tieneFuelleBolsa: form.tieneFuelleBolsa || "",
      tipoFuelleBolsa: form.tipoFuelleBolsa || "",

      // POUCH guided format fields
      tipoFamiliaPouch: form.tipoFamiliaPouch || "",
      tipoStandUpPouch: form.tipoStandUpPouch || "",
      formaDoyPackPouch: form.formaDoyPackPouch || "",
      tipoFuelleStandUpPouch: form.tipoFuelleStandUpPouch || "",
      cantidadSellosPouchPlano: form.cantidadSellosPouchPlano || "",
      tieneFuelleSelloCentralPouch: form.tieneFuelleSelloCentralPouch || "",
      materialSelloCentralPouch: form.materialSelloCentralPouch || "",
      tipoSelloEnFuellePouch: form.tipoSelloEnFuellePouch || "",

      format: form.blueprintFormat,
      volume: form.estimatedVolume,
      unit: form.unitOfMeasure,

      printClass: form.printClass,
      printType: form.printType,
      specialDesignSpecs: form.specialDesignSpecs,
      specialDesignComments: form.specialDesignComments,
      edagCode: form.edagCode,
      edagVersion: form.edagVersion,
      isPreviousDesign: form.hasEdagReference as BooleanLike,
      hasEdagReference: form.hasEdagReference as BooleanLike,
      previousEdagCode: form.referenceEdagCode,
      previousEdagVersion: form.referenceEdagVersion,
      hasDesignPlan: form.hasDesignPlan as BooleanLike,
      designPlanType: form.designPlanType,
      designPlanComments: form.designPlanComments,

      colorObjectiveCode: form.colorObjectiveCode,
      colorObjective: form.colorObjective,
      colorObjectiveOther: form.colorObjectiveOther,
      objetivoColorCodigo: form.colorObjectiveCode,
      objetivoColor: form.colorObjective,
      objetivoColorOtro: form.colorObjectiveOther,

      pressApproverCode: form.pressApproverCode,
      pressApprover: form.pressApprover,
      aprobadorPrensaCodigo: form.pressApproverCode,
      aprobadorPrensa: form.pressApprover,

      alusaReferenceCode: form.alusaReferenceCode,
      codigoReferenciaAlusa: form.alusaReferenceCode,
      designWorkInstructions: form.designWorkInstructions,
      instruccionesTrabajoDiseno: form.designWorkInstructions,

      hasReferenceStructure: form.hasReferenceStructure as BooleanLike,
      referenceEmCode: form.referenceEmCode,
      referenceEmVersion: form.referenceEmVersion,
      hasCustomerTechnicalSpec: form.hasCustomerTechnicalSpec as BooleanLike,
      customerTechnicalSpecAttachment: form.customerTechnicalSpecAttachment,
      customerTechnicalSpecFiles: form.customerTechnicalSpecFiles,
      customerTechnicalSpecComments: form.customerTechnicalSpecComments,
      structureType: form.structureType,

      layer1Material: form.layer1Material,
      layer1Micron: form.layer1Micron,
      layer1Grammage: form.layer1Grammage,
      layer2Material: form.layer2Material,
      layer2Micron: form.layer2Micron,
      layer2Grammage: form.layer2Grammage,
      layer3Material: form.layer3Material,
      layer3Micron: form.layer3Micron,
      layer3Grammage: form.layer3Grammage,
      layer4Material: form.layer4Material,
      layer4Micron: form.layer4Micron,
      layer4Grammage: form.layer4Grammage,

      layers: form.structureType,
      microns: [form.layer1Micron, form.layer2Micron, form.layer3Micron, form.layer4Micron]
        .filter(Boolean)
        .join(" / "),

      estructuraCalculada: estructuraCalculada,
      estructura: estructuraCalculada,
      estructuraMateriales: nombreTecnicoCalculado,
      nombreTecnicoCalculado: nombreTecnicoCalculado,

      specialStructureSpecs: form.specialStructureSpecs,
      grammage: form.grammage,
      sampleRequest: form.sampleRequest === "Sí",

      width: shouldClearWidthForFood ? "" : form.width,
      length: form.length,
      repetition: form.repetition,
      doyPackBase: form.doyPackBase,
      gussetWidth: form.gussetWidth,
      gussetType: form.gussetType,
      dimensions: [shouldClearWidthForFood ? "" : form.width, form.length, form.gussetWidth]
        .filter(Boolean)
        .join(" x "),

      hasZipper: form.hasZipper as BooleanLike,
      zipperType: form.zipperType,
      hasTinTie: form.hasTinTie as BooleanLike,
      hasValve: form.hasValve as BooleanLike,
      valveType: form.valveType,
      hasDieCutHandle: form.hasDieCutHandle as BooleanLike,
      hasReinforcement: form.hasReinforcement as BooleanLike,
      reinforcementThickness: form.reinforcementThickness,
      reinforcementWidth: form.reinforcementWidth,
      hasAngularCut: shouldShowInternalAccessories ? (form.hasAngularCut as BooleanLike) : false,
      hasRoundedCorners: shouldShowInternalAccessories ? (form.hasRoundedCorners as BooleanLike) : false,
      roundedCornersType: shouldShowInternalAccessories ? form.roundedCornersType : "",
      hasNotch: shouldShowInternalAccessories ? (form.hasNotch as BooleanLike) : false,
      hasPerforation: shouldShowInternalAccessories ? (form.hasPerforation as BooleanLike) : false,
      pouchPerforationType: shouldShowPouchPerforationType ? form.pouchPerforationType : "",
      bagPerforationType: shouldShowBolsaPerforationType ? form.bagPerforationType : "",
      perforationLocation: shouldShowInternalAccessories ? form.perforationLocation : "",
      hasPreCut: shouldShowInternalAccessories ? (form.hasPreCut as BooleanLike) : false,
      preCutType: shouldShowInternalAccessories ? form.preCutType : "",
      otherAccessories: form.otherAccessories,
      materialPackaging: form.materialPackaging,
      specialMaterialPackaging: form.specialMaterialPackaging,
      exportProductPackaging: form.exportProductPackaging,
      splices: form.splices,

      saleType: form.saleType,
      incoterm: form.incoterm,
      destinationCountry: form.destinationCountry,
      targetPrice: form.targetPrice,
      currencyType: form.currencyType,
      coreMaterial: isLaminaWrapping(inheritedWrapping) ? form.coreMaterial : "",
      coreDiameter: isLaminaWrapping(inheritedWrapping) ? form.coreDiameter : "",
      externalDiameter: isLaminaWrapping(inheritedWrapping) ? form.externalDiameter : "",
      externalVariationPlus: isLaminaWrapping(inheritedWrapping) ? form.externalVariationPlus : "",
      externalVariationMinus: isLaminaWrapping(inheritedWrapping) ? form.externalVariationMinus : "",
      maxRollWeight: isLaminaWrapping(inheritedWrapping) ? form.maxRollWeight : "",
      customerAdditionalInfo: form.customerAdditionalInfo,
      deliveryAddress: form.deliveryAddress,
      additionalComment: form.additionalComment,
      licitacion: form.licitacion as YesNoPending,
      designPlanFiles: form.designPlanFiles,

      // Design field persistence - Perímetros, Fotoregistro, Sentido de Bobinado, Fotocelda
      perimeterMm: form.perimeterMm,
      dimensionCrossCheckStatus: form.dimensionCrossCheckStatus,
      perimeterValidationStatus: form.perimeterValidationStatus,
      perimeterComment: form.perimeterComment,
      hasPhotoregister1: form.hasPhotoregister1 as BooleanLike,
      fr1Width: form.fr1Width,
      fr1Height: form.fr1Height,
      fr1MarginLeft: form.fr1MarginLeft,
      fr1MarginRight: form.fr1MarginRight,
      fr1MarginTop: form.fr1MarginTop,
      fr1MarginBottom: form.fr1MarginBottom,
      hasPhotoregister2: form.hasPhotoregister2 as BooleanLike,
      fr2Width: form.fr2Width,
      fr2Height: form.fr2Height,
      fr2MarginLeft: form.fr2MarginLeft,
      fr2MarginRight: form.fr2MarginRight,
      fr2MarginTop: form.fr2MarginTop,
      fr2MarginBottom: form.fr2MarginBottom,
      rewindingDirection: form.rewindingDirection,
      rewindingDirectionRef: form.rewindingDirectionRef,
      hasPhotocell: form.hasPhotocell as BooleanLike,
      photocellLocation: form.photocellLocation,

      status: shouldSubmitForValidation ? "En validación" : calculatedStatus,
      stage: shouldSubmitForValidation ? "P2_VALIDACION_VIABILIDAD_TECNICA" : "P1_PREPARACION_FICHA_PROYECTO",
      completionPercentage,
      hasStartedExtendedFicha: (shouldSubmitForValidation ? "En validación" : calculatedStatus) !== "Registrado",
      statusUpdatedAt: shouldSubmitForValidation || originalProject?.status !== calculatedStatus ? now : originalProject?.statusUpdatedAt,
      stageUpdatedAt: shouldSubmitForValidation ? now : originalProject?.stageUpdatedAt,
      updatedAt: now,

      ...(shouldSubmitForValidation && {
        validacionSolicitada: true,
        estadoValidacionGeneral: "En validación",
        fechaSolicitudValidacion: now,
        validationRequestedAt: now,
        requiresRevalidation: false,
        baselineInvalidatedAt: undefined,
        ...(requiresManualAG ? {
          graphicArtsValidationStatus: "En Revisión",
          currentValidationStep: "Artes Gráficas",
        } : {
          graphicArtsValidationStatus: "Aprobado automático",
          technicalSubArea: resolveTechnicalSubAreaByProjectType(form.projectType),
          currentValidationStep: resolveTechnicalSubAreaByProjectType(form.projectType),
          technicalValidationStatus: resolveTechnicalSubAreaByProjectType(form.projectType) ? "En Revisión" : "Sin solicitar",
        }),
      }),
      ...(!shouldSubmitForValidation && needsRevalidation && {
        requiresRevalidation: true,
        baselineInvalidatedAt: now,
        status: calculatedStatus === "Validado" ? "Ficha Completa" : calculatedStatus,
        stage: "P1_PREPARACION_FICHA_PROYECTO",
      }),
    } as unknown as ProjectRecord);

    if (shouldForceSaveAsDraft) {
      // Close the missing fields modal after saving draft
      setShowMissingFieldsModal(false);
    } else if (shouldSubmitForValidation) {
      // Save validation request to localStorage for UI badge
      const RECENT_NEW_VALIDATION_KEY = "odiseo_recent_new_validation";
      localStorage.setItem(RECENT_NEW_VALIDATION_KEY, JSON.stringify({
        projectId: projectCode,
        expiresAt: Date.now() + 25000,
      }));
      // Show validation success modal when submitting for validation
      setShowValidationSuccessModal(true);
    } else {
      // Navigate back to projects list
      navigate("/products");
    }
  }; // <-- cierra handleSubmit

  const CollapsibleSection = ({
    title,
    icon,
    color,
    isOpen,
    onToggle,
    children,
  }: {
    title: string;
    icon: string;
    color: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {icon}
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
            {title}
          </h3>
        </div>

        <span className="text-lg font-bold text-slate-500">
          {isOpen ? "▾" : "▸"}
        </span>
      </button>

      {isOpen && <div className="p-5">{children}</div>}
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando producto...</div>;
  }

  if (!originalProject || !projectCode) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-600 font-semibold">Producto no encontrado</div>
        <button
          onClick={() => navigate("/products")}
          className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium"
        >
          Atrás
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none bg-[#f6f8fb] pb-32">
      {/* ========== HEADER REFORMADO ========== */}
      <div className="mb-6 bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Nivel 1: Botón Volver con texto */}
        <div className="border-b border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Atrás
          </button>
        </div>

        {/* Nivel 4: Avance de llenado */}
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-brand-primary">{completionPercentage}%</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Nivel 5: Stepper de secciones */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-0 overflow-x-auto pb-1 -mx-4 px-4">
            {STEPS.map((step, index) => {
              const isActive = activeStep === index;
              const hasError = submitAttempted && stepsWithErrors[index] > 0;
              return (
                <Fragment key={index}>
                  <button
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className="flex min-w-0 shrink-0 items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${hasError
                        ? "border-2 border-red-400 text-red-600 bg-red-50"
                        : isActive
                          ? "bg-[#00395A] text-white"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-xs font-medium whitespace-nowrap hidden sm:inline ${hasError
                        ? "text-red-600"
                        : isActive
                          ? "text-[#00395A]"
                          : "text-slate-500"
                        }`}
                    >
                      {step.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className="h-px flex-1 min-w-2 bg-slate-200" />
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <form id="project-edit-form" onSubmit={handleSubmit}>

        {/* ========== GRID DE 2 COLUMNAS ========== */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* ========== COLUMNA IZQUIERDA: PASOS DEL FORMULARIO ========== */}
          <div className="space-y-5">
            {/* PASO 0: Información de Producto */}
            {activeStep === 0 && (
              <div className="space-y-5">
                <FormCard title="Información inicial del producto" icon="📋" color="#00395A" required>
                  {/* ========== CLASIFICACIÓN Y MOTIVO ========== */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* COLUMNA IZQUIERDA: Clasificación (desplegable) */}
                    <FormSelect
                      label="Clasificación *"
                      value={form.classification}
                      onChange={(value) => {
                        updateField("classification", value);
                        updateField("projectType", "");
                        markFieldAsTouched("classification");
                      }}
                      onBlur={() => markFieldAsTouched("classification")}
                      error={getError("classification")}
                      options={classificationOpt}
                      placeholder="-- Seleccione --"
                    />

                    {/* COLUMNA DERECHA: MODIFICACIÓN (MOT) - Checkboxes dinámicos */}
                    {form.classification && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          MODIFICACIÓN *
                        </label>
                        <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                          {getCausalOptions(form.classification).map((motOption) => (
                            <label key={motOption.value} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition">
                              <input
                                type="checkbox"
                                checked={form.projectType === motOption.value}
                                onChange={() => {
                                  const isCurrentlySelected = form.projectType === motOption.value;
                                  const nextMot = isCurrentlySelected ? "" : motOption.value;
                                  updateField("projectType", nextMot);
                                  markFieldAsTouched("projectType");
                                  // Los errores de validación se limpian automáticamente en el useMemo
                                }}
                                className="w-5 h-5"
                              />
                              <span className="text-sm text-slate-700">{motOption.label}</span>
                            </label>
                          ))}
                        </div>
                        {getError("projectType") && (
                          <p className="text-xs text-red-600 mt-2">{getError("projectType")}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ========== PRODUCTO BASE (Condicional para Modificado) ========== */}
                  {isProductoModificado(form.classification) && isModifiedProject && originalProject?.approvedProductSnapshot && (
                    <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-5 space-y-3 mt-4">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-orange-900">
                        <span>⚠️</span>
                        Producto base aprobado
                      </h3>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <PreviewRow
                          label="SKU"
                          value={originalProject.approvedProductSnapshot.sku}
                        />
                        <PreviewRow
                          label="Versión"
                          value={originalProject.approvedProductSnapshot.version}
                        />
                        <PreviewRow
                          label="Producto"
                          value={originalProject.approvedProductSnapshot.productName}
                        />
                        <PreviewRow
                          label="Cliente"
                          value={originalProject.approvedProductSnapshot.clientName}
                        />
                        <PreviewRow
                          label="Envoltura"
                          value={originalProject.approvedProductSnapshot.envoltura}
                        />
                        <PreviewRow
                          label="Formato"
                          value={originalProject.approvedProductSnapshot.formatoPlano}
                        />
                      </div>
                    </div>
                  )}

                  {/* ========== NOMBRE, VOLUMEN Y UNIDAD (3 COLUMNAS) ========== */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mt-4">
                    <FormInput
                      label="Nombre del Producto *"
                      value={form.projectName}
                      onChange={(value) => updateField("projectName", value)}
                      onBlur={() => markFieldAsTouched("projectName")}
                      error={getError("projectName")}
                      placeholder="Ej. Mayonesa Light 100ml"
                    />

                    <FormInput
                      label="Volumen Referencial *"
                      value={form.estimatedVolume}
                      onChange={(value) => updateField("estimatedVolume", value)}
                      onBlur={() => markFieldAsTouched("estimatedVolume")}
                      error={getError("estimatedVolume")}
                      placeholder="Ej. 500"
                    />

                    <FormSelect
                      label="Unidad *"
                      value={form.unitOfMeasure}
                      onChange={(value) => updateField("unitOfMeasure", value)}
                      onBlur={() => markFieldAsTouched("unitOfMeasure")}
                      error={getError("unitOfMeasure")}
                      options={UNIT_OPTIONS}
                      placeholder="-- Seleccione --"
                    />
                  </div>

                  {/* ========== ACCIÓN SALESFORCE ========== */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-4">
                    <FormInput
                      label="Acción Salesforce"
                      value={form.salesforceAction}
                      onChange={(value) => updateField("salesforceAction", normalizeSalesforceAction(value))}
                      onBlur={() => markFieldAsTouched("salesforceAction")}
                      error={getError("salesforceAction")}
                      placeholder="Ej. A-123456"
                    />
                  </div>

                  {/* ========== DESCRIPCIÓN BREVE ========== */}
                  <div className="space-y-1 mt-4">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Descripción breve de la necesidad *
                    </label>
                    <textarea
                      value={form.projectDescription}
                      onChange={(e) => updateField("projectDescription", e.target.value)}
                      onBlur={() => markFieldAsTouched("projectDescription")}
                      placeholder="Describe la necesidad técnica o comercial..."
                      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary ${
                        getError("projectDescription")
                          ? "border-red-300 bg-red-50 text-slate-800"
                          : "border-slate-300 bg-white text-slate-800"
                      }`}
                      rows={2}
                    />
                    {getError("projectDescription") && (
                      <span className="block text-xs text-red-600">
                        {getError("projectDescription")}
                      </span>
                    )}
                  </div>


                  {/* ========== COMENTARIOS ========== */}
                  <div className="space-y-1 border-t border-slate-200 pt-4 mt-4">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Comentarios
                    </label>
                    <textarea
                      value={form.additionalComment}
                      onChange={(e) => updateField("additionalComment", e.target.value)}
                      onBlur={() => markFieldAsTouched("additionalComment")}
                      placeholder="Comentarios técnicos iniciales..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary bg-white text-slate-800"
                      rows={2}
                    />
                  </div>
                </FormCard>

              </div>
            )}

            {/* PASO 1: DISEÑO */}
            {activeStep === 1 && (
              <div className="space-y-5">
                {isDisenoNuevo(form.classification, form.projectType) && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
                    <p className="font-bold">Nuevo diseño</p>
                    <p className="mt-1 text-xs">
                      Este producto no tiene EDAG de referencia. La información de diseño será
                      completada y validada por Artes Gráficas en el Momento 2.
                    </p>
                  </div>
                )}

                {isCambioDiseno(form.classification, form.projectType) && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
                    <p className="font-bold">Cambio de diseño</p>
                    <p className="mt-1 text-xs">
                      Este producto parte de un producto vigente. Solo se habilitan los campos
                      relacionados con diseño y dimensiones según corresponda.
                    </p>
                  </div>
                )}

                <FormCard title="Especificaciones de diseño" icon="🎨" color="#8e44ad">
                  {(() => {
                    const isPrintingDisabled = form.printClass === "Sin impresión";

                    return (
                      <div className="space-y-4">
                        {/* Línea 1: Diseño de referencia + EDAG */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormSelect
                            label="¿Tiene Diseño de referencia? *"
                            value={form.hasEdagReference}
                            onChange={(value) => {
                              updateField("hasEdagReference", value);
                              markFieldAsTouched("hasEdagReference");
                            }}
                            onBlur={() => markFieldAsTouched("hasEdagReference")}
                            error={getError("hasEdagReference")}
                            placeholder="-- Seleccione --"
                            options={YES_NO_OPTIONS}
                            disabled={!canEditDesign || isDisenoNuevo(form.classification, form.projectType)}
                          />

                          {form.hasEdagReference === "Sí" && (
                            <>
                              <FormInput
                                label="Código EDAG"
                                value={form.edagCode}
                                onChange={(value) => updateField("edagCode", value)}
                                placeholder="Ej. EDAG-000001"
                                disabled={form.printClass === "Sin impresión"}
                              />

                              <FormInput
                                label="Versión EDAG"
                                value={form.edagVersion}
                                onChange={(value) => updateField("edagVersion", value)}
                                placeholder="Ej. 01"
                                disabled={form.printClass === "Sin impresión"}
                              />

                              <div className="flex flex-col justify-end">
                                <button
                                  type="button"
                                  className="h-10 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                                  onClick={() => {
                                    // Placeholder para la acción de consultar SI
                                    console.log("Consultar SI:", form.edagCode);
                                  }}
                                >
                                  Consultar SI
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Línea 2: Impresión + Tipo de Impresión + Forma de Impresión */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormSelect
                            label="Impresión *"
                            value={form.printClass}
                            onChange={(value) => updateField("printClass", value)}
                            onBlur={() => markFieldAsTouched("printClass")}
                            error={getError("printClass")}
                            placeholder="-- Seleccione --"
                            options={printClassOpt}
                            disabled={!canEditDesign}
                          />

                          <FormSelect
                            label={form.printClass && form.printClass !== "Sin impresión" ? "Tipo de Impresión *" : "Tipo de Impresión"}
                            value={form.printType}
                            onChange={(value) => updateField("printType", value)}
                            onBlur={() => markFieldAsTouched("printType")}
                            error={getError("printType")}
                            placeholder="-- Seleccione --"
                            options={printTypeOpt}
                            disabled={!canEditDesign || isPrintingDisabled}
                          />

                          <FormSelect
                            label="Forma de Impresión *"
                            value={form.printForm}
                            onChange={(value) => updateField("printForm", value)}
                            onBlur={() => markFieldAsTouched("printForm")}
                            error={getError("printForm")}
                            placeholder="-- Seleccione --"
                            options={PRODUCT_CATALOGS.formaDeImpresion.values.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            disabled={!canEditDesign || isPrintingDisabled}
                          />
                        </div>

                        {/* Línea 3: Especificaciones Especiales */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormSelect
                            label="Especificaciones Especiales"
                            value={form.specialDesignSpecs}
                            onChange={(value) => updateField("specialDesignSpecs", value)}
                            placeholder="-- Seleccione --"
                            options={SPECIAL_DESIGN_SPECS_OPTIONS}
                            disabled={!canEditDesign || isPrintingDisabled}
                          />
                        </div>

                        {/* Línea 3: Comentarios */}
                        {form.specialDesignSpecs === "Otros (comentar cuáles)" && (
                          <FormTextarea
                            label="Comentarios de diseños especiales"
                            value={form.specialDesignComments}
                            onChange={(value) => updateField("specialDesignComments", value)}
                            placeholder="Comentarios adicionales de Artes Gráficas..."
                          />
                        )}

                        {/* Objetivo de color - Multi selección */}

                        {/* Configuración de Formato - POUCH, BOLSA, LÁMINA o genérico */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-900">
                            Configuración de Formato
                          </h4>
                          
                          {isPouchWrapping(inheritedWrapping) ? (
                            <div className="space-y-4">
                              <FormSelect
                                label="Familia de Pouch *"
                                value={form.tipoFamiliaPouch}
                                onChange={handlePouchFamilyChange}
                                onBlur={() => markFieldAsTouched("tipoFamiliaPouch")}
                                error={getError("tipoFamiliaPouch")}
                                options={[
                                  { value: "Pouch Stand Up", label: "Pouch Stand Up" },
                                  { value: "Pouch Plano", label: "Pouch Plano" },
                                  { value: "Pouch con Sello Central", label: "Pouch con Sello Central" },
                                  { value: "Pouch con Sello en Fuelle", label: "Pouch con Sello en Fuelle" },
                                ]}
                                placeholder="-- Seleccione --"
                              />

                              {form.tipoFamiliaPouch === "Pouch Stand Up" && (
                                <>
                                  <FormSelect
                                    label="Tipo de Stand Up *"
                                    value={form.tipoStandUpPouch}
                                    onChange={handlePouchStandUpChange}
                                    onBlur={() => markFieldAsTouched("tipoStandUpPouch")}
                                    error={getError("tipoStandUpPouch")}
                                    options={[
                                      { value: "Tipo K", label: "Tipo K" },
                                      { value: "Normal", label: "Normal" },
                                      { value: "Doy Pack", label: "Doy Pack" },
                                    ]}
                                    placeholder="-- Seleccione --"
                                  />

                                  {form.tipoStandUpPouch === "Doy Pack" && (
                                    <>
                                      <FormSelect
                                        label="Base Doy Pack *"
                                        value={form.formaDoyPackPouch}
                                        onChange={handlePouchDoyPackShapeChange}
                                        onBlur={() => markFieldAsTouched("formaDoyPackPouch")}
                                        error={getError("formaDoyPackPouch")}
                                        options={[
                                          { value: "Redondo", label: "Redondo" },
                                          { value: "Cuadrado", label: "Cuadrado" },
                                        ]}
                                        placeholder="-- Seleccione --"
                                      />

                                      <FormSelect
                                        label="Tipo de Fuelle *"
                                        value={form.tipoFuelleStandUpPouch}
                                        onChange={handlePouchStandUpFuelleChange}
                                        onBlur={() => markFieldAsTouched("tipoFuelleStandUpPouch")}
                                        error={getError("tipoFuelleStandUpPouch")}
                                        options={[
                                          { value: "Fuelle Propio", label: "Fuelle Propio" },
                                          { value: "Fuelle Insertado", label: "Fuelle Insertado" },
                                        ]}
                                        placeholder="-- Seleccione --"
                                      />
                                    </>
                                  )}
                                </>
                              )}

                              {form.tipoFamiliaPouch === "Pouch Plano" && (
                                <FormSelect
                                  label="Cantidad de Sellos *"
                                  value={form.cantidadSellosPouchPlano}
                                  onChange={handlePouchPlanoSealCountChange}
                                  onBlur={() => markFieldAsTouched("cantidadSellosPouchPlano")}
                                  error={getError("cantidadSellosPouchPlano")}
                                  options={[
                                    { value: "Dos sellos", label: "Dos sellos" },
                                    { value: "Tres sellos", label: "Tres sellos" },
                                  ]}
                                  placeholder="-- Seleccione --"
                                />
                              )}

                              {form.tipoFamiliaPouch === "Pouch con Sello Central" && (
                                <>
                                  <FormSelect
                                    label="¿Tendrá Fuelle? *"
                                    value={form.tieneFuelleSelloCentralPouch}
                                    onChange={handlePouchCentralFuelleChange}
                                    onBlur={() => markFieldAsTouched("tieneFuelleSelloCentralPouch")}
                                    error={getError("tieneFuelleSelloCentralPouch")}
                                    options={YES_NO_OPTIONS}
                                    placeholder="-- Seleccione --"
                                  />

                                  <FormSelect
                                    label="Material del Sello Central *"
                                    value={form.materialSelloCentralPouch}
                                    onChange={handlePouchCentralMaterialChange}
                                    onBlur={() => markFieldAsTouched("materialSelloCentralPouch")}
                                    error={getError("materialSelloCentralPouch")}
                                    options={[
                                      { value: "PE-PE/PE", label: "PE-PE/PE" },
                                      { value: "Otro material", label: "Otro material" },
                                    ]}
                                    placeholder="-- Seleccione --"
                                  />
                                </>
                              )}

                              {form.tipoFamiliaPouch === "Pouch con Sello en Fuelle" && (
                                <FormSelect
                                  label="Tipo de Sello en Fuelle *"
                                  value={form.tipoSelloEnFuellePouch}
                                  onChange={handlePouchSealInGussetTypeChange}
                                  onBlur={() => markFieldAsTouched("tipoSelloEnFuellePouch")}
                                  error={getError("tipoSelloEnFuellePouch")}
                                  options={[
                                    { value: "Tipo 4-1", label: "Tipo 4-1" },
                                    { value: "Tipo 1-1", label: "Tipo 1-1" },
                                  ]}
                                  placeholder="-- Seleccione --"
                                />
                              )}
                            </div>
                          ) : isBolsaWrapping(inheritedWrapping) ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormSelect
                                  label="Tipo de presentación *"
                                  value={form.tipoPresentacionBolsa}
                                  onChange={(value) => {
                                    updateField("tipoPresentacionBolsa", value);
                                    updateField("tipoSelloBolsa", "");
                                    updateField("acabadoBolsa", "");
                                    updateField("tieneFuelleBolsa", "");
                                    updateField("tipoFuelleBolsa", "");
                                  }}
                                  options={[
                                    { value: "Bolsa sellada", label: "Bolsa sellada" },
                                    { value: "Wicket", label: "Wicket" },
                                    { value: "Hojas", label: "Hojas" },
                                  ]}
                                  placeholder="-- Seleccione --"
                                />

                                {form.tipoPresentacionBolsa === "Bolsa sellada" && (
                                  <FormSelect
                                    label="Tipo de Sello *"
                                    value={form.tipoSelloBolsa}
                                    onChange={(value) => {
                                      updateField("tipoSelloBolsa", value);
                                      updateField("acabadoBolsa", "");
                                      updateField("tieneFuelleBolsa", "");
                                      updateField("tipoFuelleBolsa", "");
                                    }}
                                    options={[
                                      { value: "Sello lateral", label: "Sello lateral" },
                                      { value: "Sello de fondo", label: "Sello de fondo" },
                                    ]}
                                    placeholder="-- Seleccione --"
                                  />
                                )}

                                {form.tipoSelloBolsa === "Sello lateral" && (
                                  <FormSelect
                                    label="Acabado *"
                                    value={form.acabadoBolsa}
                                    onChange={(value) => {
                                      updateField("acabadoBolsa", value);
                                    }}
                                    options={[
                                      { value: "Corte", label: "Corte" },
                                      { value: "Pestaña", label: "Pestaña" },
                                    ]}
                                    placeholder="-- Seleccione --"
                                  />
                                )}

                                {form.tipoPresentacionBolsa === "Bolsa sellada" && (
                                  <>
                                    <FormSelect
                                      label="¿Lleva Fuelle? *"
                                      value={form.tieneFuelleBolsa}
                                      onChange={(value) => {
                                        updateField("tieneFuelleBolsa", value);
                                        updateField("tipoFuelleBolsa", "");
                                      }}
                                      options={YES_NO_OPTIONS}
                                      placeholder="-- Seleccione --"
                                    />
                                    {form.tieneFuelleBolsa === "Sí" && (
                                      <FormSelect
                                        label="Tipo de Fuelle *"
                                        value={form.tipoFuelleBolsa}
                                        onChange={(value) => updateField("tipoFuelleBolsa", value)}
                                        options={[
                                          { value: "Fondo", label: "Fondo" },
                                          { value: "Lateral", label: "Lateral" },
                                        ]}
                                        placeholder="-- Seleccione --"
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ) : isLaminaWrapping(inheritedWrapping) ? (
                            <div className="space-y-4">
                              <FormSelect
                                label="Tipo de Lámina *"
                                value={form.tipoFormatoLamina}
                                onChange={(value) => {
                                  updateField("tipoFormatoLamina", value);
                                  markFieldAsTouched("tipoFormatoLamina");
                                }}
                                onBlur={() => markFieldAsTouched("tipoFormatoLamina")}
                                error={getError("tipoFormatoLamina")}
                                options={[
                                  { value: "Genérica", label: "Genérica" },
                                  { value: "Tissue", label: "Tissue" },
                                  { value: "Food", label: "Food" },
                                ]}
                                placeholder="-- Seleccione --"
                              />
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormSelect
                                label="Formato de Plano *"
                                value={form.blueprintFormat}
                                onChange={(value) => updateField("blueprintFormat", value)}
                                onBlur={() => markFieldAsTouched("blueprintFormat")}
                                error={getError("blueprintFormat")}
                                placeholder={!inheritedWrapping ? "Seleccione un portafolio primero" : "-- Seleccione --"}
                                options={getBlueprintFormatOptions(inheritedWrapping)}
                                disabled={!inheritedWrapping}
                              />
                              <div className="pt-5">
                                <PreviewRow
                                  label="Estructura"
                                  value={estructuraCalculada || "—"}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                      </div>
                    );
                  })()}
                </FormCard>

                {/* ¿Tiene plano de diseño? */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect
                    label="¿Tiene plano de diseño? *"
                    value={form.hasDesignPlan}
                    onChange={(value) => {
                      updateField("hasDesignPlan", value);
                      if (value === "No") {
                        updateField("designPlanType", "");
                        updateField("designPlanFiles", []);
                        updateField("designPlanComments", "");
                      }
                      markFieldAsTouched("hasDesignPlan");
                    }}
                    onBlur={() => markFieldAsTouched("hasDesignPlan")}
                    error={getError("hasDesignPlan")}
                    placeholder="-- Seleccione --"
                    options={YES_NO_OPTIONS}
                  />
                </div>

                <FormCard title="Información técnica de diseño" icon="🎨" color="#00395A">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormSelect
                      label="Objetivo de color"
                      value={form.colorObjectiveCode}
                      onChange={(value) => {
                        const selected = COLOR_OBJECTIVE_OPTIONS.find((item) => item.code === value);

                        updateField("colorObjectiveCode", selected?.code || "");
                        updateField("colorObjective", selected?.value || "");

                        if (selected?.code !== "5") {
                          updateField("colorObjectiveOther", "");
                        }

                        markFieldAsTouched("colorObjectiveCode");
                      }}
                      placeholder="-- Seleccione --"
                      options={COLOR_OBJECTIVE_OPTIONS.map((item) => ({
                        value: item.code,
                        label: item.label,
                      }))}
                      disabled={!canEditDesign}
                      error={getError("colorObjectiveCode")}
                    />

                    {(form.colorObjectiveCode === "5" || form.colorObjective === "Otros") && (
                      <FormInput
                        label="Objetivo de color - otro"
                        value={form.colorObjectiveOther}
                        onChange={(value) => updateField("colorObjectiveOther", value)}
                        onBlur={() => markFieldAsTouched("colorObjectiveOther")}
                        placeholder="Especifique el objetivo de color..."
                        disabled={!canEditDesign}
                        error={getError("colorObjectiveOther")}
                      />
                    )}

                    <FormSelect
                      label="Aprobador de prensa"
                      value={form.pressApproverCode}
                      onChange={(value) => {
                        const selected = PRESS_APPROVER_OPTIONS.find((item) => item.code === value);

                        updateField("pressApproverCode", selected?.code || "");
                        updateField("pressApprover", selected?.value || "");

                        markFieldAsTouched("pressApproverCode");
                      }}
                      placeholder="-- Seleccione --"
                      options={PRESS_APPROVER_OPTIONS.map((item) => ({
                        value: item.code,
                        label: item.label,
                      }))}
                      disabled={!canEditDesign}
                      error={getError("pressApproverCode")}
                    />

                    <FormInput
                      label="Código de referencia (ALUSA)"
                      value={form.alusaReferenceCode}
                      onChange={(value) => updateField("alusaReferenceCode", value)}
                      onBlur={() => markFieldAsTouched("alusaReferenceCode")}
                      placeholder="Ingrese código de referencia ALUSA..."
                      disabled={!canEditDesign}
                      error={getError("alusaReferenceCode")}
                    />
                  </div>

                  <div className="mt-4">
                    <FormTextarea
                      label="Instrucciones de trabajo para diseño"
                      value={form.designWorkInstructions}
                      onChange={(value) => updateField("designWorkInstructions", value)}
                      onBlur={() => markFieldAsTouched("designWorkInstructions")}
                      placeholder="Ingrese instrucciones específicas para diseño..."
                      disabled={!canEditDesign}
                      error={getError("designWorkInstructions")}
                    />
                  </div>
                </FormCard>

                {form.hasDesignPlan === "Sí" && (
                  <FormCard title="Carga de planos de diseño" icon="📎" color="#00395A" required>
                    <div className="space-y-4">
                      <FormSelect
                        label="Tipo de plano *"
                        value={form.designPlanType}
                        onChange={(value) => {
                          updateField("designPlanType", value);
                          updateField("designPlanFiles", []);
                          markFieldAsTouched("designPlanType");
                        }}
                        onBlur={() => markFieldAsTouched("designPlanType")}
                        error={getError("designPlanType")}
                        placeholder="-- Seleccione el tipo de plano --"
                        options={DESIGN_PLAN_TYPE_OPTIONS.map((item) => ({
                          value: item.value,
                          label: item.label,
                        }))}
                      />

                      {form.designPlanType && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                          {
                            DESIGN_PLAN_TYPE_OPTIONS.find(
                              (item) => item.value === form.designPlanType
                            )?.description
                          }
                        </div>
                      )}

                      {form.designPlanType &&
                        DESIGN_PLAN_TYPE_OPTIONS.find((item) => item.value === form.designPlanType)?.requiresFile && (
                          <ProjectPlansUploadSection
                            projectCode={projectCode}
                            error={getError("designPlanFiles")}
                            required
                            acceptedExtensions={
                              DESIGN_PLAN_TYPE_OPTIONS.find((item) => item.value === form.designPlanType)?.acceptedExtensions || []
                            }
                            onFilesChange={(fileNames) => {
                              updateField("designPlanFiles", fileNames);
                              markFieldAsTouched("designPlanFiles");
                            }}
                          />
                        )}

                      {form.designPlanType === "SOLO_DATOS_SIN_WEBCENTER" && (
                        <FormTextarea
                          label="Comentario de planos / WebCenter *"
                          value={form.designPlanComments}
                          onChange={(value) => updateField("designPlanComments", value)}
                          onBlur={() => markFieldAsTouched("designPlanComments")}
                          error={getError("designPlanComments")}
                          placeholder="Indicar por qué no se envía archivo de arte con WebCenter..."
                        />
                      )}
                    </div>
                  </FormCard>
                )}

                {/* BLOQUE: VISTA PREVIA DEL PLANO DIMENSIONAL */}
                {canEditDesign && (
                  <DimensionalPlanPreview
                    wrappingType={inheritedWrapping}
                    blueprintFormat={form.blueprintFormat}
                    width={form.width}
                    repeat={form.length}
                    perimeterMm={form.perimeterMm}
                    dimensionCrossCheckStatus={form.dimensionCrossCheckStatus}
                    perimeterValidationStatus={form.perimeterValidationStatus}
                  />
                )}

                {/* BLOQUE 1: PERÍMETROS */}
                {canEditDesign && (
                  <FormCard title="Perímetros" icon="📏" color="#e74c3c">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormInput
                          label="Perímetro (mm)"
                          type="number"
                          value={form.perimeterMm}
                          onChange={(value) => updateField("perimeterMm", value)}
                          placeholder="0"
                          disabled={!canEditDesign}
                        />
                        <FormSelect
                          label="Validación de dimensiones"
                          value={form.dimensionCrossCheckStatus}
                          onChange={(value) => updateField("dimensionCrossCheckStatus", value)}
                          placeholder="-- Seleccione --"
                          options={[
                            { value: "Validado", label: "Validado" },
                            { value: "Pendiente", label: "Pendiente" },
                            { value: "No aplica", label: "No aplica" },
                          ]}
                          disabled={!canEditDesign}
                        />
                        <FormSelect
                          label="Validación de perímetros"
                          value={form.perimeterValidationStatus}
                          onChange={(value) => updateField("perimeterValidationStatus", value)}
                          placeholder="-- Seleccione --"
                          options={[
                            { value: "Validado", label: "Validado" },
                            { value: "Pendiente", label: "Pendiente" },
                            { value: "No aplica", label: "No aplica" },
                          ]}
                          disabled={!canEditDesign}
                        />
                      </div>
                      <FormTextarea
                        label="Comentario de perímetro"
                        value={form.perimeterComment}
                        onChange={(value) => updateField("perimeterComment", value)}
                        placeholder="Comentarios adicionales sobre el perímetro..."
                        disabled={!canEditDesign}
                      />
                    </div>
                  </FormCard>
                )}

                {/* BLOQUE 2: FOTOREGISTRO */}
                {canEditDesign && (
                  <FormCard title="Datos del Fotoregistro" icon="📸" color="#3498db">
                    <div className="space-y-6">
                      {/* Fotoregistro 1 */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-900">Fotoregistro 1</h5>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormSelect
                            label="¿Tiene Fotoregistro 1?"
                            value={form.hasPhotoregister1}
                            onChange={(value) => {
                              updateField("hasPhotoregister1", value);
                              if (value === "No") {
                                updateField("fr1Width", "");
                                updateField("fr1Height", "");
                                updateField("fr1MarginLeft", "");
                                updateField("fr1MarginRight", "");
                                updateField("fr1MarginTop", "");
                                updateField("fr1MarginBottom", "");
                              }
                            }}
                            placeholder="-- Seleccione --"
                            options={YES_NO_OPTIONS}
                            disabled={!canEditDesign}
                          />
                        </div>

                        {form.hasPhotoregister1 === "Sí" && (
                          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FormInput
                              label="Ancho (mm)"
                              type="number"
                              value={form.fr1Width}
                              onChange={(value) => updateField("fr1Width", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Alto (mm)"
                              type="number"
                              value={form.fr1Height}
                              onChange={(value) => updateField("fr1Height", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Margen Izquierdo (mm)"
                              type="number"
                              value={form.fr1MarginLeft}
                              onChange={(value) => updateField("fr1MarginLeft", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Margen Derecho (mm)"
                              type="number"
                              value={form.fr1MarginRight}
                              onChange={(value) => updateField("fr1MarginRight", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Margen Superior (mm)"
                              type="number"
                              value={form.fr1MarginTop}
                              onChange={(value) => updateField("fr1MarginTop", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Margen Inferior (mm)"
                              type="number"
                              value={form.fr1MarginBottom}
                              onChange={(value) => updateField("fr1MarginBottom", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                          </div>
                        )}
                      </div>

                      {/* Fotoregistro 2 */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-900">Fotoregistro 2</h5>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormSelect
                            label="¿Tiene Fotoregistro 2?"
                            value={form.hasPhotoregister2}
                            onChange={(value) => {
                              updateField("hasPhotoregister2", value);
                              if (value === "No") {
                                updateField("fr2Width", "");
                                updateField("fr2Height", "");
                                updateField("fr2MarginLeft", "");
                                updateField("fr2MarginRight", "");
                                updateField("fr2MarginTop", "");
                                updateField("fr2MarginBottom", "");
                              }
                            }}
                            placeholder="-- Seleccione --"
                            options={YES_NO_OPTIONS}
                            disabled={!canEditDesign}
                          />
                        </div>

                        {form.hasPhotoregister2 === "Sí" && (
                          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FormInput
                              label="Ancho (mm)"
                              type="number"
                              value={form.fr2Width}
                              onChange={(value) => updateField("fr2Width", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Alto (mm)"
                              type="number"
                              value={form.fr2Height}
                              onChange={(value) => updateField("fr2Height", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Margen Izquierdo (mm)"
                              type="number"
                              value={form.fr2MarginLeft}
                              onChange={(value) => updateField("fr2MarginLeft", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Margen Derecho (mm)"
                              type="number"
                              value={form.fr2MarginRight}
                              onChange={(value) => updateField("fr2MarginRight", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Margen Superior (mm)"
                              type="number"
                              value={form.fr2MarginTop}
                              onChange={(value) => updateField("fr2MarginTop", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                            <FormInput
                              label="Margen Inferior (mm)"
                              type="number"
                              value={form.fr2MarginBottom}
                              onChange={(value) => updateField("fr2MarginBottom", value)}
                              placeholder="0"
                              disabled={!canEditDesign}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </FormCard>
                )}

                {/* BLOQUE 3: SENTIDO DE BOBINADO */}
                {canEditDesign && (
                  <FormCard title="Sentido de Embobinado" icon="🔄" color="#27ae60">
                    <div className="space-y-4">
                      <RewindingDirectionSelector
                        value={form.rewindingDirection}
                        onChange={(value) => {
                          updateField("rewindingDirection", value);
                          markFieldAsTouched("rewindingDirection");
                        }}
                        disabled={!canEditDesign}
                      />

                      <FormInput
                        label="Referencia de sentido"
                        value={form.rewindingDirectionRef}
                        onChange={(value) => updateField("rewindingDirectionRef", value)}
                        onBlur={() => markFieldAsTouched("rewindingDirectionRef")}
                        placeholder="Descripción o referencia"
                        disabled={!canEditDesign}
                      />
                    </div>
                  </FormCard>
                )}

                {/* BLOQUE OPCIONAL: FOTOCELDA */}
                {canEditDesign && (
                  <FormCard title="Fotocelda" icon="📹" color="#9b59b6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormSelect
                          label="¿Tiene fotocelda?"
                          value={form.hasPhotocell}
                          onChange={(value) => {
                            updateField("hasPhotocell", value);
                            if (value === "No") {
                              updateField("photocellLocation", "");
                            }
                          }}
                          placeholder="-- Seleccione --"
                          options={YES_NO_OPTIONS}
                          disabled={!canEditDesign}
                        />
                        {form.hasPhotocell === "Sí" && (
                          <FormSelect
                            label="Ubicación fotocelda"
                            value={form.photocellLocation}
                            onChange={(value) => updateField("photocellLocation", value)}
                            placeholder="-- Seleccione --"
                            options={[
                              { value: "Superior", label: "Superior" },
                              { value: "Inferior", label: "Inferior" },
                              { value: "Izquierda", label: "Izquierda" },
                              { value: "Derecha", label: "Derecha" },
                              { value: "Centro", label: "Centro" },
                            ]}
                            disabled={!canEditDesign}
                          />
                        )}
                      </div>
                    </div>
                  </FormCard>
                )}
              </div>
            )}

            {/* PASO 2: ESTRUCTURA */}
            {activeStep === 2 && (
              <div className="space-y-5">
                <CollapsibleSection
                  title="Especificaciones de estructura"
                  icon="🔩"
                  color="#f39c12"
                  isOpen={openStructureSections.specs}
                  onToggle={() => toggleStructureSection("specs")}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormSelect
                      label="¿Tiene estructura de referencia?"
                      value={form.hasReferenceStructure}
                      onChange={(value) => updateField("hasReferenceStructure", value)}
                      placeholder="-- Seleccione --"
                      options={YES_NO_OPTIONS}
                      disabled={!canEditStructure}
                    />
                    {form.hasReferenceStructure === "Sí" && (
                      <>
                        <FormInput
                          label="Código E/M Referencia"
                          value={form.referenceEmCode}
                          onChange={(value) => updateField("referenceEmCode", value)}
                          placeholder="Ej. EM-000001"
                        />
                        <FormInput
                          label="Versión E/M"
                          value={form.referenceEmVersion}
                          onChange={(value) => updateField("referenceEmVersion", value)}
                          placeholder="Ej. 01"
                        />
                      </>
                    )}
                    {form.hasReferenceStructure !== "Sí" && (
                      <PreviewRow
                        label="Tipo de Estructura (Calculado)"
                        value={form.structureType || "—"}
                      />
                    )}
                  </div>

                  {form.hasReferenceStructure !== "Sí" && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                            Capas de estructura
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {visibleLayerCount > 1 && (
                            <button
                              type="button"
                              onClick={handleRemoveLastLayer}
                              className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              Quitar capa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleAddLayer}
                            disabled={visibleLayerCount >= 4}
                            className={[
                              "h-9 rounded-lg px-3 text-xs font-semibold transition",
                              visibleLayerCount >= 4
                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                : "border border-brand-primary bg-white text-brand-primary hover:bg-brand-primary/5",
                            ].join(" ")}
                          >
                            + Nueva capa
                          </button>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-col gap-2 rounded-lg bg-white border border-slate-200 p-3">
                        <div className="text-xs font-semibold text-slate-600">
                          Capas seleccionadas: <span className="text-brand-primary">{visibleLayerCount} de 4</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-600">
                          Tipo de estructura calculado: <span className="text-brand-primary">{form.structureType || "—"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {(() => {
                          return [1, 2, 3, 4].filter(layer => layer <= visibleLayerCount).map((layer) => {
                            const materialKey = `layer${layer}Material` as keyof ProjectEditFormData;
                            const micronKey = `layer${layer}Micron` as keyof ProjectEditFormData;
                            const grammageKey = `layer${layer}Grammage` as keyof ProjectEditFormData;
                            const groupKey = `layer${layer}MaterialGroup` as keyof ProjectEditFormData;

                            const selectedMaterialCode = form[materialKey] as string;
                            const selectedMicron = form[micronKey] as string;
                            const micronControl = getMicronFrontendControl(selectedMaterialCode);
                            const selectedMaterial = resolveMaterialLayer(selectedMaterialCode);

                            return (
                              <div key={layer} className="rounded-lg border border-slate-200 bg-white p-4">
                                <p className="mb-3 text-xs font-bold uppercase text-brand-primary">
                                  Capa {layer}
                                </p>
                                <div className="space-y-3">
                                  <FormSelect
                                    label="Tipo de material por capa *"
                                    value={selectedMaterialCode}
                                    onChange={(value) => {
                                      updateField(materialKey, value);
                                      updateField(micronKey, "");
                                      updateField(grammageKey, "");

                                      // Update group internally
                                      if (value) {
                                        const mat = resolveMaterialLayer(value);
                                        if (mat) {
                                          updateField(groupKey, mat.TbMatCapGmp);
                                        }
                                      }

                                      markFieldAsTouched(materialKey);
                                      markFieldAsTouched(micronKey);
                                      markFieldAsTouched(grammageKey);
                                    }}
                                    onBlur={() => markFieldAsTouched(materialKey)}
                                    error={getError(materialKey)}
                                    placeholder="-- Seleccione material --"
                                    options={MATERIAL_LAYER_OPTIONS}
                                    disabled={!canEditStructure}
                                  />

                                  {selectedMaterialCode && (
                                    <>
                                      {micronControl.mode === "VALOR" && (
                                        <FormSelect
                                          label={`Micraje ${layer}`}
                                          value={selectedMicron}
                                          onChange={(value) => updateField(micronKey, value)}
                                          onBlur={() => markFieldAsTouched(micronKey)}
                                          error={getError(micronKey)}
                                          options={micronControl.options.map((option) => ({
                                            value: option.value,
                                            label: `${option.value} µm`,
                                          }))}
                                          placeholder="Opcional"
                                          disabled={!canEditStructure}
                                        />
                                      )}

                                      {micronControl.mode === "RANGO" && (
                                        <FormInput
                                          label={`Micraje ${layer} (${micronControl.minValue}-${micronControl.maxValue} µm)`}
                                          value={selectedMicron}
                                          onChange={(value) => updateField(micronKey, value)}
                                          onBlur={() => markFieldAsTouched(micronKey)}
                                          error={getError(micronKey)}
                                          placeholder={`${micronControl.minValue}-${micronControl.maxValue} µm`}
                                          disabled={!canEditStructure}
                                        />
                                      )}

                                      {micronControl.mode === "NONE" && (
                                        <FormInput
                                          label={`Micraje ${layer}`}
                                          value={selectedMicron}
                                          onChange={(value) => updateField(micronKey, value)}
                                          onBlur={() => markFieldAsTouched(micronKey)}
                                          error={getError(micronKey)}
                                          placeholder="Opcional (µm)"
                                          disabled={!canEditStructure}
                                        />
                                      )}

                                      <FormInput
                                        label={`Gramaje ${layer}`}
                                        value={form[grammageKey] as string}
                                        onChange={() => { }}
                                        onBlur={() => markFieldAsTouched(grammageKey)}
                                        error={getError(grammageKey)}
                                        placeholder="Calculado automáticamente"
                                        disabled={true}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {(() => {
                        const completedLayers: string[] = [];
                        const missingLayers: string[] = [];

                        for (let i = 1; i <= visibleLayerCount; i++) {
                          const material = form[`layer${i}Material` as keyof ProjectEditFormData] as string;
                          const micron = form[`layer${i}Micron` as keyof ProjectEditFormData] as string;
                          const grammage = form[`layer${i}Grammage` as keyof ProjectEditFormData] as string;

                          const isLayerComplete = material && micron && grammage;

                          if (isLayerComplete) {
                            const materialDisplay = getMaterialTypeForSummary(material);
                            completedLayers.push(`${materialDisplay}, ${micron}`);
                          } else {
                            missingLayers.push(`Capa ${i}`);
                          }
                        }

                        return (
                          <div className="mt-4 rounded-lg bg-white border border-slate-200 p-3">
                            <p className="text-xs font-semibold text-slate-600 mb-2">
                              Materia Prima General:
                            </p>

                            {completedLayers.length > 0 ? (
                              <p className="text-sm text-slate-700 font-medium break-words">
                                {completedLayers.join(" | ")}
                              </p>
                            ) : (
                              <p className="text-sm text-slate-500">
                                Aún no hay capas completas.
                              </p>
                            )}

                            {missingLayers.length > 0 && (
                              <p className="mt-2 text-xs font-medium text-red-600">
                                Falta completar: {missingLayers.join(", ")}.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormInput
                        label="Gramaje general (g/m2) *"
                        value={form.grammage}
                        onChange={() => { }}
                        onBlur={() => markFieldAsTouched("grammage")}
                        error={getError("grammage")}
                        placeholder="Calculado automáticamente"
                        disabled={true}
                      />

                      <FormSelect
                        label="¿Solicitud de muestra? *"
                        value={form.sampleRequest}
                        onChange={(value) => {
                          updateField("sampleRequest", value);
                          markFieldAsTouched("sampleRequest");
                        }}
                        onBlur={() => markFieldAsTouched("sampleRequest")}
                        error={getError("sampleRequest")}
                        placeholder="-- Seleccione --"
                        options={YES_NO_OPTIONS}
                      />

                      <p className="md:col-span-3 text-xs text-slate-500">
                        Cálculo del gramaje general: suma de gramajes de capas (
                        {formatGrammageValue(layerGrammageTotal)} g/m2) + Tintas y Adhesivos{" "}
                        {form.structureType
                          ? `(${form.structureType}: ${formatGrammageValue(fixedInkAdhesiveGrammage)} g/m2)`
                          : "(según tipo de estructura)"}
                        {" "} = {form.grammage || "0"} g/m2.
                      </p>

                      <div className="md:col-span-3">
                        <FormTextarea
                          label="Comentarios"
                          value={form.specialStructureSpecs}
                          onChange={(value) => updateField("specialStructureSpecs", value)}
                          placeholder="Restricciones, barreras, sellabilidad, resistencia, OTR/WVTR..."
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Dimensiones y accesorios"
                  icon="⌗"
                  color="#16a085"
                  isOpen={openStructureSections.dimensions}
                  onToggle={() => toggleStructureSection("dimensions")}
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                    {(() => {
                      const wrapping = inheritedWrapping?.toLowerCase() || "";
                      const showRepetition = shouldShowRepetitionField(inheritedWrapping, form.blueprintFormat);
                      const isPouchOrBolsa = wrapping.includes("pouch") || wrapping.includes("bolsa");
                      const isLamina = isLaminaWrapping(inheritedWrapping);

                      // For LÁMINA, determine if width should be shown based on blueprint format
                      const normalizedBlueprintFormat = String(form.blueprintFormat || "")
                        .trim()
                        .toUpperCase();
                      const isLaminaFood = isLamina && normalizedBlueprintFormat === "FOOD";
                      let shouldShowWidth = isPouchOrBolsa;
                      if (isLamina) {
                        // Show width for TISSUE and GENERICA, hide for FOOD
                        shouldShowWidth = normalizedBlueprintFormat === "TISSUE" || normalizedBlueprintFormat === "GENERICA";
                      }

                      const widthRestriction = dimensionRestrictions.width;
                      const lengthRestriction = dimensionRestrictions.length;
                      const gussetRestriction = dimensionRestrictions.gussetWidth;

                      const isWidthDisabled = !widthRestriction || (widthRestriction.min === 0 && widthRestriction.max === 0);
                      const isLengthDisabled = !lengthRestriction || (lengthRestriction.min === 0 && lengthRestriction.max === 0);
                      const isGussetDisabled = !gussetRestriction || (gussetRestriction.min === 0 && gussetRestriction.max === 0);

                      return (
                        <>
                          {shouldShowWidth && (
                            <div>
                              <FormInput
                                label="Ancho *"
                                value={form.width}
                                onChange={(value) => updateField("width", value)}
                                onBlur={() => markFieldAsTouched("width")}
                                error={getError("width")}
                                placeholder={widthRestriction ? `${widthRestriction.min} - ${widthRestriction.max} mm` : "mm"}
                                disabled={!canEditDimensions || isWidthDisabled || shouldFieldBeDisabled("width", form.projectType, inheritedFields)}
                              />
                              {widthRestriction && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDimensionRange(widthRestriction)}
                                </p>
                              )}
                              <FieldBadges
                                isInherited={inheritedFields.has("width")}
                                isSiField={isSiField("width", form.blueprintFormat)}
                                isLocked={isFieldLockedByMot("width", form.projectType)}
                              />
                            </div>
                          )}
                          {!isLaminaFood && (
                            <div>
                              <FormInput
                                label={isLamina ? "Repetición / Largo *" : "Largo *"}
                                value={form.length}
                                onChange={(value) => updateField("length", value)}
                                onBlur={() => markFieldAsTouched("length")}
                                error={getError("length")}
                                placeholder={lengthRestriction ? `${lengthRestriction.min} - ${lengthRestriction.max} mm` : "mm"}
                                disabled={!canEditDimensions || isLengthDisabled || shouldFieldBeDisabled("length", form.projectType, inheritedFields)}
                              />
                              {lengthRestriction && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDimensionRange(lengthRestriction)}
                                </p>
                              )}
                              <FieldBadges
                                isInherited={inheritedFields.has("length")}
                                isSiField={isSiField("length", form.blueprintFormat)}
                                isLocked={isFieldLockedByMot("length", form.projectType)}
                              />
                            </div>
                          )}
                          {showRepetition && (
                            <FormInput
                              label="Repetición *"
                              value={form.repetition}
                              onChange={(value) => updateField("repetition", value)}
                              onBlur={() => markFieldAsTouched("repetition")}
                              error={getError("repetition")}
                              placeholder="mm"
                            />
                          )}
                          {!isLaminaFood && (
                            <div>
                              <FormInput
                                label="Ancho Fuelle *"
                                value={form.gussetWidth}
                                onChange={(value) => updateField("gussetWidth", value)}
                                onBlur={() => markFieldAsTouched("gussetWidth")}
                                error={getError("gussetWidth")}
                                placeholder={gussetRestriction ? `${gussetRestriction.min} - ${gussetRestriction.max} mm` : "mm"}
                                disabled={!canEditDimensions || isGussetDisabled || shouldFieldBeDisabled("gussetWidth", form.projectType, inheritedFields)}
                              />
                              {gussetRestriction && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDimensionRange(gussetRestriction)}
                                </p>
                              )}
                              <FieldBadges
                                isInherited={inheritedFields.has("gussetWidth")}
                                isSiField={isSiField("gussetWidth", form.blueprintFormat)}
                                isLocked={isFieldLockedByMot("gussetWidth", form.projectType)}
                              />
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="mt-4 space-y-5">
                    {(() => {
                      const selectedAccessories = [
                        form.hasZipper === "Sí" ? "hasZipper" : null,
                        form.hasTinTie === "Sí" ? "hasTinTie" : null,
                        form.hasValve === "Sí" ? "hasValve" : null,
                        form.hasDieCutHandle === "Sí" ? "hasDieCutHandle" : null,
                        form.hasReinforcement === "Sí" ? "hasReinforcement" : null,
                        form.hasAngularCut === "Sí" ? "hasAngularCut" : null,
                        form.hasRoundedCorners === "Sí" ? "hasRoundedCorners" : null,
                        form.hasNotch === "Sí" ? "hasNotch" : null,
                        form.hasPerforation === "Sí" ? "hasPerforation" : null,
                        form.hasPreCut === "Sí" ? "hasPreCut" : null,
                      ].filter(Boolean) as string[];

                      const selectedCount = selectedAccessories.length;
                      const canSelectMore = selectedCount < 3;

                      const toggleAccessory = (field: keyof ProjectEditFormData) => {
                        const isCurrentlySelected = form[field] === "Sí";
                        if (isCurrentlySelected) {
                          updateField(field, "No");
                        } else if (canSelectMore) {
                          updateField(field, "Sí");
                        }
                      };

                      const AccessoryCheckbox = ({ field, label }: { field: keyof ProjectEditFormData; label: string }) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form[field] === "Sí"}
                            onChange={() => toggleAccessory(field)}
                            disabled={form[field] !== "Sí" && !canSelectMore}
                            className="w-4 h-4 rounded border-slate-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className={`text-sm ${form[field] !== "Sí" && !canSelectMore ? "text-slate-400" : "text-slate-700"}`}>
                            {label}
                          </span>
                        </label>
                      );

                      return (
                        <>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-3 text-xs font-bold uppercase text-slate-600">Accesorios Consumibles</p>
                            <div className="space-y-3">
                              <AccessoryCheckbox field="hasZipper" label="Zipper" />
                              {form.hasZipper === "Sí" && (
                                <FormSelect label="Tipo de Zipper" value={form.zipperType} onChange={(value) => updateField("zipperType", value)} placeholder="-- Seleccione --" options={zipperTypeOpt} />
                              )}
                              <AccessoryCheckbox field="hasTinTie" label="Tin-Tie" />
                              <AccessoryCheckbox field="hasValve" label="Válvula" />
                              {form.hasValve === "Sí" && (
                                <FormSelect label="Tipo de Válvula" value={form.valveType} onChange={(value) => updateField("valveType", value)} placeholder="-- Seleccione --" options={valveTypeOpt} />
                              )}
                            </div>
                          </div>

                          {(() => {
                            const wrappingForAccesorios = inheritedWrapping?.toLowerCase() || "";
                            const isBolsa = wrappingForAccesorios.includes("bolsa");
                            return isBolsa ? (
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-3 text-xs font-bold uppercase text-slate-600">Accesorios Producto</p>
                                <div className="space-y-3">
                                  <AccessoryCheckbox field="hasDieCutHandle" label="Asa Troquelada" />
                                  <AccessoryCheckbox field="hasReinforcement" label="Refuerzo" />
                                  {form.hasReinforcement === "Sí" && (
                                    <div className="grid grid-cols-2 gap-3">
                                      <FormInput label="Espesor Refuerzo (g/m2)" value={form.reinforcementThickness} onChange={(value) => updateField("reinforcementThickness", value)} placeholder="Ej. 100" />
                                      <FormInput label="Ancho Refuerzo (mm)" value={form.reinforcementWidth} onChange={(value) => updateField("reinforcementWidth", value)} placeholder="Ej. 50" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {shouldShowInternalAccessories && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                              <p className="mb-3 text-xs font-bold uppercase text-slate-600">Accesorios Internos</p>
                              <div className="space-y-3">
                                <AccessoryCheckbox field="hasAngularCut" label="Corte Angular" />
                                <AccessoryCheckbox field="hasRoundedCorners" label="Esquinas Redondas" />
                                {form.hasRoundedCorners === "Sí" && (
                                  <FormSelect label="Tipo Esquinas Redondas" value={form.roundedCornersType} onChange={(value) => updateField("roundedCornersType", value)} placeholder="-- Seleccione --" options={roundedCornersOpt} />
                                )}
                                <AccessoryCheckbox field="hasNotch" label="Muesca" />
                                <AccessoryCheckbox field="hasPerforation" label="Perforación" />
                                {hasPerforation && (
                                  <div className="space-y-3">
                                    {shouldShowPouchPerforationType && (
                                      <FormSelect
                                        label="Tipo Perforación Pouch"
                                        value={form.pouchPerforationType}
                                        onChange={(value) => updateField("pouchPerforationType", value)}
                                        onBlur={() => markFieldAsTouched("pouchPerforationType")}
                                        error={getError("pouchPerforationType")}
                                        placeholder="-- Seleccione --"
                                        options={pouchPerforationOpt}
                                      />
                                    )}
                                    {shouldShowBolsaPerforationType && (
                                      <FormSelect
                                        label="Tipo Perforación Bolsa"
                                        value={form.bagPerforationType}
                                        onChange={(value) => updateField("bagPerforationType", value)}
                                        onBlur={() => markFieldAsTouched("bagPerforationType")}
                                        error={getError("bagPerforationType")}
                                        placeholder="-- Seleccione --"
                                        options={bagPerforationOpt}
                                      />
                                    )}
                                    <FormSelect
                                      label="Ubicación Perforaciones"
                                      value={form.perforationLocation}
                                      onChange={(value) => updateField("perforationLocation", value)}
                                      onBlur={() => markFieldAsTouched("perforationLocation")}
                                      error={getError("perforationLocation")}
                                      placeholder="-- Seleccione --"
                                      options={PERFORATION_LOCATION_OPTIONS}
                                    />
                                  </div>
                                )}
                                <AccessoryCheckbox field="hasPreCut" label="Pre-Corte" />
                                {form.hasPreCut === "Sí" && (
                                  <FormSelect label="Tipo de Pre-Corte" value={form.preCutType} onChange={(value) => updateField("preCutType", value)} placeholder="-- Seleccione --" options={precutTypeOpt} />
                                )}
                              </div>
                            </div>
                          )}

                          <FormSelect
                            label="Otros accesorios"
                            value={form.otherAccessories}
                            onChange={(value) => updateField("otherAccessories", value)}
                            placeholder="-- Seleccione --"
                            options={OTHER_ACCESSORIES_OPTIONS}
                          />

                          <div className="text-xs text-slate-500 text-center">
                            Accesorios seleccionados: {selectedCount}/3 {!canSelectMore && "(máximo alcanzado)"}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CollapsibleSection>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormSelect
                      label="¿Tiene Especificación Técnica del Cliente?"
                      value={form.hasCustomerTechnicalSpec}
                      onChange={(value) => {
                        updateField("hasCustomerTechnicalSpec", value);

                        if (value !== "Sí") {
                          updateField("customerTechnicalSpecAttachment", "");
                        }

                        markFieldAsTouched("hasCustomerTechnicalSpec");
                      }}
                      onBlur={() => markFieldAsTouched("hasCustomerTechnicalSpec")}
                      error={getError("hasCustomerTechnicalSpec")}
                      placeholder="-- Seleccione --"
                      options={YES_NO_OPTIONS}
                    />
                  </div>

                  {form.hasCustomerTechnicalSpec === "Sí" && (
                    <>
                      <CustomerTechnicalSpecUploadSection
                        projectCode={projectCode}
                        error={getError("customerTechnicalSpecFiles")}
                        required={true}
                        onFilesChange={(fileNames) => {
                          updateField("customerTechnicalSpecFiles", fileNames);
                          markFieldAsTouched("customerTechnicalSpecFiles");
                        }}
                        embedded={true}
                      />
                      <FormTextarea
                        label="Comentarios (Opcional)"
                        value={form.customerTechnicalSpecComments}
                        onChange={(value) => {
                          updateField("customerTechnicalSpecComments", value);
                          markFieldAsTouched("customerTechnicalSpecComments");
                        }}
                        onBlur={() => markFieldAsTouched("customerTechnicalSpecComments")}
                        placeholder="Comentarios adicionales sobre la especificación técnica"
                        rows={3}
                      />
                    </>
                  )}
                </div>

                {/* Especificaciones de Core en Estructura - Solo para LÁMINA */}
                {isLaminaWrapping(inheritedWrapping) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm">
                      🧻
                    </span>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                        Especificaciones de Core
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormSelect
                      label="Material del Core"
                      value={form.coreMaterial}
                      onChange={(value) => {
                        updateField("coreMaterial", value);
                        markFieldAsTouched("coreMaterial");
                      }}
                      onBlur={() => markFieldAsTouched("coreMaterial")}
                      error={getError("coreMaterial")}
                      placeholder="-- Seleccione --"
                      options={coreMaterialOpt}
                    />

                    <FormInput
                      label="Diámetro Core"
                      value={form.coreDiameter}
                      onChange={(value) => updateField("coreDiameter", value)}
                      onBlur={() => markFieldAsTouched("coreDiameter")}
                      error={getError("coreDiameter")}
                      placeholder="Ej. 76"
                    />

                    <FormInput
                      label="Diámetro Externo"
                      value={form.externalDiameter}
                      onChange={(value) => updateField("externalDiameter", value)}
                      onBlur={() => markFieldAsTouched("externalDiameter")}
                      error={getError("externalDiameter")}
                      placeholder="Ej. 600"
                    />

                    <FormInput
                      label="Variación Externa +"
                      value={form.externalVariationPlus}
                      onChange={(value) => updateField("externalVariationPlus", value)}
                      onBlur={() => markFieldAsTouched("externalVariationPlus")}
                      error={getError("externalVariationPlus")}
                      placeholder="Ej. 5"
                    />

                    <FormInput
                      label="Variación Externa -"
                      value={form.externalVariationMinus}
                      onChange={(value) => updateField("externalVariationMinus", value)}
                      onBlur={() => markFieldAsTouched("externalVariationMinus")}
                      error={getError("externalVariationMinus")}
                      placeholder="Ej. 5"
                    />

                    <FormInput
                      label="Peso Máximo Rollo (kg)"
                      value={form.maxRollWeight}
                      onChange={(value) => updateField("maxRollWeight", value)}
                      onBlur={() => markFieldAsTouched("maxRollWeight")}
                      error={getError("maxRollWeight")}
                      placeholder="Ej. 500"
                    />
                  </div>
                </div>
                )}

              </div>
            )}

            {/* PASO 4: EMBALAJE Y EMPALMES */}
            {activeStep === 3 && (
              <div className="space-y-5">
                <FormCard title="Embalaje y Empalmes" icon="📦" color="#27ae60">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormSelect
                      label="Embalaje de material"
                      value={form.materialPackaging}
                      onChange={(value) => {
                        updateField("materialPackaging", value);
                        markFieldAsTouched("materialPackaging");
                      }}
                      onBlur={() => markFieldAsTouched("materialPackaging")}
                      error={getError("materialPackaging")}
                      options={[
                        { value: "Caja de cartón", label: "Caja de cartón" },
                        { value: "Bolsa de polietileno", label: "Bolsa de polietileno" },
                        { value: "Film retráctil", label: "Film retráctil" },
                        { value: "Pallet", label: "Pallet" },
                      ]}
                      placeholder="-- Seleccione --"
                    />

                    <FormSelect
                      label="Embalaje de Productos de Exportación"
                      value={form.exportProductPackaging}
                      onChange={(value) => {
                        updateField("exportProductPackaging", value);
                        markFieldAsTouched("exportProductPackaging");
                      }}
                      onBlur={() => markFieldAsTouched("exportProductPackaging")}
                      error={getError("exportProductPackaging")}
                      options={[
                        { value: "Caja de exportación", label: "Caja de exportación" },
                        { value: "Contenedor hermético", label: "Contenedor hermético" },
                        { value: "Film protector", label: "Film protector" },
                        { value: "No aplica", label: "No aplica" },
                      ]}
                      placeholder="-- Seleccione --"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                    <FormTextarea
                      label="Embalaje de material especial"
                      value={form.specialMaterialPackaging}
                      onChange={(value) => {
                        updateField("specialMaterialPackaging", value);
                        markFieldAsTouched("specialMaterialPackaging");
                      }}
                      onBlur={() => markFieldAsTouched("specialMaterialPackaging")}
                      error={getError("specialMaterialPackaging")}
                      placeholder="Describe condiciones especiales de embalaje..."
                      rows={3}
                    />

                    <FormSelect
                      label="Empalmes"
                      value={form.splices}
                      onChange={(value) => {
                        updateField("splices", value);
                        markFieldAsTouched("splices");
                      }}
                      onBlur={() => markFieldAsTouched("splices")}
                      error={getError("splices")}
                      options={[
                        { value: "Sin empalmes", label: "Sin empalmes" },
                        { value: "Empalme simple", label: "Empalme simple" },
                        { value: "Empalme reforzado", label: "Empalme reforzado" },
                        { value: "Empalme adhesivo", label: "Empalme adhesivo" },
                      ]}
                      placeholder="-- Seleccione --"
                    />
                  </div>
                </FormCard>
              </div>
            )}

          </div>

          {/* ========== COLUMNA DERECHA: PANEL DE CONTEXTO (STICKY) ========== */}
          <div className="space-y-5">
            {/* TARJETA: PRODUCTO CORE */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-slate-900 mb-3">Producto</h3>

              <div className="space-y-2 text-sm">
                <PreviewRow
                  label="SKU"
                  value={displaySkuCode || "—"}
                />

                <PreviewRow
                  label="Nombre de producto"
                  value={
                    form.projectName
                      ? `${form.projectName} ${form.estimatedVolume || ""} ${form.unitOfMeasure || ""}`.trim()
                      : "—"
                  }
                />

                <PreviewRow
                  label="Clasificación"
                  value={
                    isProductoNuevo(form.classification)
                      ? "Producto nuevo"
                      : isProductoModificado(form.classification)
                        ? "Producto modificado"
                        : "—"
                  }
                />

                <PreviewRow
                  label="Motivo"
                  value={form.projectType || "—"}
                />

                <PreviewRow
                  label="Formato de Plano"
                  value={form.blueprintFormat || "Pendiente de definir"}
                />

                <PreviewRow
                  label="Estructura calculada"
                  value={estructuraCalculada || "—"}
                />

                {form.printClass && (
                  <PreviewRow
                    label="¿Requiere trabajo de diseño?"
                    value={form.printClass === "Sin impresión" ? "No" : "Sí"}
                  />
                )}
              </div>
            </div>

            {/* HERENCIA DEL PORTAFOLIO */}
            {selectedPortfolio && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-sm text-slate-900 mb-3">Herencia del portafolio</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-sm">
                    <PreviewRow
                      label="Portafolio Base"
                      value={inheritedPortfolioDisplay || "—"}
                    />
                    <PreviewRow label="Cliente" value={inheritedClient || "—"} />
                    <PreviewRow label="Planta" value={inheritedPlant || "—"} />
                    <PreviewRow label="Envoltura" value={inheritedWrapping || "—"} />
                    <PreviewRow label="Uso Final" value={inheritedFinalUse || "—"} />
                    <PreviewRow label="Sub-segmento" value={inheritedSubSegment || "—"} />
                    <PreviewRow label="Segmento" value={inheritedSegment || "—"} />
                    <PreviewRow label="Sector" value={inheritedSector || "—"} />
                    <PreviewRow label="AFMarketID" value={inheritedAfMarketId || "—"} />
                    <PreviewRow label="Máquina / Envasado" value={inheritedMachine || "—"} />
                  </div>

                  {inheritedWrapping && (
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={getWrappingImage(inheritedWrapping)}
                        alt={inheritedWrapping}
                        className="max-w-full max-h-48 object-contain rounded-lg bg-slate-50 p-2 border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/envolturas/default.png";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* BOTONES DE NAVEGACIÓN ENTRE PASOS */}
        {activeStep < STEPS.length && (
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              disabled={activeStep === 0}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            <div className="text-xs text-slate-500">
              Paso {activeStep + 1} de {STEPS.length}
            </div>

            {activeStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Siguiente →
              </button>
            ) : (
              <div className="w-[80px]" />
            )}
          </div>
        )}
        {/* ========== FOOTER STICKY: BOTONES DE ACCIÓN ========== */}
        <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-[#f6f8fb]/95 py-4 backdrop-blur">
          <FormActionButtons
            onCancel={handleCancel}
            validationErrorList={Object.values(validationErrors).filter(
              (error): error is string => Boolean(error)
            )}
            submitAttempted={submitAttempted}
            submitLabel={primaryButtonLabel}
            cancelLabel="Cancelar"
            validationTitle="Faltan campos obligatorios."
          />
        </div>
      </form>

      {/* ========== MISSING FIELDS DECISION MODAL ========== */}
      {showMissingFieldsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
              <h3 className="text-lg font-bold text-amber-900">
                Campos obligatorios pendientes
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                Este producto tiene campos obligatorios sin completar. Puedes revisar
                los campos pendientes antes de actualizar o guardar el avance actual.
              </p>
            </div>

            <div className="max-h-[420px] overflow-y-auto px-6 py-4">
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  Completitud actual: {completionPercentage}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Faltan {missingFieldCount} campo(s) obligatorio(s) para completar el producto.
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(missingFieldsByStep).map(([stepNum, fields]) => {
                  if (fields.length === 0) return null;

                  const step = STEPS[Number(stepNum)];

                  return (
                    <div
                      key={stepNum}
                      className="rounded-lg border border-amber-200 bg-amber-50/60 p-3"
                    >
                      <p className="mb-2 text-sm font-bold text-amber-900">
                        {step.label}
                      </p>

                      <ul className="space-y-1 pl-4 text-sm text-amber-800">
                        {fields.map((field) => (
                          <li key={field} className="list-disc">
                            {FIELD_LABELS[field as keyof ProjectEditFormData] ||
                              field.replace(/([A-Z])/g, " $1").trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleReviewMissingFields}
                className="rounded-lg border border-brand-primary bg-white px-4 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-slate-50"
              >
                Revisar campos faltantes
              </button>

              <button
                type="button"
                onClick={handleSaveProgressAnyway}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary/90"
              >
                Guardar avance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== COMPLETION SUCCESS MODAL ========== */}
      {showValidationSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md mx-4">
            <div className="bg-green-50 border-b border-green-200 px-6 py-4">
              <h3 className="text-lg font-bold text-green-900">Solicitud de aprobación enviada</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-slate-700">
                La ficha ha sido enviada para aprobación a los equipos de R&D y Artes Gráficas.
              </p>
              <div className="bg-slate-50 rounded p-3 space-y-1 text-sm">
                <p><span className="font-semibold">Producto:</span> {projectCode}</p>
                <p><span className="font-semibold">Estado:</span> Pendiente de aprobación</p>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowValidationSuccessModal(false);
                  navigate(`/products/${projectCode}`);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded font-medium hover:bg-slate-300 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== CANCEL CONFIRMATION MODAL ========== */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <h3 className="text-lg font-bold text-slate-900">
                ¿Descartar cambios?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Tienes cambios sin guardar en este producto.
              </p>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-slate-700">
                Puedes continuar editando, salir sin guardar los cambios, o guardar y luego salir.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">
              <button
                type="button"
                onClick={handleContinueEditing}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                Seguir editando
              </button>

              <button
                type="button"
                onClick={handleExitWithoutSaving}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 active:bg-red-200"
              >
                Salir sin guardar
              </button>

              <button
                type="button"
                onClick={handleSaveAndExit}
                className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary/90 active:bg-brand-primary/80"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

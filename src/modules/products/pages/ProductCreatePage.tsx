import { Fragment, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useLayout } from "../../../components/layout/LayoutContext";
import { getPortfolioDisplayRecords, TECHNICAL_APPLICATION_OPTIONS } from "../../../shared/data/portfolioStorage";
import { getCatalogOptions } from "../../../shared/catalogs";
import { PRODUCT_CATALOGS } from "../../../shared/data/productCatalogs";
import {
  getNextProjectCode,
  saveProjectRecord,
  getProjectByCode,
} from "../../../shared/data/projectStorage";
import type { BooleanLike, YesNoPending } from "../../../shared/data/projectStorage";
import { getActiveExecutiveRecords } from "../../../shared/data/executiveStorage";
import { computeProjectPreparationStatus } from "../../../shared/data/projectWorkflow";

import FormCard from "../../../shared/components/forms/FormCard";
import FormInput from "../../../shared/components/forms/FormInput";
import FormSelect from "../../../shared/components/forms/FormSelect";
import FormTextarea from "../../../shared/components/forms/FormTextarea";
import FormActionButtons from "../../../shared/components/forms/FormActionButtons";
import PreviewRow from "../../../shared/components/display/PreviewRow";
import PortfolioSearch from "../../../shared/components/forms/PortfolioSearch";
import CommercialExecutiveMultiSearch from "../../../shared/components/forms/CommercialExecutiveMultiSearch";
import ProjectDocumentsSection from "../components/ProjectDocumentsSection";

const RECENT_NEW_PROJECT_KEY = "odiseo_recent_new_project";

type ProjectFormData = {
  portfolioCode: string;
  executiveId: string[];

  projectName: string;
  projectDescription: string;
  classification: string;
  subClassification: string;
  projectType: string;
  salesforceAction: string;

  blueprintFormat: string;
  technicalApplication: string;
  estimatedVolume: string;
  unitOfMeasure: string;
  customerPackingCode: string;

  printClass: string;
  printType: string;
  requiresDesignWork: string;
  hasEdagReference: string;
  referenceEdagCode: string;
  referenceEdagVersion: string;
  specialDesignSpecs: string;
  specialDesignComments: string;
  edagCode: string;
  edagVersion: string;

  hasReferenceStructure: string;
  referenceEmCode: string;
  referenceEmVersion: string;
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
  grammage: string;
  grammageTolerance: string;
  sampleRequest: string;

  width: string;
  length: string;
  repetition: string;
  doyPackBase: string;
  gussetWidth: string;
  gussetType: string;

  hasZipper: string;
  zipperType: string;
  hasTinTie: string;
  hasValve: string;
  valveType: string;
  hasDieCutHandle: string;
  hasReinforcement: string;
  reinforcementThickness: string;
  reinforcementWidth: string;
  hasAngularCut: string;
  hasRoundedCorners: string;
  roundedCornersType: string;
  hasNotch: string;
  hasPerforation: string;
  pouchPerforationType: string;
  bagPerforationType: string;
  perforationLocation: string;
  hasPreCut: string;
  preCutType: string;
  otherAccessories: string;

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
  peruvianProductLogo: string;
  printingFooter: string;

  licitacion: string;
  codigoLict: string;
};

const YES_NO_OPTIONS = [
  { value: "Sí", label: "Sí" },
  { value: "No", label: "No" },
];

// Classification options with proper labels from PRODUCT_CATALOGS
const CLASSIFICATION_OPTIONS = [
  { value: "Nuevo", label: "Producto Nuevo" },
  { value: "Modificado", label: "Producto Modificado" },
];

// Subclassification options mapped by classification type
const getSubclassificationOptions = (classification: string) => {
  if (classification === "Nuevo") {
    return [
      { value: "Desarrollo_RD", label: "Desarrollo_RD" },
      { value: "Área_Técnica", label: "Área_Técnica" },
    ];
  }
  if (classification === "Modificado") {
    return [
      { value: "Diseño y Dimensiones", label: "Diseño y Dimensiones" },
      { value: "Estructura", label: "Estructura" },
    ];
  }
  return [];
};

const PROJECT_TYPE_OPTIONS = [
  { value: "ICO", label: "ICO" },
  { value: "BCP", label: "BCP" },
  { value: "RFQ", label: "RFQ" },
  { value: "Muestra", label: "Muestra" },
];

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
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function normalizeWrappingName(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
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
  const group = materialValue.split(" - ")[0];
  return Object.keys(MATERIAL_CATALOG).includes(group) ? group : "";
}

// Unidad de Medida - consolidado desde PRODUCT_CATALOGS (única fuente oficial)
const UNIT_OPTIONS = (PRODUCT_CATALOGS.unidadDeMedida as unknown as Array<{ code: string; label: string }>).map(
  (item) => ({
    value: item.code,
    label: item.label,
  })
);

const PRINT_CLASS_OPTIONS = PRODUCT_CATALOGS.claseDeImpresion.values.map((val) => ({
  value: val,
  label: val,
}));

const PRINT_TYPE_OPTIONS = PRODUCT_CATALOGS.tipoDeImpresion.values.map((val) => ({
  value: val,
  label: val,
}));

const STRUCTURE_TYPE_OPTIONS = PRODUCT_CATALOGS.tipoDeEstructura.values.map((val) => ({
  value: val,
  label: val,
}));

type MaterialEntry = { value: string; label: string; micron: string; isFree: boolean };
type MaterialCatalog = Record<string, MaterialEntry[]>;

const MATERIAL_CATALOG: MaterialCatalog = {
  "BOPP": [
    { value: "BOPP - BOPP CRISTAL - 15",         label: "BOPP CRISTAL - 15",         micron: "15",  isFree: false },
    { value: "BOPP - BOPP CRISTAL - 17",         label: "BOPP CRISTAL - 17",         micron: "17",  isFree: false },
    { value: "BOPP - BOPP CRISTAL - 20",         label: "BOPP CRISTAL - 20",         micron: "20",  isFree: false },
    { value: "BOPP - BOPP CRISTAL - 25",         label: "BOPP CRISTAL - 25",         micron: "25",  isFree: false },
    { value: "BOPP - BOPP CRISTAL - 30",         label: "BOPP CRISTAL - 30",         micron: "30",  isFree: false },
    { value: "BOPP - BOPP CRISTAL - 35",         label: "BOPP CRISTAL - 35",         micron: "35",  isFree: false },
    { value: "BOPP - BOPP CRISTAL ETIQUETA - 13.5", label: "BOPP CRISTAL ETIQUETA - 13.5", micron: "13.5", isFree: false },
    { value: "BOPP - BOPP BLANCO/MATE - 17",     label: "BOPP BLANCO/MATE - 17",     micron: "17",  isFree: false },
    { value: "BOPP - BOPP BLANCO/MATE - 20",     label: "BOPP BLANCO/MATE - 20",     micron: "20",  isFree: false },
    { value: "BOPP - BOPP BLANCO/MATE - 27",     label: "BOPP BLANCO/MATE - 27",     micron: "27",  isFree: false },
    { value: "BOPP - BOPP ALOX - 15",            label: "BOPP ALOX - 15",            micron: "15",  isFree: false },
    { value: "BOPP - BOPP ALOX - 17",            label: "BOPP ALOX - 17",            micron: "17",  isFree: false },
    { value: "BOPP - BOPP ALOX - 20",            label: "BOPP ALOX - 20",            micron: "20",  isFree: false },
    { value: "BOPP - BOPP ALOX - 25",            label: "BOPP ALOX - 25",            micron: "25",  isFree: false },
    { value: "BOPP - BOPP ALOX - 30",            label: "BOPP ALOX - 30",            micron: "30",  isFree: false },
    { value: "BOPP - BOPP ALOX - 35",            label: "BOPP ALOX - 35",            micron: "35",  isFree: false },
    { value: "BOPP - BOPP METALIZADO - 15",      label: "BOPP METALIZADO - 15",      micron: "15",  isFree: false },
    { value: "BOPP - BOPP METALIZADO - 17",      label: "BOPP METALIZADO - 17",      micron: "17",  isFree: false },
    { value: "BOPP - BOPP METALIZADO - 20",      label: "BOPP METALIZADO - 20",      micron: "20",  isFree: false },
    { value: "BOPP - BOPP METALIZADO - 25",      label: "BOPP METALIZADO - 25",      micron: "25",  isFree: false },
    { value: "BOPP - BOPP METALIZADO - 30",      label: "BOPP METALIZADO - 30",      micron: "30",  isFree: false },
    { value: "BOPP - BOPP METALIZADO - 35",      label: "BOPP METALIZADO - 35",      micron: "35",  isFree: false },
    { value: "BOPP - BOPP METALIZADO UHB - 18",  label: "BOPP METALIZADO UHB - 18",  micron: "18",  isFree: false },
  ],
  "POLIESTER": [
    { value: "POLIESTER - PET CRISTAL - 10",         label: "PET CRISTAL - 10",         micron: "10", isFree: false },
    { value: "POLIESTER - PET CRISTAL - 12",         label: "PET CRISTAL - 12",         micron: "12", isFree: false },
    { value: "POLIESTER - PET METALIZADO - 12",      label: "PET METALIZADO - 12",      micron: "12", isFree: false },
    { value: "POLIESTER - PET METALIZADO UHB - 12",  label: "PET METALIZADO UHB - 12",  micron: "12", isFree: false },
  ],
  "PAPEL": [
    { value: "PAPEL - PAPEL ANTIGRASA - 40",    label: "PAPEL ANTIGRASA - 40",    micron: "40", isFree: false },
    { value: "PAPEL - PAPEL ANTIGRASA - 60",    label: "PAPEL ANTIGRASA - 60",    micron: "60", isFree: false },
    { value: "PAPEL - PAPEL ESTUCADO - 40",     label: "PAPEL ESTUCADO - 40",     micron: "40", isFree: false },
    { value: "PAPEL - PAPEL ESTUCADO - 60",     label: "PAPEL ESTUCADO - 60",     micron: "60", isFree: false },
    { value: "PAPEL - PAPEL ESTUCADO - 70",     label: "PAPEL ESTUCADO - 70",     micron: "70", isFree: false },
    { value: "PAPEL - PAPEL ESPECIAL - Libre",  label: "PAPEL ESPECIAL - Libre",  micron: "",   isFree: true  },
  ],
  "COEX": [
    { value: "COEX - PE - Libre",     label: "PE - Libre",     micron: "", isFree: true },
    { value: "COEX - BARVAL - Libre", label: "BARVAL - Libre", micron: "", isFree: true },
    { value: "COEX - BARLON - Libre", label: "BARLON - Libre", micron: "", isFree: true },
  ],
  "ALUMINIO": [
    { value: "ALUMINIO - ALUMINIO - 7", label: "ALUMINIO - 7", micron: "7", isFree: false },
    { value: "ALUMINIO - ALUMINIO - 8", label: "ALUMINIO - 8", micron: "8", isFree: false },
    { value: "ALUMINIO - ALUMINIO - 9", label: "ALUMINIO - 9", micron: "9", isFree: false },
  ],
  "AMPRIMA": [
    { value: "AMPRIMA - AMPRIMA - 25", label: "AMPRIMA - 25", micron: "25", isFree: false },
  ],
  "PPCAST": [
    { value: "PPCAST - CAST CRISTAL - 20", label: "CAST CRISTAL - 20", micron: "20", isFree: false },
    { value: "PPCAST - CAST CRISTAL - 25", label: "CAST CRISTAL - 25", micron: "25", isFree: false },
    { value: "PPCAST - CAST CRISTAL - 30", label: "CAST CRISTAL - 30", micron: "30", isFree: false },
    { value: "PPCAST - CAST CRISTAL - 60", label: "CAST CRISTAL - 60", micron: "60", isFree: false },
  ],
  "BOPA": [
    { value: "BOPA - BOPA CRISTAL - 15", label: "BOPA CRISTAL - 15", micron: "15", isFree: false },
  ],
  "TERMOFORMADOS": [
    { value: "TERMOFORMADOS - TERMOFORMADO ALTA - 75",  label: "TERMOFORMADO ALTA - 75",  micron: "75",  isFree: false },
    { value: "TERMOFORMADOS - TERMOFORMADO ALTA - 90",  label: "TERMOFORMADO ALTA - 90",  micron: "90",  isFree: false },
    { value: "TERMOFORMADOS - TERMOFORMADO ALTA - 100", label: "TERMOFORMADO ALTA - 100", micron: "100", isFree: false },
    { value: "TERMOFORMADOS - TERMOFORMADO ALTA - 110", label: "TERMOFORMADO ALTA - 110", micron: "110", isFree: false },
    { value: "TERMOFORMADOS - TERMOFORMADO ALTA - 150", label: "TERMOFORMADO ALTA - 150", micron: "150", isFree: false },
    { value: "TERMOFORMADOS - TERMOFORMADO ALTA - 178", label: "TERMOFORMADO ALTA - 178", micron: "178", isFree: false },
    { value: "TERMOFORMADOS - TERMOFORMADO ALTA - 200", label: "TERMOFORMADO ALTA - 200", micron: "200", isFree: false },
  ],
};

const MATERIAL_GROUP_OPTIONS = Object.keys(MATERIAL_CATALOG).map(g => ({ value: g, label: g }));

const SALE_TYPE_OPTIONS = [
  { value: "Nacional", label: "Nacional" },
  { value: "Internacional", label: "Internacional" },
];

const INCOTERM_OPTIONS = PRODUCT_CATALOGS.incoterm.values.map((val) => ({
  value: val,
  label: val,
}));

const CURRENCY_OPTIONS = [
  { value: "Soles", label: "Soles" },
  { value: "Dólares", label: "Dólares" },
];

const SPECIAL_DESIGN_SPECS_OPTIONS = PRODUCT_CATALOGS.especificacionesDeDisenoEspeciales.values.map((val) => ({
  value: val,
  label: val,
}));

const DOY_PACK_BASE_OPTIONS = PRODUCT_CATALOGS.baseDelDoypack.values.map((val) => ({
  value: val,
  label: val,
}));

const CORE_MATERIAL_OPTIONS = PRODUCT_CATALOGS.materialDeTuco.values.map((val) => ({
  value: val,
  label: val,
}));

const GUSSET_TYPE_OPTIONS = [
  { value: "Lateral", label: "Lateral" },
  { value: "Fondo", label: "Fondo" },
];

const ZIPPER_TYPE_OPTIONS = PRODUCT_CATALOGS.zipper.values.map((val) => ({
  value: val,
  label: val,
}));

const VALVE_TYPE_OPTIONS = PRODUCT_CATALOGS.valvula.values.map((val) => ({
  value: val,
  label: val,
}));

const ROUNDED_CORNERS_TYPE_OPTIONS = PRODUCT_CATALOGS.esquinasPr.values.map((val) => ({
  value: val,
  label: val,
}));

const POUCH_PERFORATION_TYPE_OPTIONS = PRODUCT_CATALOGS.tipoDePerforacionPouch.values.map((val) => ({
  value: val,
  label: val,
}));

const BAG_PERFORATION_TYPE_OPTIONS = PRODUCT_CATALOGS.tipoDePerforacionBolsa.values.map((val) => ({
  value: val,
  label: val,
}));

const PERFORATION_LOCATION_OPTIONS = PRODUCT_CATALOGS.ubicacionDePerforaciones.values.map((val) => ({
  value: val,
  label: val,
}));

const PRECUT_TYPE_OPTIONS = PRODUCT_CATALOGS.preCorte.values.map((val) => ({
  value: val,
  label: val,
}));

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

const DIMENSION_MIN_MM = 38;
const DIMENSION_MAX_MM = 2390;

const getPortfolioStatus = (portfolio: any): "active" | "inactive" => {
  const rawStatus = String(
    portfolio.status ||
    portfolio.est ||
    portfolio.estado ||
    (portfolio.isActive === false ? "inactive" : "") ||
    (portfolio.active === false ? "inactive" : "") ||
    "active"
  ).toLowerCase();

  if (
    rawStatus.includes("inactivo") ||
    rawStatus.includes("inactive") ||
    rawStatus === "false"
  ) {
    return "inactive";
  }

  return "active";
};

const initialForm = (portfolioCode: string): ProjectFormData => ({
  portfolioCode,
  executiveId: [],

  projectName: "",
  projectDescription: "",
  classification: "",
  subClassification: "",
  projectType: "",
  salesforceAction: "",

  blueprintFormat: "",
  technicalApplication: "",
  estimatedVolume: "",
  unitOfMeasure: "",
  customerPackingCode: "",

  printClass: "",
  printType: "",
  requiresDesignWork: "",
  hasEdagReference: "",
  referenceEdagCode: "",
  referenceEdagVersion: "",
  specialDesignSpecs: "",
  specialDesignComments: "",
  edagCode: "",
  edagVersion: "",

  hasReferenceStructure: "",
  referenceEmCode: "",
  referenceEmVersion: "",
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
  grammage: "",
  grammageTolerance: "",
  sampleRequest: "",

  width: "",
  length: "",
  repetition: "",
  doyPackBase: "",
  gussetWidth: "",
  gussetType: "",

  hasZipper: "",
  zipperType: "",
  hasTinTie: "",
  hasValve: "",
  valveType: "",
  hasDieCutHandle: "",
  hasReinforcement: "",
  reinforcementThickness: "",
  reinforcementWidth: "",
  hasAngularCut: "",
  hasRoundedCorners: "",
  roundedCornersType: "",
  hasNotch: "",
  hasPerforation: "",
  pouchPerforationType: "",
  bagPerforationType: "",
  perforationLocation: "",
  hasPreCut: "",
  preCutType: "",
  otherAccessories: "",

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
  peruvianProductLogo: "",
  printingFooter: "",
  licitacion: "",
  codigoLict: "",
});

// STEPPER CONFIGURATION
const STEPS = [
  { label: "Información General" },
  { label: "Producto Comercial" },
  { label: "Diseño" },
  { label: "Estructura" },
  { label: "Condiciones comerciales" },
  { label: "Información adicional" },
];const CREATE_ENABLED_STEP = 0;

const STEP_FIELDS: Record<number, Array<keyof ProjectFormData>> = {
  0: ["salesforceAction", "projectName", "projectDescription", "executiveId", "portfolioCode"],
  1: ["blueprintFormat", "technicalApplication", "estimatedVolume", "unitOfMeasure"],
  2: ["length", "repetition", "gussetWidth"],
  3: [],
  4: [],
};

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const [searchParams] = useSearchParams();

  const portfolioCodeParam = searchParams.get("portfolioCode") || "";
  const duplicateFromParam = searchParams.get("duplicateFrom") || "";
  const isDuplicateMode = Boolean(duplicateFromParam);
  const [projectCode] = useState(getNextProjectCode());
  const [form, setForm] = useState<ProjectFormData>(() =>
    initialForm(portfolioCodeParam)
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof ProjectFormData, boolean>>
  >({});
  const [originalProject, setOriginalProject] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);

  const portfolios = useMemo(() => getPortfolioDisplayRecords(), []);
  const executives = useMemo(() => getActiveExecutiveRecords(), []);

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
    return executives.filter((executive) => form.executiveId.includes(String(executive.id)));
  }, [executives, form.executiveId]);

  // Obtener opciones desde catálogos centralizados
  const unitOfMeasureOpt = useMemo(() => getCatalogOptions("unit_measure"), []);
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

  // Load original project data when in duplicate mode
  useEffect(() => {
    if (isDuplicateMode && duplicateFromParam) {
      const original = getProjectByCode(duplicateFromParam);
      if (original) {
        setOriginalProject(original);
        // Pre-fill form with original project data
        setForm({
          portfolioCode: original.portfolioCode || "",
          executiveId: original.ejecutivoId ? [String(original.ejecutivoId)] : [],
          projectName: `${original.projectName || ""} (Copia)`,
          projectDescription: original.projectDescription || "",
          classification: original.classification || "",
          subClassification: original.subClassification || "",
          projectType: original.projectType || "",
          salesforceAction: "",
          blueprintFormat: original.blueprintFormat || "",
          technicalApplication: original.technicalApplication || "",
          estimatedVolume: original.estimatedVolume || "",
          unitOfMeasure: original.unitOfMeasure || "KG",
          customerPackingCode: "",
          printClass: original.printClass || "",
          printType: original.printType || "",
          requiresDesignWork: original.requiresDesignWork === true ? "Sí" : original.requiresDesignWork === false ? "No" : (original.requiresDesignWork || "No"),
          hasEdagReference: original.isPreviousDesign === true ? "Sí" : original.isPreviousDesign === false ? "No" : (original.isPreviousDesign || "No"),
          referenceEdagCode: original.previousEdagCode || "",
          referenceEdagVersion: original.previousEdagVersion || "",
          edagCode: original.edagCode || "",
          edagVersion: String(original.edagVersion || ""),
          specialDesignSpecs: original.specialDesignSpecs || "",
          specialDesignComments: original.specialDesignComments || "",
          hasReferenceStructure: original.hasReferenceStructure === true ? "Sí" : original.hasReferenceStructure === false ? "No" : (original.hasReferenceStructure || "No"),
          referenceEmCode: original.referenceEmCode || "",
          referenceEmVersion: original.referenceEmVersion || "",
          structureType: original.structureType || "Monocapa",
          layer1MaterialGroup: extractMaterialGroupFromValue(original.layer1Material || ""),
          layer1Material: original.layer1Material || "",
          layer1Micron: original.layer1Micron || "",
          layer1Grammage: original.layer1Grammage || "",
          layer2MaterialGroup: extractMaterialGroupFromValue(original.layer2Material || ""),
          layer2Material: original.layer2Material || "",
          layer2Micron: original.layer2Micron || "",
          layer2Grammage: original.layer2Grammage || "",
          layer3MaterialGroup: extractMaterialGroupFromValue(original.layer3Material || ""),
          layer3Material: original.layer3Material || "",
          layer3Micron: original.layer3Micron || "",
          layer3Grammage: original.layer3Grammage || "",
          layer4MaterialGroup: extractMaterialGroupFromValue(original.layer4Material || ""),
          layer4Material: original.layer4Material || "",
          layer4Micron: original.layer4Micron || "",
          layer4Grammage: original.layer4Grammage || "",
          specialStructureSpecs: original.specialStructureSpecs || "",
          grammage: original.grammage || "",
          grammageTolerance: original.grammageTolerance || "",
          sampleRequest: original.sampleRequest ? "Sí" : "No",
          width: original.width || "",
          length: original.length || "",
          repetition: original.repetition || "",
          doyPackBase: original.doyPackBase || "",
          gussetWidth: original.gussetWidth || "",
          gussetType: original.gussetType || "",
          hasZipper: original.hasZipper === true ? "Sí" : original.hasZipper === false ? "No" : (original.hasZipper || "No"),
          zipperType: original.zipperType || "",
          hasTinTie: original.hasTinTie === true ? "Sí" : original.hasTinTie === false ? "No" : (original.hasTinTie || "No"),
          hasValve: original.hasValve === true ? "Sí" : original.hasValve === false ? "No" : (original.hasValve || "No"),
          valveType: original.valveType || "",
          hasDieCutHandle: original.hasDieCutHandle === true ? "Sí" : original.hasDieCutHandle === false ? "No" : (original.hasDieCutHandle || "No"),
          hasReinforcement: original.hasReinforcement === true ? "Sí" : original.hasReinforcement === false ? "No" : (original.hasReinforcement || "No"),
          reinforcementThickness: original.reinforcementThickness || "",
          reinforcementWidth: original.reinforcementWidth || "",
          hasAngularCut: original.hasAngularCut === true ? "Sí" : original.hasAngularCut === false ? "No" : (original.hasAngularCut || "No"),
          hasRoundedCorners: original.hasRoundedCorners === true ? "Sí" : original.hasRoundedCorners === false ? "No" : (original.hasRoundedCorners || "No"),
          roundedCornersType: original.roundedCornersType || "",
          hasNotch: original.hasNotch === true ? "Sí" : original.hasNotch === false ? "No" : (original.hasNotch || "No"),
          hasPerforation: original.hasPerforation === true ? "Sí" : original.hasPerforation === false ? "No" : (original.hasPerforation || "No"),
          pouchPerforationType: original.pouchPerforationType || "",
          bagPerforationType: original.bagPerforationType || "",
          perforationLocation: original.perforationLocation || "",
          hasPreCut: original.hasPreCut === true ? "Sí" : original.hasPreCut === false ? "No" : (original.hasPreCut || "No"),
          preCutType: original.preCutType || "",
          otherAccessories: original.otherAccessories || "",
          saleType: original.saleType || "Nacional",
          incoterm: original.incoterm || "No aplica",
          destinationCountry: original.destinationCountry || "Perú",
          targetPrice: original.targetPrice || "",
          currencyType: original.currencyType || "Soles",
          coreMaterial: original.coreMaterial || "",
          coreDiameter: original.coreDiameter || "",
          externalDiameter: original.externalDiameter || "",
          externalVariationPlus: original.externalVariationPlus || "",
          externalVariationMinus: original.externalVariationMinus || "",
          maxRollWeight: original.maxRollWeight || "",
          customerAdditionalInfo: original.customerAdditionalInfo || "",
          peruvianProductLogo: original.peruvianProductLogo || "No",
          printingFooter: original.printingFooter || "No",
          licitacion: (original as any).licitacion ? "Sí" : "No",
          codigoLict: (original as any).codigoLict || "",
        });
      }
    }
  }, [isDuplicateMode, duplicateFromParam]);

  const inheritedClient =
    selectedPortfolio?.cli || selectedPortfolio?.clientName || "";
  const inheritedPlant =
    selectedPortfolio?.pl || selectedPortfolio?.plantaName || selectedPortfolio?.plantaCode || "";
  const inheritedWrapping =
    selectedPortfolio?.env || selectedPortfolio?.envoltura || selectedPortfolio?.wrappingName || "";
  const inheritedFinalUse =
    selectedPortfolio?.uf || selectedPortfolio?.usoFinal || selectedPortfolio?.useFinalName || "";
  const inheritedSector = selectedPortfolio?.sector || "";
  const inheritedSegment =
    selectedPortfolio?.seg || selectedPortfolio?.segmento || selectedPortfolio?.segment || "";
  const inheritedSubSegment =
    selectedPortfolio?.subseg || selectedPortfolio?.subSegmento || selectedPortfolio?.subSegment || "";
  const inheritedAfMarketId =
    selectedPortfolio?.af || selectedPortfolio?.afMarketId || "";
  const inheritedMachine =
    selectedPortfolio?.maq || selectedPortfolio?.maquinaCliente || selectedPortfolio?.packingMachineName || "";

  useEffect(() => {
  const projectName = form.projectName?.trim();
  const projectDescription = form.projectDescription?.trim();

  const defaultTitle = isDuplicateMode
    ? "Productos >> Duplicar Producto"
    : "Productos >> Crear Producto";

  const dynamicTitle = projectName
    ? `${isDuplicateMode ? "Duplicar Producto" : "Crear Producto"}: ${projectName}`
    : defaultTitle;

  const defaultSubtitle = isDuplicateMode
    ? `Duplicando producto ${duplicateFromParam}. La estructura está bloqueada y debe mantenerse igual. Modifica solo los datos de diseño y comercial.`
    : "Selecciona un portafolio base, hereda su información común y completa la ficha única del producto.";

  const dynamicSubtitle = projectDescription || defaultSubtitle;

        setHeader({
          title: dynamicTitle,
          subtitle: dynamicSubtitle,
          breadcrumbs: [
            { label: "Productos", href: "/products" },
            { label: isDuplicateMode ? "Duplicar Proyecto" : "Crear Proyecto" },
          ],
          badges: (
            <div className="flex items-center gap-2">
              {isDuplicateMode && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                  Modo: Duplicar
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                ID: {projectCode}
              </span>
            </div>
          ),
        });

        return () => resetHeader();
      }, [
        setHeader,
        resetHeader,
        projectCode,
        isDuplicateMode,
        duplicateFromParam,
        form.projectName,
        form.projectDescription,
      ]);

  const updateField = (field: keyof ProjectFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLicitacionChange = (value: string) => {
    const licitacion = value as "Sí" | "No";
    setForm((prev) => ({
      ...prev,
      licitacion,
      codigoLict: licitacion === "No" ? "" : prev.codigoLict,
    }));

    if (licitacion === "No") {
      setTouchedFields((prev) => ({
        ...prev,
        codigoLict: false,
      }));
    }
  };

  const projectTypeOptions = useMemo(() => {
    // Para "Modificado", no hay tipos de proyecto asociados
    if (form.classification === "Modificado") {
      return [];
    }

    if (!form.subClassification) return [];

    // Comparación directa con los valores exactos (para "Nuevo")
    if (form.subClassification === "Desarrollo_RD") {
      return PROJECT_TYPE_RD_OPTIONS;
    }

    if (form.subClassification === "Área_Técnica") {
      return PROJECT_TYPE_TECNICA_OPTIONS;
    }

    // Fallback: normalización para variaciones (para "Nuevo")
    const normalized = normalizeOptionValue(form.subClassification);

    if (normalized.includes("desarrollo") || normalized.includes("rd")) {
      return PROJECT_TYPE_RD_OPTIONS;
    }

    if (normalized.includes("area") || normalized.includes("tecnica")) {
      return PROJECT_TYPE_TECNICA_OPTIONS;
    }

    return [];
  }, [form.classification, form.subClassification]);

  const markFieldAsTouched = (field: keyof ProjectFormData) => {
    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const shouldShowFieldError = (field: keyof ProjectFormData) => {
    return Boolean(
      validationErrors[field] && (submitAttempted || touchedFields[field])
    );
  };

  const validationErrors = useMemo(() => {
    const errors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!form.portfolioCode) errors.portfolioCode = "Seleccione un portafolio base.";
    if (form.executiveId.length === 0) errors.executiveId = "Seleccione al menos un ejecutivo comercial.";
    if (!form.projectName.trim()) errors.projectName = "Ingrese el nombre del proyecto.";
    if (!form.projectDescription.trim()) errors.projectDescription = "Ingrese la descripción del proyecto.";
    if (!form.salesforceAction.trim()) errors.salesforceAction = "Ingrese la acción Salesforce.";

    if (form.licitacion === "Sí" && !form.codigoLict.trim()) {
      errors.codigoLict = "Ingresa el código de licitación.";
    }

    if (form.blueprintFormat && inheritedWrapping) {
      const validOptions = getBlueprintFormatOptions(inheritedWrapping);
      const isValid = validOptions.some((opt) => opt.value === form.blueprintFormat);
      if (!isValid) {
        errors.blueprintFormat = "El formato de plano no corresponde a la envoltura heredada.";
      }
    }

    const shouldValidateDimensions = 
      inheritedWrapping?.toLowerCase() === "lamina" && 
      form.blueprintFormat === "GENERICA";

    if (shouldValidateDimensions) {
      const lengthNum = Number(form.length);
      const repetitionNum = Number(form.repetition);
      const gussetWidthNum = Number(form.gussetWidth);

      if (form.length && (!isNaN(lengthNum))) {
        if (lengthNum < DIMENSION_MIN_MM) {
          errors.length = "El largo mínimo es 38 mm.";
        } else if (lengthNum > DIMENSION_MAX_MM) {
          errors.length = "El largo máximo es 2390 mm.";
        }
      }

      if (form.repetition && (!isNaN(repetitionNum))) {
        if (repetitionNum < DIMENSION_MIN_MM) {
          errors.repetition = "La repetición mínima es 38 mm.";
        } else if (repetitionNum > DIMENSION_MAX_MM) {
          errors.repetition = "La repetición máxima es 2390 mm.";
        }
      }

      if (form.gussetWidth && (!isNaN(gussetWidthNum))) {
        if (gussetWidthNum < DIMENSION_MIN_MM) {
          errors.gussetWidth = "El ancho fuelle mínimo es 38 mm.";
        } else if (gussetWidthNum > DIMENSION_MAX_MM) {
          errors.gussetWidth = "El ancho fuelle máximo es 2390 mm.";
        }
      }
    }

    return errors;
  }, [form, inheritedWrapping]);

  const stepsWithErrors = useMemo(() => {
    const result: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    Object.keys(validationErrors).forEach((field) => {
      for (const [step, fields] of Object.entries(STEP_FIELDS)) {
        if (fields.includes(field as keyof ProjectFormData)) {
          result[Number(step)]++;
          break;
        }
      }
    });
    return result;
  }, [validationErrors]);

  const getError = (field: keyof ProjectFormData) => {
    return shouldShowFieldError(field) ? validationErrors[field] || "" : "";
  };

  // CREATE phase only requires Section 1 fields
  const CREATE_REQUIRED_FIELDS: Array<keyof ProjectFormData> = [
    "portfolioCode",
    "executiveId",
    "salesforceAction",
    "projectName",
    "projectDescription",
  ];

  const createRequiredErrors = useMemo(() => {
    const errors: Partial<Record<keyof ProjectFormData, string>> = {};
    CREATE_REQUIRED_FIELDS.forEach((field) => {
      if (validationErrors[field]) {
        errors[field] = validationErrors[field];
      }
    });
    return errors;
  }, [validationErrors]);

  // Helper: check if all form sections are complete (for "Ficha completa" status)
  const isFormCompleteForValidation = useMemo(() => {
    const requiredFieldsForFull: Array<keyof ProjectFormData> = [
      "portfolioCode",
      "executiveId",
      "salesforceAction",
      "projectName",
      "projectDescription",
      "blueprintFormat",
      "technicalApplication",
      "estimatedVolume",
      "unitOfMeasure",
      "printClass",
      "printType",
      "width",
      "length",
      "repetition",
      "saleType",
      "targetPrice",
      "currencyType",
      "coreMaterial",
      "coreDiameter",
      "externalDiameter",
      "maxRollWeight",
      "peruvianProductLogo",
      "printingFooter",
    ];

    return (
      requiredFieldsForFull.every(
        (field) =>
          form[field] &&
          String(form[field]).trim() !== "" &&
          (!Array.isArray(form[field]) || (form[field] as unknown[]).length > 0)
      ) &&
      !form.estimatedVolume?.includes("NaN") &&
      !form.unitOfMeasure?.includes("NaN")
    );
  }, [form]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    // Check if selected portfolio is inactive
    if (selectedPortfolio && getPortfolioStatus(selectedPortfolio) === "inactive") {
      alert("No se puede crear un proyecto desde un portafolio inactivo.");
      return;
    }

    // Only validate CREATE_REQUIRED fields - other sections are optional
    if (Object.keys(createRequiredErrors).length > 0) {
      const fieldsWithErrors = Object.keys(createRequiredErrors).reduce(
        (acc, field) => {
          acc[field as keyof ProjectFormData] = true;
          return acc;
        },
        {} as Partial<Record<keyof ProjectFormData, boolean>>
      );
      setTouchedFields((prev) => ({
        ...prev,
        ...fieldsWithErrors,
      }));

      // Navigate to first step with Section 1 errors (should be step 0)
      for (let i = 0; i < STEPS.length; i++) {
        if (STEP_FIELDS[i]?.some((f) => createRequiredErrors[f])) {
          setActiveStep(i);
          break;
        }
      }

      return;
    }

    const now = new Date().toISOString();
    const finalExecutiveIds = form.executiveId.map(String);
    const finalExecutiveName = selectedExecutives.map((executive) => executive.name).join(", ");

    saveProjectRecord({
      id: projectCode,
      code: projectCode,

      portfolioCode: form.portfolioCode,
      portfolioName: selectedPortfolio?.nom || selectedPortfolio?.portfolioName || "",

      clientCode: selectedPortfolio?.clientCode,
      clientName: inheritedClient,

      projectName: form.projectName,
      projectDescription: form.projectDescription,

      ejecutivoId: finalExecutiveIds.length > 0 ? Number(finalExecutiveIds[0]) : undefined,
      ejecutivoName: finalExecutiveName,

      ...({
        ejecutivoIds: finalExecutiveIds,
        ejecutivoNames: finalExecutiveName,
        executiveIds: finalExecutiveIds,
        commercialExecutiveIds: finalExecutiveIds,
      } as any),

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
      subClassification: form.subClassification,
      projectType: form.projectType,
      salesforceAction: form.salesforceAction,

      blueprintFormat: form.blueprintFormat,
      technicalApplication: form.technicalApplication,
      estimatedVolume: form.estimatedVolume,
      unitOfMeasure: form.unitOfMeasure,
      customerPackingCode: form.customerPackingCode,

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
      previousEdagCode: form.referenceEdagCode,
      previousEdagVersion: form.referenceEdagVersion,
      requiresDesignWork: form.printClass === "Sin impresión" ? "No" : "Sí",

      hasReferenceStructure: form.hasReferenceStructure as BooleanLike,
      referenceEmCode: form.referenceEmCode,
      referenceEmVersion: form.referenceEmVersion,
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
      microns: [
        form.layer1Micron,
        form.layer2Micron,
        form.layer3Micron,
        form.layer4Micron,
      ]
        .filter(Boolean)
        .join(" / "),

      specialStructureSpecs: form.specialStructureSpecs,
      grammage: form.grammage,
      grammageTolerance: form.grammageTolerance,
      sampleRequest: form.sampleRequest === "Sí",

      width: form.width,
      length: form.length,
      repetition: form.repetition,
      doyPackBase: form.doyPackBase,
      gussetWidth: form.gussetWidth,
      gussetType: form.gussetType,
      dimensions: [form.width, form.length, form.gussetWidth]
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
      hasAngularCut: form.hasAngularCut as BooleanLike,
      hasRoundedCorners: form.hasRoundedCorners as BooleanLike,
      roundedCornersType: form.roundedCornersType,
      hasNotch: form.hasNotch as BooleanLike,
      hasPerforation: form.hasPerforation as BooleanLike,
      pouchPerforationType: form.pouchPerforationType,
      bagPerforationType: form.bagPerforationType,
      perforationLocation: form.perforationLocation,
      hasPreCut: form.hasPreCut as BooleanLike,
      preCutType: form.preCutType,
      otherAccessories: form.otherAccessories,

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
      customerAdditionalInfo: form.customerAdditionalInfo,
      peruvianProductLogo: form.peruvianProductLogo as YesNoPending,
      printingFooter: form.printingFooter,
      licitacion: form.licitacion as YesNoPending,
      codigoLict: form.codigoLict,

      status: "Registrado",
      stage: "P1_PREPARACION_FICHA_PROYECTO",
      completionPercentage: 0,
      hasStartedExtendedFicha: false,
      statusUpdatedAt: now,
      stageUpdatedAt: now,
      createdAt: now,
      updatedAt: now,

      requiereValidacion: true,
      validacionSolicitada: false,
      estadoValidacionGeneral: "Sin solicitar",
      validaciones: [],
    });

    // Store recent new project indicator for 10 seconds
    localStorage.setItem(RECENT_NEW_PROJECT_KEY, JSON.stringify({
      projectId: projectCode,
      expiresAt: Date.now() + 25000,
    }));

    // Dispara custom event para notificar que se creó un nuevo proyecto
    window.dispatchEvent(new CustomEvent("newProjectCreated", {
      detail: { projectId: projectCode }
    }));

    // Redirect to Edit page with optional completion prompt
    navigate(`/products/${projectCode}/edit`, { replace: true });
  };

  return (
    <div className="w-full max-w-none bg-[#f6f8fb] pb-12">
      <button
        type="button"
        onClick={() => navigate("/products")}
        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>

  <form onSubmit={handleSubmit}>
    {/* ========== STEPPER HORIZONTAL ========== */}
    <div className="mb-6 flex items-center gap-0 overflow-x-auto pb-2 px-1">
      {STEPS.map((step, index) => {
        const isActive = activeStep === index;
        const hasError = submitAttempted && stepsWithErrors[index] > 0;
        return (
          <Fragment key={index}>
            <button
              type="button"
              onClick={() => {
                if (index === CREATE_ENABLED_STEP) {
                  setActiveStep(index);
                }
              }}
              disabled={index !== CREATE_ENABLED_STEP}
              title={
                index === CREATE_ENABLED_STEP
                  ? "Información inicial del proyecto"
                  : "Esta sección se completará luego de crear el proyecto"
              }
              className={`flex min-w-0 shrink-0 items-center gap-2 px-2 py-1 rounded-lg transition-colors ${
                index === CREATE_ENABLED_STEP
                  ? "hover:bg-slate-100 cursor-pointer"
                  : "cursor-not-allowed opacity-45"
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                  hasError
                    ? "border-2 border-red-400 text-red-600 bg-red-50"
                    : isActive
                      ? "bg-[#00395A] text-white"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  hasError
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
              <div className="h-px flex-1 min-w-4 bg-slate-200" />
            )}
          </Fragment>
        );
      })}
    </div>

    {/* ========== GRID DE 2 COLUMNAS ========== */}
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      {/* ========== COLUMNA IZQUIERDA: PASOS DEL FORMULARIO ========== */}
      <div className="space-y-5">
        {/* PASO 0: INFORMACIÓN DEL PROYECTO */}
        {activeStep === 0 && (
          <div className="space-y-5">
            <FormCard title="Información del Proyecto" icon="▦" color="#00395A" required>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Banner de modo duplicación */}
                {isDuplicateMode && (
                  <div className="rounded-lg bg-amber-50/50 border border-amber-200 p-3 md:col-span-3">
                    <div className="flex items-center gap-2 text-amber-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-xs font-semibold uppercase tracking-wide">Modo duplicación: modifica el proyecto</span>
                    </div>
                  </div>
                )}

                <FormInput
                  label="Acción Salesforce *"
                  value={form.salesforceAction}
                  onChange={(value) => updateField("salesforceAction", value)}
                  onBlur={() => markFieldAsTouched("salesforceAction")}
                  error={getError("salesforceAction")}
                  placeholder="Ej. Nueva oportunidad / RFQ / Muestra"
                />

                <div className="md:col-span-3">
                  <FormInput
                    label="Nombre del Proyecto *"
                    value={form.projectName}
                    onChange={(value) => updateField("projectName", value)}
                    onBlur={() => markFieldAsTouched("projectName")}
                    error={getError("projectName")}
                    placeholder="Ej. Mayonesa Light 100ml Doypack"
                  />
                </div>

                <div className="md:col-span-3">
                  <FormTextarea
                    label="Descripción del Proyecto *"
                    value={form.projectDescription}
                    onChange={(value) => updateField("projectDescription", value)}
                    onBlur={() => markFieldAsTouched("projectDescription")}
                    error={getError("projectDescription")}
                    placeholder="Descripción comercial y técnica del proyecto..."
                  />
                </div>

                <div className="md:col-span-3">
                  <CommercialExecutiveMultiSearch
                    label="Ejecutivo Comercial *"
                    value={form.executiveId}
                    onChange={(value) => {
                      updateField("executiveId", value);
                      markFieldAsTouched("executiveId");
                    }}
                    error={getError("executiveId")}
                  />
                </div>

                <FormSelect
                  label="Licitación *"
                  value={form.licitacion}
                  onChange={handleLicitacionChange}
                  options={[
                    { value: "Sí", label: "Sí" },
                    { value: "No", label: "No" },
                  ]}
                />

                {form.licitacion === "Sí" && (
                  <FormInput
                    label="Código de Licitación *"
                    value={form.codigoLict}
                    onChange={(value) => updateField("codigoLict", value)}
                    onBlur={() => markFieldAsTouched("codigoLict")}
                    error={
                      shouldShowFieldError("codigoLict")
                        ? validationErrors.codigoLict
                        : ""
                    }
                    placeholder="Ej. LIC-2026-001"
                    helper="Obligatorio cuando el proyecto corresponde a una licitación."
                  />
                )}
              </div>
            </FormCard>
          </div>
        )}

        {/* PASO 1: PRODUCTO COMERCIAL */}
        {activeStep === 1 && (
          <div className="space-y-5">
            <FormCard title="Datos de Producto Comercial" icon="◈" color="#27ae60" required>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 md:col-span-3">
                  <p className="text-xs text-slate-500 font-medium">Envoltura</p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{inheritedWrapping || "—"}</p>
                </div>

                <FormSelect
                  label="Clasificación"
                  value={form.classification}
                  onChange={(value) => {
                    updateField("classification", value);
                    updateField("subClassification", "");
                    updateField("projectType", "");
                  }}
                  options={CLASSIFICATION_OPTIONS}
                  placeholder="-- Seleccione --"
                />

                <FormSelect
                  label="Subsección Clasificación"
                  value={form.subClassification}
                  onChange={(value) => {
                    updateField("subClassification", value);
                    updateField("projectType", "");
                  }}
                  options={getSubclassificationOptions(form.classification)}
                  placeholder="-- Seleccione --"
                  disabled={!form.classification}
                />

                <FormSelect
                  label="Tipo de Proyecto"
                  value={form.projectType}
                  onChange={(value) => updateField("projectType", value)}
                  options={projectTypeOptions}
                  placeholder={
                    form.classification === "Modificado"
                      ? "No aplica para modificado"
                      : !form.subClassification
                        ? "-- Seleccione subsección primero --"
                        : "-- Seleccione --"
                  }
                  disabled={form.classification === "Modificado" || !form.subClassification}
                />

                <FormSelect
                  label="Formato de Plano"
                  value={form.blueprintFormat}
                  onChange={(value) => updateField("blueprintFormat", value)}
                  onBlur={() => markFieldAsTouched("blueprintFormat")}
                  error={getError("blueprintFormat")}
                  placeholder={!inheritedWrapping ? "Seleccione un portafolio primero" : "-- Seleccione --"}
                  options={getBlueprintFormatOptions(inheritedWrapping)}
                  disabled={!inheritedWrapping}
                />

                <FormSelect
                  label="Aplicación Técnica"
                  value={form.technicalApplication}
                  onChange={(value) => updateField("technicalApplication", value)}
                  onBlur={() => markFieldAsTouched("technicalApplication")}
                  error={getError("technicalApplication")}
                  placeholder="-- Seleccione --"
                  options={TECHNICAL_APPLICATION_OPTIONS}
                />

                <FormInput
                  label="Código de Empaque del Cliente"
                  value={form.customerPackingCode}
                  onChange={(value) => updateField("customerPackingCode", value)}
                  placeholder="Ej. COD-CLI-001"
                />
              </div>
            </FormCard>
          </div>
        )}

        {/* PASO 3: ESTRUCTURA */}
        {activeStep === 3 && (
          <div className="space-y-5">
            {/* FormCard 5: Especificaciones de estructura */}
            <FormCard
              title="Especificaciones de estructura"
              icon="🔩"
              color="#f39c12"
              className={isDuplicateMode ? "relative" : ""}
            >
              {isDuplicateMode && (
                <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-semibold text-amber-800">
                    Estructura bloqueada - Se mantiene igual al proyecto original
                  </span>
                </div>
              )}
              <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${isDuplicateMode ? "opacity-70 pointer-events-none" : ""}`}>
                <FormSelect
                  label="¿Tiene estructura de referencia?"
                  value={form.hasReferenceStructure}
                  onChange={(value) => updateField("hasReferenceStructure", value)}
                  options={YES_NO_OPTIONS}
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
                  <FormSelect
                    label="Tipo de Estructura"
                    value={form.structureType}
                    onChange={(value) => updateField("structureType", value)}
                    options={structureTypeOpt}
                  />
                )}
              </div>

              {form.hasReferenceStructure !== "Sí" && (
              <div className={`mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 ${isDuplicateMode ? "opacity-70 pointer-events-none" : ""}`}>
                <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Capas de estructura
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {(() => {
                    const maxLayers = (() => {
                      switch (form.structureType) {
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
                    })();
                    return [1, 2, 3, 4].filter(layer => layer <= maxLayers).map((layer) => {
                    const groupKey = `layer${layer}MaterialGroup` as keyof ProjectFormData;
                    const materialKey = `layer${layer}Material` as keyof ProjectFormData;
                    const micronKey = `layer${layer}Micron` as keyof ProjectFormData;
                    const grammageKey = `layer${layer}Grammage` as keyof ProjectFormData;

                    const group = form[groupKey] as string;
                    const groupOptions = group ? MATERIAL_CATALOG[group] : [];
                    const selectedMaterial = group ? MATERIAL_CATALOG[group]?.find(m => m.value === form[materialKey]) : null;
                    const isMicronFree = selectedMaterial?.isFree ?? false;

                    return (
                      <div key={layer} className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-xs font-bold uppercase text-brand-primary">
                          Capa {layer}
                        </p>
                        <div className="space-y-3">
                          <FormSelect
                            label="Grupo Material"
                            value={group}
                            onChange={(value) => {
                              updateField(groupKey, value);
                              updateField(materialKey, "");
                              updateField(micronKey, "");
                            }}
                            placeholder="-- Seleccione grupo --"
                            options={MATERIAL_GROUP_OPTIONS}
                          />
                          <FormSelect
                            label="Tipo de Material y Micraje"
                            value={form[materialKey] as string}
                            onChange={(value) => {
                              updateField(materialKey, value);
                              const entry = MATERIAL_CATALOG[group]?.find(m => m.value === value);
                              if (entry && !entry.isFree) {
                                updateField(micronKey, entry.micron);
                              } else {
                                updateField(micronKey, "");
                              }
                            }}
                            options={groupOptions}
                            disabled={!group}
                            placeholder="-- Seleccione tipo --"
                          />
                          <FormInput
                            label="Micraje"
                            value={form[micronKey] as string}
                            onChange={(value) =>
                              updateField(micronKey, value)
                            }
                            disabled={!isMicronFree}
                            placeholder={isMicronFree ? "Ingrese micraje" : "Auto"}
                          />
                          <FormInput
                            label="Gramaje"
                            value={form[grammageKey] as string}
                            onChange={(value) =>
                              updateField(grammageKey, value)
                            }
                            placeholder="Ej. 35"
                          />
                        </div>
                      </div>
                    );
                  });
                  })()}
                </div>

                {(() => {
                  const completedLayers = [];
                  for (let i = 1; i <= 4; i++) {
                    const material = form[`layer${i}Material` as keyof ProjectFormData] as string;
                    const micron = form[`layer${i}Micron` as keyof ProjectFormData] as string;
                    if (material && micron) {
                      const materialDisplay = material.split(" - ").slice(1).join(" - ");
                      completedLayers.push(`${materialDisplay} / ${micron}`);
                    }
                  }
                  return completedLayers.length > 0 ? (
                    <div className="mt-4 rounded-lg bg-white border border-slate-200 p-3">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Resumen de Capas:</p>
                      <p className="text-sm text-slate-700 font-medium break-words">
                        {completedLayers.join(" | ")}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
              )}

              <div className={`mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 ${isDuplicateMode ? "opacity-70 pointer-events-none" : ""}`}>
                <FormInput
                  label="Gramaje general (g/m2)"
                  value={form.grammage}
                  onChange={(value) => updateField("grammage", value)}
                  placeholder="Ej. 40"
                />
                <FormInput
                  label="Tolerancia de Gramaje"
                  value={form.grammageTolerance}
                  onChange={(value) => updateField("grammageTolerance", value)}
                  placeholder="Ej. ±5%"
                />
                <FormSelect
                  label="¿Solicitud de muestra?"
                  value={form.sampleRequest}
                  onChange={(value) => updateField("sampleRequest", value)}
                  options={YES_NO_OPTIONS}
                />
                <div className="md:col-span-3">
                  <FormTextarea
                    label="Especificaciones Especiales de Estructura / Comentarios"
                    value={form.specialStructureSpecs}
                    onChange={(value) => updateField("specialStructureSpecs", value)}
                    placeholder="Restricciones, barreras, sellabilidad, resistencia, OTR/WVTR..."
                  />
                </div>
              </div>
            </FormCard>

            {/* FormCard 6: Dimensiones y accesorios */}
            <FormCard title="Dimensiones y accesorios" icon="⌗" color="#16a085">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                {(() => {
                  const wrapping = inheritedWrapping?.toLowerCase() || "";
                  const isLamina = wrapping.includes("lamina") || wrapping.includes("lámina");
                  const isPouchOrBolsa = wrapping.includes("pouch") || wrapping.includes("bolsa");
                  return (
                    <>
                      {isPouchOrBolsa && (
                        <FormInput label="Ancho" value={form.width} onChange={(value) => updateField("width", value)} placeholder="mm" />
                      )}
                      <FormInput
                        label="Largo"
                        value={form.length}
                        onChange={(value) => updateField("length", value)}
                        onBlur={() => markFieldAsTouched("length")}
                        error={getError("length")}
                        placeholder="mm"
                      />
                      {isLamina && (
                        <FormInput
                          label="Repetición"
                          value={form.repetition}
                          onChange={(value) => updateField("repetition", value)}
                          onBlur={() => markFieldAsTouched("repetition")}
                          error={getError("repetition")}
                          placeholder="mm"
                        />
                      )}
                      {wrapping.includes("pouch") && (
                        <FormSelect label="Base Doy Pack" value={form.doyPackBase} onChange={(value) => updateField("doyPackBase", value)} placeholder="-- Seleccione --" options={DOY_PACK_BASE_OPTIONS} />
                      )}
                      <FormInput
                        label="Ancho Fuelle"
                        value={form.gussetWidth}
                        onChange={(value) => updateField("gussetWidth", value)}
                        onBlur={() => markFieldAsTouched("gussetWidth")}
                        error={getError("gussetWidth")}
                        placeholder="mm"
                      />
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

                  const toggleAccessory = (field: keyof ProjectFormData) => {
                    const isCurrentlySelected = form[field] === "Sí";
                    if (isCurrentlySelected) {
                      updateField(field, "No");
                    } else if (canSelectMore) {
                      updateField(field, "Sí");
                    }
                  };

                  const AccessoryCheckbox = ({ field, label }: { field: keyof ProjectFormData; label: string }) => (
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
                          {form.hasPerforation === "Sí" && (
                            <div className="space-y-3">
                              <FormSelect label="Tipo Perforación Pouch" value={form.pouchPerforationType} onChange={(value) => updateField("pouchPerforationType", value)} placeholder="-- Seleccione --" options={pouchPerforationOpt} />
                              <FormSelect label="Tipo Perforación Bolsa" value={form.bagPerforationType} onChange={(value) => updateField("bagPerforationType", value)} placeholder="-- Seleccione --" options={bagPerforationOpt} />
                              <FormSelect label="Ubicación Perforaciones" value={form.perforationLocation} onChange={(value) => updateField("perforationLocation", value)} placeholder="-- Seleccione --" options={PERFORATION_LOCATION_OPTIONS} />
                            </div>
                          )}
                          <AccessoryCheckbox field="hasPreCut" label="Pre-Corte" />
                          {form.hasPreCut === "Sí" && (
                            <FormSelect label="Tipo de Pre-Corte" value={form.preCutType} onChange={(value) => updateField("preCutType", value)} placeholder="-- Seleccione --" options={precutTypeOpt} />
                          )}
                        </div>
                      </div>

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
            </FormCard>
          </div>
        )}

        {/* PASO 2: DISEÑO */}
        {activeStep === 2 && (
          <div className="space-y-5">
            {/* FormCard 4: Especificaciones de diseño */}
            <FormCard title="Especificaciones de diseño" icon="🎨" color="#8e44ad">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {(() => {
                  const isPrintingDisabled = form.printClass === "Sin impresión";
                  return (
                    <>
                      <FormSelect
                        label="Clase de Impresión"
                        value={form.printClass}
                        onChange={(value) => updateField("printClass", value)}
                        placeholder="-- Seleccione --"
                        options={printClassOpt}
                      />
                      <FormSelect
                        label="Tipo de Impresión"
                        value={form.printType}
                        onChange={(value) => updateField("printType", value)}
                        placeholder="-- Seleccione --"
                        options={printTypeOpt}
                        disabled={isPrintingDisabled}
                      />
                      <FormSelect
                        label="Especificaciones Especiales"
                        value={form.specialDesignSpecs}
                        onChange={(value) => updateField("specialDesignSpecs", value)}
                        placeholder="-- Seleccione --"
                        options={SPECIAL_DESIGN_SPECS_OPTIONS}
                        disabled={isPrintingDisabled}
                      />
                      <FormSelect
                        label="¿Tiene Diseño de referencia?"
                        value={form.hasEdagReference}
                        onChange={(value) => updateField("hasEdagReference", value)}
                        placeholder="-- Seleccione --"
                        options={YES_NO_OPTIONS}
                      />
                    </>
                  );
                })()}
                {form.specialDesignSpecs === "Otros (comentar cuáles)" && (
                  <div className="md:col-span-3">
                    <FormTextarea
                      label="Comentarios de diseños especiales"
                      value={form.specialDesignComments}
                      onChange={(value) => updateField("specialDesignComments", value)}
                      placeholder="Comentarios adicionales de Artes Gráficas..."
                    />
                  </div>
                )}

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
                  </>
                )}
                {form.printClass && (
                  <div className="md:col-span-3">
                    <FormSelect
                      label="¿Requiere trabajo de diseño?"
                      value={form.printClass === "Sin impresión" ? "No" : "Sí"}
                      onChange={() => {}}
                      options={YES_NO_OPTIONS}
                      disabled={true}
                    />
                  </div>
                )}
              </div>
            </FormCard>
          </div>
        )}

        {/* PASO 4: CONDICIONES COMERCIALES */}
        {activeStep === 4 && (
          <div className="space-y-5">
            <FormCard title="Condiciones comerciales" icon="💰" color="#0d4c5c">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormInput
                  label="Cantidad / Volumen estimado"
                  value={form.estimatedVolume}
                  onChange={(value) => updateField("estimatedVolume", value)}
                  onBlur={() => markFieldAsTouched("estimatedVolume")}
                  error={getError("estimatedVolume")}
                  placeholder="Ej. 500"
                />

                <FormSelect
                  label="Unidad de Medida"
                  value={form.unitOfMeasure}
                  onChange={(value) => updateField("unitOfMeasure", value)}
                  onBlur={() => markFieldAsTouched("unitOfMeasure")}
                  error={getError("unitOfMeasure")}
                  options={unitOfMeasureOpt}
                  placeholder="-- Seleccione --"
                />

                <FormSelect label="Venta Nacional / Internacional" value={form.saleType} onChange={(value) => updateField("saleType", value)} options={saleTypeOpt} />
                <FormSelect label="Incoterm" value={form.incoterm} onChange={(value) => updateField("incoterm", value)} options={incotermOpt} />
                <FormSelect label="País Destino" value={form.destinationCountry} onChange={(value) => updateField("destinationCountry", value)} options={countryOpt} />

                <FormInput label="Precio Objetivo" value={form.targetPrice} onChange={(value) => updateField("targetPrice", value)} placeholder="Ej. 45" />
                <FormSelect label="Tipo de Moneda" value={form.currencyType} onChange={(value) => updateField("currencyType", value)} options={currencyOpt} />

                <div className="md:col-span-3">
                  <FormTextarea
                    label="Información adicional del cliente"
                    value={form.customerAdditionalInfo}
                    onChange={(value) => updateField("customerAdditionalInfo", value)}
                    placeholder="Condiciones comerciales, restricciones, requisitos adicionales..."
                  />
                </div>
              </div>
            </FormCard>
          </div>
        )}

        {/* PASO 5: DOCUMENTOS */}
        {activeStep === 5 && (
          <div className="space-y-5">
            <ProjectDocumentsSection projectCode={projectCode} />
          </div>
        )}
      </div>

      {/* ========== COLUMNA DERECHA: PANEL DE CONTEXTO (STICKY) ========== */}
      <div className="space-y-5">
        {/* TARJETA A: PORTAFOLIO BASE */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-slate-900 mb-3">Portafolio base</h3>
          <PortfolioSearch
            label="Portafolio base *"
            value={form.portfolioCode}
            onChange={(value) => {
              updateField("portfolioCode", value);
              updateField("blueprintFormat", "");
              markFieldAsTouched("portfolioCode");
            }}
            error={getError("portfolioCode")}
          />
          {!form.portfolioCode && (
            <p className="text-xs text-slate-400 mt-3 italic">
              Selecciona un portafolio para ver la información heredada.
            </p>
          )}
        </div>

        {/* TARJETA B: HERENCIA DEL PORTAFOLIO */}
        {selectedPortfolio && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-sm text-slate-900 mb-3">Herencia del portafolio</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm">
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

        {/* ========== MENSAJE DE CONTINUIDAD DEL FLUJO ========== */}
        <div className="mt-5 border-t border-slate-200 bg-[#f6f8fb] px-3 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled
              className="px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
            >
              ← Anterior
            </button>

            <div className="text-center text-xs text-slate-500">
              Paso 1 de 6 · Completa la información general para crear el proyecto
            </div>

            <button
              type="button"
              disabled
              className="px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
    {/* ========== FOOTER STICKY: BOTONES DE ACCIÓN ========== */}
    <div className="sticky bottom-0 z-40 mt-6 border-t border-slate-200 bg-[#f6f8fb]/95 py-4 backdrop-blur">
      <FormActionButtons
        onCancel={() => navigate("/products")}
        validationErrorList={Object.values(validationErrors).filter(
          (error): error is string => Boolean(error)
        )}
        submitAttempted={submitAttempted}
        submitLabel="Crear Proyecto"
        cancelLabel="Cancelar"
        validationTitle="Faltan campos obligatorios."
      />
    </div>
  </form>
    </div>
  );
}
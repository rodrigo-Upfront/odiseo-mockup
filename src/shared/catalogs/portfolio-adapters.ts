/**
 * ADAPTADORES PARA PORTFOLIO
 *
 * Fuente única: catalog.service
 *
 * Objetivo:
 * - Evitar dependencia rígida de Number(...) después de reorganizar catálogos.
 * - Soportar IDs legacy numéricos y códigos funcionales: POUCH, BOLSA, LAMINA.
 * - Resolver correctamente la relación Envoltura -> Máquina de empaque.
 * - Evitar que máquinas no clasificadas aparezcan para todas las envolturas.
 */

import { getCatalogValues } from "./catalog.service";
import { FINAL_USE_CATALOG } from "../data/mockDatabase";

// ═════════════════════════════════════════════════════════════════════
// TIPOS
// ═════════════════════════════════════════════════════════════════════

export type WrappingFunctionalType = "POUCH" | "BOLSA" | "LAMINA";

export interface CatalogItem {
  id: string | number;
  legacyId?: number;
  code?: string;
  name: string;
  status?: string;
  wrappingType?: WrappingFunctionalType | null;
  wrappingId?: string | number | null;
  wrappingCode?: string | null;
  raw?: Record<string, any>;
  [key: string]: any;
}

type RawCatalogValue = {
  id?: string | number;
  item?: string;
  code?: string;
  value?: string | number;
  name?: string;
  label?: string;
  description?: string;
  status?: string;

  wrappingId?: string | number;
  wrappingCode?: string;
  wrappingType?: string;
  envolturaId?: string | number;
  envolturaCode?: string;
  tipoEnvoltura?: string;
  category?: string;
  group?: string;
  family?: string;
  parentId?: string | number;
  parentCode?: string;
  rawWrappingId?: string | number;

  [key: string]: any;
};

// ═════════════════════════════════════════════════════════════════════
// HELPERS GENERALES
// ═════════════════════════════════════════════════════════════════════

function normalizeCatalogText(value?: string | number | null): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getActiveCatalogValues(catalogKey: string): RawCatalogValue[] {
  return getCatalogValues(catalogKey, { activeOnly: true }) as RawCatalogValue[];
}

function getCatalogCode(value: RawCatalogValue, fallbackIndex: number): string {
  return String(
    value.code ??
      value.item ??
      value.value ??
      value.id ??
      `ITEM-${fallbackIndex + 1}`
  );
}

function getCatalogName(value: RawCatalogValue): string {
  return String(
    value.name ??
      value.label ??
      value.description ??
      value.item ??
      value.code ??
      value.value ??
      value.id ??
      "Sin nombre"
  );
}

function getStableCatalogId(
  value: RawCatalogValue,
  fallbackIndex: number
): string | number {
  return value.id ?? value.item ?? value.code ?? value.value ?? fallbackIndex + 1;
}

function matchCatalogItem(item: CatalogItem, value: string | number): boolean {
  const target = normalizeCatalogText(value);

  return [
    item.id,
    item.legacyId,
    item.code,
    item.name,
    item.raw?.id,
    item.raw?.item,
    item.raw?.code,
    item.raw?.value,
    item.raw?.name,
  ].some((candidate) => normalizeCatalogText(candidate) === target);
}

function hasUsefulReference(value?: string | number | null): boolean {
  const text = normalizeCatalogText(value);

  if (!text) return false;

  return ![
    "no definido",
    "sin definir",
    "n/a",
    "na",
    "null",
    "undefined",
    "general",
    "generico",
    "generica",
    "generic",
  ].includes(text);
}

// ═════════════════════════════════════════════════════════════════════
// DETECCIÓN DE ENVOLTURA
// ═════════════════════════════════════════════════════════════════════

function detectWrappingType(
  ...values: Array<string | number | undefined | null>
): WrappingFunctionalType | null {
  const text = normalizeCatalogText(values.filter(Boolean).join(" "));

  if (!text) return null;

  if (text.includes("pouch")) return "POUCH";
  if (text.includes("bolsa")) return "BOLSA";
  if (text.includes("lamina")) return "LAMINA";

  return null;
}

const MACHINE_RULES_BY_WRAPPING: Record<WrappingFunctionalType, string[]> = {
  POUCH: [
    "pouch",
    "doy",
    "doypack",
    "doy pack",
    "stand up pouch",
    "standup pouch",
    "stand-up pouch",
    "sello doy",
    "base cuadrada",
    "sello en k",
  ],
  BOLSA: [
    "bolsa",
    "bolsas",
    "bag",
    "sachet",
    "vffs",
    "flow pack",
    "pillow pack",
    "fuelle lateral",
    "mordaza recta",
    "mordaza giratoria",
    "sobre plano",
    "wicket",
    "twist wrap",
  ],
  LAMINA: [
    "lamina",
    "lámina",
    "film",
    "bobina",
    "roll fed",
    "rollo",
    "laminar",
    "envolvedora",
    "etiquetadora",
    "tunel",
    "túnel",
    "termoencogimiento",
    "termoenogimiento",
  ],
};

function detectMachineWrappingType(
  ...values: Array<string | number | undefined | null>
): WrappingFunctionalType | null {
  const text = normalizeCatalogText(values.filter(Boolean).join(" "));

  if (!text) return null;

  for (const [type, keywords] of Object.entries(MACHINE_RULES_BY_WRAPPING)) {
    const matches = keywords.some((keyword) =>
      text.includes(normalizeCatalogText(keyword))
    );

    if (matches) return type as WrappingFunctionalType;
  }

  return null;
}

// ═════════════════════════════════════════════════════════════════════
// ESTADO (portfolio_status)
// ═════════════════════════════════════════════════════════════════════

export function getPortfolioStatuses(): CatalogItem[] {
  const values = getActiveCatalogValues("portfolio_status");

  return values.map((v, idx) => ({
    id: getStableCatalogId(v, idx),
    legacyId: idx + 1,
    code: getCatalogCode(v, idx),
    name: getCatalogName(v),
    status: v.status,
    raw: v,
  }));
}

export function getStatusById(id: string | number): CatalogItem | undefined {
  return getPortfolioStatuses().find((status) => matchCatalogItem(status, id));
}

// ═════════════════════════════════════════════════════════════════════
// PLANTAS (plant)
// ═════════════════════════════════════════════════════════════════════

export function getPlants(): CatalogItem[] {
  const values = getActiveCatalogValues("plant");

  return values.map((v, idx) => ({
    id: getStableCatalogId(v, idx),
    legacyId: idx + 1,
    code: getCatalogCode(v, idx),
    name: getCatalogName(v),
    status: v.status,
    raw: v,
  }));
}

export function getPlantById(id: string | number): CatalogItem | undefined {
  return getPlants().find((plant) => matchCatalogItem(plant, id));
}

export function getPlantByCode(code: string): CatalogItem | undefined {
  const target = normalizeCatalogText(code);

  return getPlants().find((plant) =>
    [plant.code, plant.id, plant.raw?.item, plant.raw?.code].some(
      (candidate) => normalizeCatalogText(candidate) === target
    )
  );
}

// ═════════════════════════════════════════════════════════════════════
// ENVOLTURAS (wrapping_type)
// ═════════════════════════════════════════════════════════════════════

export function getWrappings(): CatalogItem[] {
  const values = getActiveCatalogValues("wrapping_type");

  return values.map((v, idx) => {
    const code = getCatalogCode(v, idx);
    const name = getCatalogName(v);
    const wrappingType = detectWrappingType(
      v.id,
      v.item,
      v.code,
      v.value,
      code,
      name
    );

    return {
      id: getStableCatalogId(v, idx),
      legacyId: idx + 1,
      code,
      name,
      status: v.status,
      wrappingType,
      raw: v,
    };
  });
}

export function getWrappingById(id: string | number): CatalogItem | undefined {
  const directMatch = getWrappings().find((wrapping) =>
    matchCatalogItem(wrapping, id)
  );

  if (directMatch) return directMatch;

  const targetType = detectWrappingType(id);
  if (!targetType) return undefined;

  return getWrappings().find((wrapping) => wrapping.wrappingType === targetType);
}

export function getWrappingByCode(code: string): CatalogItem | undefined {
  const target = normalizeCatalogText(code);

  return getWrappings().find((wrapping) =>
    [wrapping.code, wrapping.id, wrapping.name, wrapping.raw?.item].some(
      (candidate) => normalizeCatalogText(candidate) === target
    )
  );
}

// ═════════════════════════════════════════════════════════════════════
// USO FINAL (final_use)
// ═════════════════════════════════════════════════════════════════════

export function getFinalUses(): any[] {
  return FINAL_USE_CATALOG.map((use) => ({
    id: use.id,
    code: use.code,
    name: use.useFinal,
    useFinal: use.useFinal,
    sector: use.sector,
    segment: use.segment,
    subSegment: use.subSegment,
    afMarketId: use.afMarketId,
    confidence: use.confidence,
    observation: use.observation,
  }));
}

export function getFinalUseById(id: string | number): any | undefined {
  const target = normalizeCatalogText(String(id));

  return getFinalUses().find((use) =>
    [
      String(use.id),
      use.code,
      use.name,
      use.useFinal,
    ].some((candidate) => normalizeCatalogText(candidate) === target)
  );
}

// ═════════════════════════════════════════════════════════════════════
// MÁQUINAS DE EMPAQUE (packaging_machine)
// ═════════════════════════════════════════════════════════════════════

function getMachineWrappingId(value: RawCatalogValue): string | number | null {
  return (
    value.wrappingId ??
    value.envolturaId ??
    value.parentId ??
    value.rawWrappingId ??
    null
  );
}

function getMachineWrappingCode(value: RawCatalogValue): string | null {
  const code =
    value.wrappingCode ??
    value.envolturaCode ??
    value.wrappingType ??
    value.tipoEnvoltura ??
    value.parentCode ??
    value.category ??
    value.group ??
    value.family ??
    null;

  return hasUsefulReference(code) ? String(code) : null;
}

export function getPackingMachines(): CatalogItem[] {
  const values = getActiveCatalogValues("packaging_machine");

  return values.map((v, idx) => {
    const code = getCatalogCode(v, idx);
    const name = getCatalogName(v);
    const wrappingId = getMachineWrappingId(v);
    const wrappingCode = getMachineWrappingCode(v);

    const wrappingType = detectMachineWrappingType(
      wrappingId,
      wrappingCode,
      v.item,
      v.code,
      v.name,
      v.label,
      v.description,
      v.category,
      v.group,
      v.family,
      v.wrappingType,
      v.wrappingCode,
      v.envolturaCode,
      v.tipoEnvoltura
    );

    return {
      id: getStableCatalogId(v, idx),
      legacyId: idx + 1,
      code,
      name,
      wrappingId: hasUsefulReference(wrappingId) ? wrappingId : null,
      wrappingCode,
      wrappingType,
      status: v.status,
      raw: v,
    };
  });
}

export function getPackingMachineById(
  id: string | number
): CatalogItem | undefined {
  return getPackingMachines().find((machine) => matchCatalogItem(machine, id));
}

function machineMatchesWrapping(
  machine: CatalogItem,
  wrapping: CatalogItem,
  wrappingType: WrappingFunctionalType | null
): boolean {
  if (!wrappingType) return false;

  const wrappingCandidates = [
    wrapping.id,
    wrapping.legacyId,
    wrapping.code,
    wrapping.name,
    wrapping.raw?.id,
    wrapping.raw?.item,
    wrapping.raw?.code,
    wrapping.raw?.value,
    wrapping.raw?.name,
  ];

  const machineReferences = [machine.wrappingId, machine.wrappingCode].filter(
    hasUsefulReference
  );

  // Si existe relación explícita, se valida contra ID/código/nombre de envoltura
  // y también contra el tipo funcional POUCH/BOLSA/LAMINA.
  const explicitReferenceMatches = machineReferences.some((machineRef) => {
    const refType = detectWrappingType(machineRef);

    if (refType && refType === wrappingType) return true;

    return wrappingCandidates.some(
      (wrappingRef) =>
        normalizeCatalogText(machineRef) === normalizeCatalogText(wrappingRef)
    );
  });

  if (explicitReferenceMatches) return true;

  // Si no hay relación explícita válida, se usa la clasificación por nombre/código.
  // Si no se puede clasificar la máquina, NO se muestra para evitar que aparezca en todas.
  if (!machine.wrappingType) return false;

  return machine.wrappingType === wrappingType;
}

export function getPackingMachinesByWrappingId(
  wrappingId: string | number
): CatalogItem[] {
  const wrapping = getWrappingById(wrappingId);

  if (!wrapping) return [];

  const wrappingType =
    wrapping.wrappingType ??
    detectWrappingType(
      wrapping.id,
      wrapping.code,
      wrapping.name,
      wrapping.raw?.id,
      wrapping.raw?.item,
      wrapping.raw?.code,
      wrapping.raw?.value,
      wrapping.raw?.name
    );

  if (!wrappingType) return [];

  return getPackingMachines()
    .filter((machine) => machineMatchesWrapping(machine, wrapping, wrappingType))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

// ═════════════════════════════════════════════════════════════════════
// CATÁLOGOS COMPLETOS (para compatibilidad)
// ═════════════════════════════════════════════════════════════════════

export function getStatusCatalog(): CatalogItem[] {
  return getPortfolioStatuses();
}

export function getPlantsCatalog(): CatalogItem[] {
  return getPlants();
}

export function getWrappingsCatalog(): CatalogItem[] {
  return getWrappings();
}

export function getPackingMachinesCatalog(): CatalogItem[] {
  return getPackingMachines();
}

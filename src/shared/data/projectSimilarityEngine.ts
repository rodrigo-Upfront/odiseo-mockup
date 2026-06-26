import {
  getProjectRecords,
  type ProjectRecord,
} from "./projectStorage";
import type {
  ProductPreliminaryRecord,
  SimilarityLevel,
} from "./productPreliminaryTypes";

export type SimilarProjectResult = {
  projectCode: string;
  projectName: string;
  clientName: string;
  wrappingName: string;
  packingMachineName: string;
  useFinalName: string;
  structureSummary: string;
  layerCount: number;
  materials: string[];
  hasSpecialDesign: boolean;
  similarityScore: number;
  similarityLevel: SimilarityLevel;
  status: string;
};

type AnyPortfolioRecord = Record<string, any>;

const SIMILARITY_WEIGHTS = {
  client: 15,
  useFinal: 20,
  structure: 30,
  layerCount: 15,
  materials: 15,
  specialDesign: 5,
} as const;

export const SIMILARITY_TOTAL_WEIGHT = 100;

function normalizeText(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMaterial(value: unknown): string {
  return normalizeText(value)
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*\/\s*/g, "/");
}

function getPortfolioValue(portfolio: AnyPortfolioRecord | undefined, keys: string[]): string {
  if (!portfolio) return "";

  for (const key of keys) {
    if (portfolio[key]) return String(portfolio[key]);
  }

  return "";
}

function getProjectWrapping(project: ProjectRecord): string {
  return (
    project.wrappingName ||
    project.envoltura ||
    (project as any).wrapping ||
    ""
  );
}

function getProjectMachine(project: ProjectRecord): string {
  return (
    project.packingMachineName ||
    project.maquinaCliente ||
    (project as any).machineName ||
    ""
  );
}

function getProjectUseFinal(project: ProjectRecord): string {
  return (
    project.useFinalName ||
    project.usoFinal ||
    (project as any).useFinal ||
    ""
  );
}

function getProjectClient(project: ProjectRecord): string {
  return (
    project.clientName ||
    project.clientCode ||
    (project as any).cliente ||
    ""
  );
}

function getProjectMaterials(project: ProjectRecord): string[] {
  return [
    project.layer1Material,
    project.layer2Material,
    project.layer3Material,
    project.layer4Material,
  ]
    .filter(Boolean)
    .map((material) => String(material));
}

function getProjectStructureSummary(project: ProjectRecord): string {
  const materials = getProjectMaterials(project);

  if (materials.length > 0) return materials.join(" / ");

  return (
    project.layers ||
    project.structureType ||
    project.specialStructureSpecs ||
    ""
  );
}

function getProjectLayerCount(project: ProjectRecord): number {
  const materials = getProjectMaterials(project);
  if (materials.length > 0) return materials.length;

  switch (project.structureType) {
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

function getProjectHasSpecialDesign(project: ProjectRecord): boolean {
  const printClass = normalizeText(project.printClass);
  const requiresDesignWork = normalizeText(project.requiresDesignWork);
  const specialSpecs = normalizeText(project.specialDesignSpecs);

  if (printClass && printClass !== "sin impresion") return true;
  if (requiresDesignWork === "si" || requiresDesignWork === "sí") return true;
  if (specialSpecs && specialSpecs !== "no aplica") return true;

  return false;
}

function isApprovedProject(project: ProjectRecord): boolean {
  const status = normalizeText(project.status);
  const stage = normalizeText(project.stage);
  const validationStatus = normalizeText(project.estadoValidacionGeneral);

  return (
    status.includes("validado") ||
    status.includes("aprobado") ||
    validationStatus.includes("aprobada") ||
    stage.includes("validado")
  );
}

function isSameOrEquivalent(a: string, b: string): boolean {
  const left = normalizeText(a);
  const right = normalizeText(b);

  if (!left || !right) return false;
  if (left === right) return true;

  return left.includes(right) || right.includes(left);
}

function getSimilarityLevel(score: number): SimilarityLevel {
  if (score >= 85) return "ALTA";
  if (score >= 70) return "MEDIA";
  return "BAJA";
}

function getExactOrPartialScore(
  a: string,
  b: string,
  weight: number
): number {
  const left = normalizeText(a);
  const right = normalizeText(b);

  if (!left || !right) return 0;
  if (left === right) return weight;
  if (left.includes(right) || right.includes(left)) return weight * 0.7;

  return 0;
}

function getMaterialsSimilarityScore(
  productMaterials: string[],
  projectMaterials: string[],
  weight: number
): number {
  const productSet = new Set(productMaterials.map(normalizeMaterial).filter(Boolean));
  const projectSet = new Set(projectMaterials.map(normalizeMaterial).filter(Boolean));

  if (productSet.size === 0 || projectSet.size === 0) return 0;

  const intersection = [...productSet].filter((material) => projectSet.has(material));
  const union = new Set([...productSet, ...projectSet]);

  return Math.round((intersection.length / union.size) * weight);
}

export function calculateSimilarityScore(
  product: ProductPreliminaryRecord,
  project: ProjectRecord,
  portfolio?: AnyPortfolioRecord
): number {
  const productClient =
    product.clientName ||
    getPortfolioValue(portfolio, ["clientName", "cli", "cliente", "clientCode"]);

  const productUseFinal =
    product.useFinalName ||
    getPortfolioValue(portfolio, ["useFinalName", "usoFinal", "uf"]);

  const productStructure = product.structureSummary || product.materials.join(" / ");
  const projectStructure = getProjectStructureSummary(project);

  let score = 0;

  score += getExactOrPartialScore(
    productClient,
    getProjectClient(project),
    SIMILARITY_WEIGHTS.client
  );

  score += getExactOrPartialScore(
    productUseFinal,
    getProjectUseFinal(project),
    SIMILARITY_WEIGHTS.useFinal
  );

  score += getExactOrPartialScore(
    productStructure,
    projectStructure,
    SIMILARITY_WEIGHTS.structure
  );

  if (product.layerCount > 0 && product.layerCount === getProjectLayerCount(project)) {
    score += SIMILARITY_WEIGHTS.layerCount;
  }

  score += getMaterialsSimilarityScore(
    product.materials,
    getProjectMaterials(project),
    SIMILARITY_WEIGHTS.materials
  );

  if (product.hasSpecialDesign === (getProjectHasSpecialDesign(project) ? "Sí" : "No")) {
    score += SIMILARITY_WEIGHTS.specialDesign;
  }

  return Math.min(Math.round(score), SIMILARITY_TOTAL_WEIGHT);
}

export function findSimilarApprovedProjects(
  product: ProductPreliminaryRecord,
  portfolio?: AnyPortfolioRecord,
  projectRecords: ProjectRecord[] = getProjectRecords()
): SimilarProjectResult[] {
  const productWrapping = product.wrappingName;
  const productMachine = product.packingMachineName;

  const candidates = projectRecords.filter((project) => {
    if (!isApprovedProject(project)) return false;

    const sameWrapping = isSameOrEquivalent(productWrapping, getProjectWrapping(project));
    const sameMachine = isSameOrEquivalent(productMachine, getProjectMachine(project));

    return sameWrapping && sameMachine;
  });

  return candidates
    .map((project) => {
      const similarityScore = calculateSimilarityScore(product, project, portfolio);

      return {
        projectCode: project.code,
        projectName: project.projectName,
        clientName: getProjectClient(project),
        wrappingName: getProjectWrapping(project),
        packingMachineName: getProjectMachine(project),
        useFinalName: getProjectUseFinal(project),
        structureSummary: getProjectStructureSummary(project),
        layerCount: getProjectLayerCount(project),
        materials: getProjectMaterials(project),
        hasSpecialDesign: getProjectHasSpecialDesign(project),
        similarityScore,
        similarityLevel: getSimilarityLevel(similarityScore),
        status: String(project.status || ""),
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

export function isSimilarityReferenceUsable(score?: number): boolean {
  return typeof score === "number" && score >= 70;
}

export function isSimilarityReferenceHigh(score?: number): boolean {
  return typeof score === "number" && score >= 85;
}
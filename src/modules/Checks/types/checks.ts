import { type ProjectRecord, type ValidationStatus } from "../../../shared/data/projectStorage";

export type UserRole =
  | "Artes Gráficas"
  | "R&D Técnica"
  | "R&D Desarrollo"
  | "Ejecutivo Comercial"
  | "Administrador"
  | "PMO"
  | "Master Data";

export interface CurrentUser {
  id: string;
  fullName: string;
  role: UserRole;
  area?: string;
  departamento?: string;
}

export type ChecksFilter =
  | "all"
  | "pending"
  | "observed"
  | "rejected"
  | "approved";

export interface ValidationCheckItem {
  projectCode: string;
  projectName: string;
  clientName: string;
  ejecutivoName: string;
  area: string;
  validationStatus: ValidationStatus;
  lastCommentDate?: string;
  responsableName?: string;
  isBlocked: boolean;
  isReadyForRFQ: boolean;
}

export interface ChecksListFilters {
  searchText: string;
  filterBy: ChecksFilter;
  sortBy: "date" | "status" | "project";
  sortOrder: "asc" | "desc";
}

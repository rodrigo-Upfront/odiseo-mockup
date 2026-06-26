export type ProjectDocument = {
  id: string;
  projectCode: string;
  fileName: string;
  fileType: string;
  fileExtension: string;
  fileSize: number;
  base64Data: string;
  uploadedAt: string;
};

const STORAGE_KEY = "odiseo_project_documents";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeParseArray<T>(json: string | null): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStorage(): ProjectDocument[] {
  if (!isBrowser()) return [];
  return safeParseArray<ProjectDocument>(localStorage.getItem(STORAGE_KEY));
}

function writeStorage(documents: ProjectDocument[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
}

export function getDocumentsByProject(projectCode: string): ProjectDocument[] {
  const all = readStorage();
  return all.filter((doc) => doc.projectCode === projectCode).sort((a, b) => {
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });
}

export function saveDocument(document: ProjectDocument): void {
  const all = readStorage();
  const existing = all.findIndex((doc) => doc.id === document.id);

  if (existing >= 0) {
    all[existing] = document;
  } else {
    all.push(document);
  }

  writeStorage(all);
}

export function deleteDocument(documentId: string): void {
  const all = readStorage();
  const filtered = all.filter((doc) => doc.id !== documentId);
  writeStorage(filtered);
}

export function getDocumentById(documentId: string): ProjectDocument | null {
  const all = readStorage();
  return all.find((doc) => doc.id === documentId) || null;
}

export function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

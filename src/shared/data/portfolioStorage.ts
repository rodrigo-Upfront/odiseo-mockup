import { PRODUCT_CATALOGS } from "./productCatalogs";

const PORTFOLIO_DISPLAY_KEY = "odiseo_created_portfolios";
const TABPORT_RECORDS_KEY = "odiseo_tabport_records";
const PORTFOLIO_DELETED_KEY = "odiseo_deleted_portfolios";

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export type PortfolioStatus = "Borrador" | "Activo" | "Inactivo" | "Aprobado";

export type PortfolioRecord = {
  id: string; // Internal ID or code
  codigo: string; // PO-000001
  clientCode?: string;
  clientName?: string;
  ejecutivoId?: number | string;
  ejecutivoName?: string;
  plantaName?: string;
  
  // Datos de Producto (ADN)
  envoltura?: string;
  usoFinal?: string;
  sector?: string;
  segmento?: string;
  subSegmento?: string;
  afMarketId?: string;
  maquinaCliente?: string;

  status: PortfolioStatus;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
};

export const INITIAL_PORTFOLIOS: PortfolioRecord[] = [
  {
    id: "PO-000001",
    codigo: "PO-000001",
    clientCode: "CLI-000001",
    clientName: "Alicorp S.A.A.",
    ejecutivoId: 43,
    ejecutivoName: "EDUARDO POSADA",
    plantaName: "Callao",
    envoltura: "Pouch",
    usoFinal: "Galletas",
    sector: "Alimentos y bebidas",
    seg: "Consumo Humano",
    segmento: "Consumo Humano",
    subseg: "Golosinas",
    subSegmento: "Golosinas",
    af: "AF-10001",
    afMarketId: "AF-10001",
    maquinaCliente: "Bosch",
    status: "Activo",
    createdAt: "2026-02-15T10:00:00.000Z",
    updatedAt: "2026-02-15T10:00:00.000Z"
  },
  {
    id: "PO-000002",
    codigo: "PO-000002",
    clientCode: "CLI-000002",
    clientName: "Kimberly-Clark Perú",
    ejecutivoId: 13,
    ejecutivoName: "ALDO BOERO",
    plantaName: "Santa Anita",
    envoltura: "Bolsa",
    usoFinal: "Pañales",
    sector: "Manufactura",
    seg: "Bebés",
    segmento: "Bebés",
    subseg: "Higiene",
    subSegmento: "Higiene",
    af: "AF-10002",
    afMarketId: "AF-10002",
    maquinaCliente: "Volpak",
    status: "Activo",
    createdAt: "2026-03-01T11:30:00.000Z",
    updatedAt: "2026-03-01T11:30:00.000Z"
  },
  {
    id: "PO-000003",
    codigo: "PO-000003",
    clientCode: "CLI-000003",
    clientName: "Leche Gloria S.A.",
    ejecutivoId: 56,
    ejecutivoName: "KATIA GUARDAMINO",
    plantaName: "Huachipa",
    envoltura: "Pouch",
    usoFinal: "Leche Evaporada",
    sector: "Alimentos y bebidas",
    seg: "Lácteos",
    segmento: "Lácteos",
    subseg: "Líquidos",
    subSegmento: "Líquidos",
    af: "AF-10003",
    afMarketId: "AF-10003",
    maquinaCliente: "Tetrapak",
    status: "Activo",
    createdAt: "2026-03-10T09:15:00.000Z",
    updatedAt: "2026-03-10T09:15:00.000Z"
  },
  {
    id: "PO-000004",
    codigo: "PO-000004",
    clientCode: "CLI-000001",
    clientName: "Alicorp S.A.A.",
    ejecutivoId: 43,
    ejecutivoName: "EDUARDO POSADA",
    plantaName: "Callao",
    envoltura: "Lámina",
    usoFinal: "Fideos",
    sector: "Alimentos y bebidas",
    seg: "Pastas",
    segmento: "Pastas",
    subseg: "Secos",
    subSegmento: "Secos",
    af: "AF-10004",
    afMarketId: "AF-10004",
    maquinaCliente: "Oystar",
    status: "Borrador",
    createdAt: "2026-04-05T14:20:00.000Z",
    updatedAt: "2026-04-05T14:20:00.000Z"
  },
  {
    id: "PO-000005",
    codigo: "PO-000005",
    clientCode: "CLI-000005",
    clientName: "Nestlé Perú",
    ejecutivoId: 2,
    ejecutivoName: "AUGUSTO OTERO",
    plantaName: "Lima",
    envoltura: "Bolsa",
    usoFinal: "Café Soluble",
    sector: "Bebidas",
    seg: "Café",
    segmento: "Café",
    subseg: "Instantáneo",
    subSegmento: "Instantáneo",
    af: "AF-10005",
    afMarketId: "AF-10005",
    maquinaCliente: "Mespack",
    status: "Activo",
    createdAt: "2026-04-12T16:45:00.000Z",
    updatedAt: "2026-04-12T16:45:00.000Z"
  },
  {
    id: "PO-000023",
    codigo: "PO-000023",
    code: "PO-000023",
    portfolioCode: "PO-000023",
    name: "Mayonesa Premium",
    nom: "Mayonesa Premium",
    nombrePortafolio: "Mayonesa Premium",
    clientCode: "CL-000001",
    CLMaCCLi: "CL-000001",
    codigoCliente: "CL-000001",
    clientName: "Alicorp S.A.A.",
    cli: "Alicorp S.A.A.",
    cliente: "Alicorp S.A.A.",
    nombreCliente: "Alicorp S.A.A.",
    razonSocial: "Alicorp S.A.A.",
    businessName: "Alicorp S.A.A.",
    ejecutivoName: "BALDEON, EDUARDO",
    plantaName: "AF Lima",
    plantName: "AF Lima",
    envoltura: "POUCH",
    wrappingName: "POUCH",
    usoFinal: "Wet Condiments & Sauces",
    useFinalName: "Wet Condiments & Sauces",
    sector: "Food / Culinary",
    segmento: "Food / Culinary / Wet Condiments",
    subSegmento: "Wet Condiments & Sauces",
    afMarketId: "AF-10001",
    maquinaCliente: "HFFS - Stand up Pouch - Sello Doy Pack",
    status: "Aprobado",
    est: "Aprobado",
    proy: [],
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z"
  }
];

export function getPortfolioDisplayRecords(): PortfolioRecord[] {
  const created = safeParseArray<PortfolioRecord>(localStorage.getItem(PORTFOLIO_DISPLAY_KEY));
  const deletedIds = safeParseArray<string>(localStorage.getItem(PORTFOLIO_DELETED_KEY));
  
  const createdIds = new Set(created.map(c => c.id || c.codigo));
  const deletedSet = new Set(deletedIds);

  const initials = INITIAL_PORTFOLIOS.filter(p => !createdIds.has(p.id) && !deletedSet.has(p.id));
  
  return [...created, ...initials].filter(p => !deletedSet.has(p.id) && !deletedSet.has(p.codigo));
}

export function getTabportRecords<T>() {
  return safeParseArray<T>(localStorage.getItem(TABPORT_RECORDS_KEY));
}

export function savePortfolioRecord<TDisplay, TTabport>({
  displayRecord,
  tabportRecord,
}: {
  displayRecord: TDisplay;
  tabportRecord: TTabport;
}) {
  const savedDisplay = getPortfolioDisplayRecords();
  const savedTabport = getTabportRecords<TTabport>();

  localStorage.setItem(
    PORTFOLIO_DISPLAY_KEY,
    JSON.stringify([displayRecord, ...savedDisplay])
  );

  localStorage.setItem(
    TABPORT_RECORDS_KEY,
    JSON.stringify([tabportRecord, ...savedTabport])
  );
}

export function getPortfolioByCode(code: string): PortfolioRecord | null {
  const saved = getPortfolioDisplayRecords();
  return saved.find((item) => item.id === code || item.codigo === code) || null;
}

export function updatePortfolioRecord(
  code: string,
  updates: Partial<PortfolioRecord>
): PortfolioRecord | null {
  const saved = getPortfolioDisplayRecords();
  const index = saved.findIndex((item) => item.id === code || item.codigo === code);
  if (index === -1) return null;

  saved[index] = { ...saved[index], ...updates };
  localStorage.setItem(PORTFOLIO_DISPLAY_KEY, JSON.stringify(saved));
  return saved[index];
}

export function deletePortfolioRecord(code: string): boolean {
  const deletedIds = safeParseArray<string>(localStorage.getItem(PORTFOLIO_DELETED_KEY));
  if (!deletedIds.includes(code)) {
    deletedIds.push(code);
    localStorage.setItem(PORTFOLIO_DELETED_KEY, JSON.stringify(deletedIds));
  }

  const created = safeParseArray<PortfolioRecord>(localStorage.getItem(PORTFOLIO_DISPLAY_KEY));
  const filtered = created.filter((item) => item.id !== code && item.codigo !== code);
  localStorage.setItem(PORTFOLIO_DISPLAY_KEY, JSON.stringify(filtered));
  return true;
}

export function getPortfoliosByClient(client: any): PortfolioRecord[] {
  const clientId = String(client.id || client.code || client.codigo || "").trim();
  const clientCode = String(client.code || client.codigo || client.id || "").trim();
  const clientName = String(client.nombre || client.name || client.razonSocial || client.businessName || "").trim().toLowerCase();
  const clientRuc = String(client.ruc || client.RUC || "").trim();

  return getPortfolioDisplayRecords().filter((portfolio: any) => {
    const portfolioClientId = String(portfolio.clientId || portfolio.clienteId || portfolio.clientCode || portfolio.codigoCliente || "").trim();
    const portfolioClientName = String(portfolio.clientName || portfolio.cliente || portfolio.cli || portfolio.nombreCliente || "").trim().toLowerCase();
    const portfolioClientRuc = String(portfolio.clientRuc || portfolio.ruc || portfolio.rucCliente || "").trim();

    return (
      (clientId && portfolioClientId === clientId) ||
      (clientCode && portfolioClientId === clientCode) ||
      (clientName && portfolioClientName === clientName) ||
      (clientRuc && portfolioClientRuc === clientRuc)
    );
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Catálogo oficial de Aplicación Técnica
// Fuente única reutilizable para Portafolio y Proyecto
// ──────────────────────────────────────────────────────────────────────────────

// Consolidado desde PRODUCT_CATALOGS - única fuente de verdad
// Anteriormente estaba duplicado aquí (45+ valores)
export const TECHNICAL_APPLICATION_OPTIONS = PRODUCT_CATALOGS.aplicacionTecnica.values.map(
  (val) => ({
    value: val,
    label: val,
  })
);

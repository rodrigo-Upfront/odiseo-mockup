// src/modules/dashboard/data/homeMockData.ts

export type ProductStatus =
  | "Registrado"
  | "En preparación"
  | "Completado";

export type IntegrationStatus =
  | "No enviado"
  | "Pendiente de envío"
  | "Enviado a Sistema Integral"
  | "Enviado a WebCenter"
  | "Error de envío";

export type ReusableProductCondition =
  | "Producto Base"
  | "SKU Aprobado";

export type PackagingType =
  | "POUCH"
  | "BOLSA"
  | "LAMINA";

export type RequestType =
  | "Producto nuevo sin referencia"
  | "Producto nuevo con referencia"
  | "Producto modificado"
  | "Extensión de línea"
  | "Portafolio estándar";

export type BpmStage =
  | "P1/P2 - Ficha registrada"
  | "P3 - Datos adicionales del cliente"
  | "P4 - Datos de ficha completados"
  | "Preparación comercial"
  | "Preparación Customer Service"
  | "Preparación técnica"
  | "Preparación de estructura"
  | "Preparación de artes"
  | "Ficha completada"
  | "Sincronización con Sistema Integral"
  | "Sincronización con WebCenter";

export type ReusableProductItem = {
  sku: string;
  product: string;
  client: string;
  packagingType: PackagingType;
  condition: ReusableProductCondition;
  reuseHint: string;
  lastUsedLabel?: string;
  updatedLabel?: string;
  route: string;
};

export type WorkQueueItem = {
  code: string;
  product: string;
  client: string;
  requestType: RequestType;
  status: ProductStatus;
  bpmStage: BpmStage;
  integrationStatus: IntegrationStatus;
  responsibleArea:
    | "Comercial"
    | "Customer Service"
    | "R&D"
    | "Área Técnica"
    | "Artes Gráficas"
    | "Master Data"
    | "Sistema Integral"
    | "WebCenter";
  actionLabel: string;
  nextStep?: string;
  priority: "Alta" | "Media" | "Baja";
  dueLabel: string;
  route: string;
  urgency?: "high" | "medium" | "low";
  type?: RequestType;
};

export type ExecutiveSummaryCard = {
  label: string;
  value: string;
  description: string;
};

// Legacy types for backward compatibility with other dashboard components
export type SoldProduct = {
  code: string;
  name: string;
  client: string;
  rubro: string;
  wrapping: PackagingType;
  structure: string;
  status: "Completado";
  layerCount: number;
  lastUsed: string;
  successBadge: string;
};

export type RecentClient = {
  name: string;
  lastProduct: string;
  mainRubro: string;
  productsHighlighted: number;
  activePortfolios: number;
};

export type RecentRubro = {
  name: string;
  productCount: number;
  frequentStructure: string;
  frequentWrapping: PackagingType;
};

export type Recommendation = {
  type: string;
  title: string;
  description: string;
  actionLabel: string;
  route?: string;
  badge?: string;
};

export const EXECUTIVE_SUMMARY: ExecutiveSummaryCard[] = [
  {
    label: "Productos aprobados",
    value: "24",
    description: "Base histórica disponible",
  },
  {
    label: "Fichas registradas",
    value: "8",
    description: "Pendientes de preparación",
  },
  {
    label: "Fichas completadas",
    value: "5",
    description: "Listas para integración",
  },
  {
    label: "Enviados a Sistema Integral",
    value: "3",
    description: "Integración ordenada",
  },
];

export const REUSABLE_PRODUCTS: ReusableProductItem[] = [
  {
    sku: "SKU-000250",
    product: "Doypack 250 g",
    client: "Alicorp S.A.A.",
    packagingType: "POUCH",
    condition: "Producto Base",
    reuseHint: "Referencia para producto nuevo con cambio de formato o volumen.",
    lastUsedLabel: "Usado recientemente",
    route: "/products/SKU-000250",
  },
  {
    sku: "SKU-000418",
    product: "Doypack Mayonesa 22 g",
    client: "Kimberly-Clark Perú",
    packagingType: "POUCH",
    condition: "SKU Aprobado",
    reuseHint: "Referencia para producto modificado o extensión de línea.",
    updatedLabel: "Actualizado hace 8 días",
    route: "/products/SKU-000418",
  },
  {
    sku: "SKU-000612",
    product: "Maggie 24 g",
    client: "Alicorp S.A.A.",
    packagingType: "BOLSA",
    condition: "Producto Base",
    reuseHint: "Referencia para portafolio estándar reutilizable.",
    lastUsedLabel: "Usado hace 2 semanas",
    route: "/products/SKU-000612",
  },
  {
    sku: "SKU-000735",
    product: "Galleta Crispy 25 g",
    client: "Café Andino Export S.A.C.",
    packagingType: "LAMINA",
    condition: "SKU Aprobado",
    reuseHint: "Referencia para nueva ficha con estructura similar.",
    updatedLabel: "Actualizado hace 15 días",
    route: "/products/SKU-000735",
  },
];

export const QUICK_RECOMMENDATIONS: Recommendation[] = [
  {
    type: "completed",
    title: "Productos completados",
    description: "SKU completados y listos para sincronización con Sistema Integral.",
    actionLabel: "Ver productos",
    route: "/products",
  },
  {
    type: "reference",
    title: "Productos de referencia",
    description: "SKU completados que puedes usar como referencia para nuevas fichas de producto.",
    actionLabel: "Usar como referencia",
    route: "/products",
  },
  {
    type: "in-preparation",
    title: "Fichas en preparación",
    description: "Fichas de producto actualmente en preparación en los diferentes equipos.",
    actionLabel: "Ver fichas",
    route: "/products",
  },
];

export const RECENT_CLIENTS: RecentClient[] = [
  {
    name: "Alicorp S.A.A.",
    lastProduct: "Doypack 250 g",
    mainRubro: "Alimentos Procesados",
    productsHighlighted: 12,
    activePortfolios: 3,
  },
  {
    name: "Kimberly-Clark Perú",
    lastProduct: "Doypack Mayonesa 22 g",
    mainRubro: "Salsas y Aderezos",
    productsHighlighted: 4,
    activePortfolios: 1,
  },
];

export const RECENT_RUBROS: RecentRubro[] = [
  {
    name: "Alimentos Procesados",
    productCount: 8,
    frequentStructure: "PET / BOPP / PE",
    frequentWrapping: "POUCH",
  },
  {
    name: "Salsas y Aderezos",
    productCount: 6,
    frequentStructure: "PET / PE",
    frequentWrapping: "POUCH",
  },
];

export const SOLD_PRODUCTS: SoldProduct[] = [
  {
    code: "SKU-000250",
    name: "Doypack 250 g",
    client: "Alicorp S.A.A.",
    rubro: "Alimentos Procesados",
    wrapping: "POUCH",
    structure: "PET / BOPP / PE",
    status: "Completado",
    layerCount: 3,
    lastUsed: "2026-04-20",
    successBadge: "Producto más usado",
  },
  {
    code: "SKU-000418",
    name: "Doypack Mayonesa 22 g",
    client: "Kimberly-Clark Perú",
    rubro: "Salsas y Aderezos",
    wrapping: "POUCH",
    structure: "PET / PE",
    status: "Completado",
    layerCount: 2,
    lastUsed: "2026-04-18",
    successBadge: "Producto más usado",
  },
];

export const WORK_QUEUE: WorkQueueItem[] = [
  {
    code: "FP-2450",
    product: "Salsa de Soya 240 g",
    client: "Alicorp S.A.A.",
    requestType: "Producto nuevo con referencia",
    status: "Registrado",
    bpmStage: "P1/P2 - Ficha registrada",
    integrationStatus: "No enviado",
    responsibleArea: "Comercial",
    actionLabel: "Completar información comercial",
    priority: "Alta",
    dueLabel: "Hoy",
    route: "/products/FP-2450",
  },
  {
    code: "FP-2451",
    product: "Doypack Mayonesa 100 g",
    client: "Kimberly-Clark Perú",
    requestType: "Producto modificado",
    status: "En preparación",
    bpmStage: "Preparación técnica",
    integrationStatus: "No enviado",
    responsibleArea: "Área Técnica",
    actionLabel: "Completar especificaciones técnicas",
    priority: "Alta",
    dueLabel: "Mañana",
    route: "/products/FP-2451",
  },
  {
    code: "FP-2452",
    product: "Lámina Flowpack 30 g",
    client: "Café Andino Export S.A.C.",
    requestType: "Producto nuevo sin referencia",
    status: "Completado",
    bpmStage: "Ficha completada",
    integrationStatus: "Pendiente de envío",
    responsibleArea: "Master Data",
    actionLabel: "Enviar a Sistema Integral",
    priority: "Media",
    dueLabel: "2 días",
    route: "/products/FP-2452",
  },
  {
    code: "SKU-1823",
    product: "Maggie 24 g",
    client: "Alicorp S.A.A.",
    requestType: "Portafolio estándar",
    status: "Completado",
    bpmStage: "Sincronización con Sistema Integral",
    integrationStatus: "Enviado a Sistema Integral",
    responsibleArea: "Sistema Integral",
    actionLabel: "Ver detalle",
    priority: "Baja",
    dueLabel: "Enviado",
    route: "/products/SKU-1823",
  },
];

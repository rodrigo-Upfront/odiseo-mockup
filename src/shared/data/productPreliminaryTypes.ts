export type YesNo = "Sí" | "No";

export type ProductPreliminaryStatus =
  | "Registrado"
  | "Pendiente referencia"
  | "Referencia asignada"
  | "Requiere validación"
  | "En validación"
  | "Observado"
  | "Validado"
  | "Listo para cotizar"
  | "En cotización"
  | "Cotizado"
  | "Aprobado por cliente"
  | "Desestimado"
  | "Enviado a SI"
  | "Alta confirmada en SI";

export type ProductRequestReason =
  | "Producto nuevo"
  | "Producto modificado"
  | "Extensión de línea"
  | "Portafolio estándar"
  | "ICO / BCP";

export type ProductCausal =
  | "Nueva estructura"
  | "Nuevos insumos"
  | "Nuevo formato de envasado"
  | "Nuevo diseño"
  | "Nuevo equipamiento / proceso / temperatura"
  | "Modifica dimensiones"
  | "Modifica propiedades"
  | "Cambia estructura"
  | "Cambia materia prima"
  | "Cambia diseño"
  | "Misma estructura"
  | "Cambia dimensión fuera de tolerancia"
  | "Cambia diseño por variante"
  | "Referencia aprobada sin cambios"
  | "Mismo producto, misma especificación"
  | "Cambio de insumo no homologado";

export type ValidationRoute =
  | "SIN_VALIDACION"
  | "AG"
  | "RD_DESARROLLO"
  | "RD_AREA_TECNICA"
  | "AG_RD_DESARROLLO"
  | "AG_RD_AREA_TECNICA";

export type ResultOdiseo =
  | "Nuevo SKU sugerido"
  | "Versiona producto existente"
  | "Sin cambio de SKU"
  | "Condicionado";

export type SiProductOutcome =
  | "Nuevo SKU generado"
  | "Producto versionado"
  | "SKU existente confirmado"
  | "Rechazado por SI"
  | "Pendiente";

export type InterfaceStatus =
  | "No aplica"
  | "Pendiente"
  | "Enviado"
  | "Recibido"
  | "Confirmado"
  | "Error";

export type InterfaceChannel =
  | "API"
  | "XML"
  | "Manual";

export type InterfaceKey =
  | "P1_ODISEO_WEB_CENTER_EDAG"
  | "P2_ODISEO_SI_EM_EDAG"
  | "P3_WEB_CENTER_SI_DATOS_TECNICOS"
  | "P4_WEB_CENTER_SI_ARTE_PERFILADO"
  | "P5_SI_ODISEO_SKU"
  | "P6_SI_ODISEO_CATALOGOS";

export type SimilarityLevel = "ALTA" | "MEDIA" | "BAJA";

export type ProductLayer = {
  layerNumber: number;
  materialGroup?: string;
  material: string;
  micron?: string;
  grammage?: string;
};

export type InterfaceEvent = {
  id: string;
  key: InterfaceKey;
  status: InterfaceStatus;
  channel: InterfaceChannel;
  sentAt?: string;
  receivedAt?: string;
  confirmedAt?: string;
  errorMessage?: string;
  payloadReference?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductPreliminaryRecord = {
  id: string;
  productCode: string;
  portfolioCode: string;

  status: ProductPreliminaryStatus;

  requestReason: ProductRequestReason;
  causal: ProductCausal;

  commercialName: string;
  calculatedName: string;

  clientName?: string;
  clientCode?: string;

  wrappingName: string;
  useFinalName: string;
  packingMachineName: string;
  plantName?: string;

  structureType?: string;
  layerCount: number;
  layers: ProductLayer[];
  materials: string[];
  structureSummary: string;

  hasSpecialDesign: YesNo;

  capacityValue: string;
  capacityUnit: string;

  quoteQuantity?: string;
  quoteUnit?: string;

  assignedProjectCode?: string;
  assignedProjectName?: string;
  similarityScore?: number;
  similarityLevel?: SimilarityLevel;

  resultOdiseo: ResultOdiseo;
  validationRoute: ValidationRoute;

  validationProjectCode?: string;

  hasCriticalTechnicalDifference?: boolean;
  dimensionOutOfTolerance?: boolean;
  materialNotHomologated?: boolean;
  changesFunctionalSpecification?: boolean;
  hasGraphicChange?: boolean;

  edagVersionCode?: string;
  emVersionCode?: string;

  requiresWebCenter?: boolean;
  requiresSistemaIntegral?: boolean;

  webCenterStatus?: InterfaceStatus;
  webCenterProjectCode?: string;
  webCenterSentAt?: string;
  webCenterConfirmedAt?: string;
  artProfiledAt?: string;

  siPreliminaryStatus?: InterfaceStatus;
  siFinalStatus?: InterfaceStatus;
  sentToSiAt?: string;
  siConfirmedAt?: string;

  siOutcome?: SiProductOutcome;
  siSkuCode?: string;
  siVersion?: string;

  interfaceEvents?: InterfaceEvent[];

  createdAt: string;
  updatedAt: string;
};
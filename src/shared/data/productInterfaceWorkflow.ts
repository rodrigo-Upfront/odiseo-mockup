import {
  getProductByCode,
  updateProductPreliminaryRecord,
} from "./productPreliminaryStorage";
import type {
  InterfaceChannel,
  InterfaceEvent,
  InterfaceKey,
  InterfaceStatus,
  ProductPreliminaryRecord,
  SiProductOutcome,
} from "./productPreliminaryTypes";

function createEventId(): string {
  return `IEV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createInterfaceEvent(params: {
  key: InterfaceKey;
  status: InterfaceStatus;
  channel: InterfaceChannel;
  payloadReference?: string;
  errorMessage?: string;
}): InterfaceEvent {
  const now = new Date().toISOString();

  return {
    id: createEventId(),
    key: params.key,
    status: params.status,
    channel: params.channel,
    payloadReference: params.payloadReference,
    errorMessage: params.errorMessage,
    createdAt: now,
    updatedAt: now,
    ...(params.status === "Enviado" && { sentAt: now }),
    ...(params.status === "Recibido" && { receivedAt: now }),
    ...(params.status === "Confirmado" && { confirmedAt: now }),
  };
}

function appendInterfaceEvent(
  product: ProductPreliminaryRecord,
  event: InterfaceEvent
): InterfaceEvent[] {
  return [event, ...(product.interfaceEvents || [])];
}

export function addProductInterfaceEvent(
  productCode: string,
  event: InterfaceEvent
): ProductPreliminaryRecord | undefined {
  const product = getProductByCode(productCode);
  if (!product) return undefined;

  return updateProductPreliminaryRecord(productCode, {
    interfaceEvents: appendInterfaceEvent(product, event),
  });
}

export function markProductSentToWebCenter(
  productCode: string,
  payloadReference?: string
): ProductPreliminaryRecord | undefined {
  const product = getProductByCode(productCode);
  if (!product) return undefined;

  const now = new Date().toISOString();

  const event = createInterfaceEvent({
    key: "P1_ODISEO_WEB_CENTER_EDAG",
    status: "Enviado",
    channel: "XML",
    payloadReference,
  });

  return updateProductPreliminaryRecord(productCode, {
    requiresWebCenter: true,
    webCenterStatus: "Enviado",
    webCenterSentAt: now,
    status: "Enviado a SI",
    interfaceEvents: appendInterfaceEvent(product, event),
  });
}

export function confirmProductWebCenter(
  productCode: string,
  webCenterProjectCode?: string
): ProductPreliminaryRecord | undefined {
  const product = getProductByCode(productCode);
  if (!product) return undefined;

  const now = new Date().toISOString();

  const event = createInterfaceEvent({
    key: "P1_ODISEO_WEB_CENTER_EDAG",
    status: "Confirmado",
    channel: "XML",
    payloadReference: webCenterProjectCode,
  });

  return updateProductPreliminaryRecord(productCode, {
    webCenterStatus: "Confirmado",
    webCenterProjectCode,
    webCenterConfirmedAt: now,
    interfaceEvents: appendInterfaceEvent(product, event),
  });
}

export function markProductSentToSI(
  productCode: string,
  payloadReference?: string
): ProductPreliminaryRecord | undefined {
  const product = getProductByCode(productCode);
  if (!product) return undefined;

  const now = new Date().toISOString();

  const event = createInterfaceEvent({
    key: "P2_ODISEO_SI_EM_EDAG",
    status: "Enviado",
    channel: "API",
    payloadReference,
  });

  return updateProductPreliminaryRecord(productCode, {
    requiresSistemaIntegral: true,
    siPreliminaryStatus: "Enviado",
    sentToSiAt: now,
    status: "Enviado a SI",
    interfaceEvents: appendInterfaceEvent(product, event),
  });
}

export function confirmProductSkuFromSI(params: {
  productCode: string;
  siSkuCode: string;
  siOutcome: SiProductOutcome;
  siVersion?: string;
  payloadReference?: string;
}): ProductPreliminaryRecord | undefined {
  const product = getProductByCode(params.productCode);
  if (!product) return undefined;

  const now = new Date().toISOString();

  const event = createInterfaceEvent({
    key: "P5_SI_ODISEO_SKU",
    status: "Confirmado",
    channel: "API",
    payloadReference: params.payloadReference || params.siSkuCode,
  });

  return updateProductPreliminaryRecord(params.productCode, {
    status: "Alta confirmada en SI",
    siFinalStatus: "Confirmado",
    siOutcome: params.siOutcome,
    siSkuCode: params.siSkuCode,
    siVersion: params.siVersion,
    siConfirmedAt: now,
    interfaceEvents: appendInterfaceEvent(product, event),
  });
}

export function registerProductInterfaceError(params: {
  productCode: string;
  key: InterfaceKey;
  channel: InterfaceChannel;
  errorMessage: string;
  payloadReference?: string;
}): ProductPreliminaryRecord | undefined {
  const product = getProductByCode(params.productCode);
  if (!product) return undefined;

  const event = createInterfaceEvent({
    key: params.key,
    status: "Error",
    channel: params.channel,
    errorMessage: params.errorMessage,
    payloadReference: params.payloadReference,
  });

  return updateProductPreliminaryRecord(params.productCode, {
    interfaceEvents: appendInterfaceEvent(product, event),
    ...(params.key === "P1_ODISEO_WEB_CENTER_EDAG" && {
      webCenterStatus: "Error" as const,
    }),
    ...(params.key === "P2_ODISEO_SI_EM_EDAG" && {
      siPreliminaryStatus: "Error" as const,
    }),
    ...(params.key === "P5_SI_ODISEO_SKU" && {
      siFinalStatus: "Error" as const,
    }),
  });
}
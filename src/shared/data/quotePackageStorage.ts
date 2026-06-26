import {
  getProductByCode,
  updateProductPreliminaryRecord,
} from "./productPreliminaryStorage";

const QUOTE_PACKAGE_STORAGE_KEY = "odiseo_quote_packages";
const QUOTE_PACKAGE_SEQUENCE_KEY = "odiseo_quote_package_sequence";

export type QuotePackageStatus =
  | "Registrado"
  | "Enviado a Commercial Finance"
  | "Cotizado"
  | "Cerrado"
  | "Cancelado";

export type QuotePackageRecord = {
  id: string;
  quotePackageCode: string;
  portfolioCode: string;
  productCodes: string[];
  status: QuotePackageStatus;
  exportedAt?: string;
  quotedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
};

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveAllQuotePackages(records: QuotePackageRecord[]): void {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(QUOTE_PACKAGE_STORAGE_KEY, JSON.stringify(records));
}

export function getQuotePackages(): QuotePackageRecord[] {
  if (!canUseLocalStorage()) return [];
  return safeParse<QuotePackageRecord[]>(
    localStorage.getItem(QUOTE_PACKAGE_STORAGE_KEY),
    []
  );
}

export function getQuotePackagesByPortfolio(portfolioCode: string): QuotePackageRecord[] {
  return getQuotePackages().filter((record) => record.portfolioCode === portfolioCode);
}

export function getQuotePackageByCode(
  quotePackageCode: string
): QuotePackageRecord | undefined {
  return getQuotePackages().find(
    (record) =>
      record.quotePackageCode === quotePackageCode ||
      record.id === quotePackageCode
  );
}

export function getNextQuotePackageNumber(): number {
  if (!canUseLocalStorage()) return 1;

  const current = Number(localStorage.getItem(QUOTE_PACKAGE_SEQUENCE_KEY) || "0");
  const next = Number.isFinite(current) ? current + 1 : 1;

  localStorage.setItem(QUOTE_PACKAGE_SEQUENCE_KEY, String(next));
  return next;
}

export function getNextQuotePackageCode(): string {
  const next = getNextQuotePackageNumber();
  return `COT-${String(next).padStart(6, "0")}`;
}

export function validateProductsForQuotePackage(
  portfolioCode: string,
  productCodes: string[]
): string[] {
  const errors: string[] = [];

  if (productCodes.length === 0) {
    errors.push("Debe seleccionar al menos un producto para cotizar.");
  }

  productCodes.forEach((productCode) => {
    const product = getProductByCode(productCode);

    if (!product) {
      errors.push(`No se encontró el producto ${productCode}.`);
      return;
    }

    if (product.portfolioCode !== portfolioCode) {
      errors.push(`El producto ${product.productCode} no pertenece al portafolio seleccionado.`);
    }

    if (product.status !== "Listo para cotizar") {
      errors.push(`El producto ${product.productCode} no está listo para cotizar.`);
    }

    if (!product.quoteQuantity?.trim()) {
      errors.push(`El producto ${product.productCode} no tiene cantidad a cotizar.`);
    }

    if (!product.quoteUnit?.trim()) {
      errors.push(`El producto ${product.productCode} no tiene unidad de cotización.`);
    }
  });

  return errors;
}

export function createQuotePackage(
  portfolioCode: string,
  productCodes: string[]
): QuotePackageRecord {
  const errors = validateProductsForQuotePackage(portfolioCode, productCodes);

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const now = new Date().toISOString();
  const quotePackageCode = getNextQuotePackageCode();

  const record: QuotePackageRecord = {
    id: quotePackageCode,
    quotePackageCode,
    portfolioCode,
    productCodes,
    status: "Registrado",
    createdAt: now,
    updatedAt: now,
  };

  saveAllQuotePackages([record, ...getQuotePackages()]);

  return record;
}

export function updateQuotePackage(
  quotePackageCode: string,
  changes: Partial<QuotePackageRecord>
): QuotePackageRecord | undefined {
  const records = getQuotePackages();
  const current = records.find(
    (record) =>
      record.quotePackageCode === quotePackageCode ||
      record.id === quotePackageCode
  );

  if (!current) return undefined;

  const updated: QuotePackageRecord = {
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  };

  saveAllQuotePackages(
    records.map((record) =>
      record.quotePackageCode === current.quotePackageCode ? updated : record
    )
  );

  return updated;
}

export function markQuotePackageExported(
  quotePackageCode: string
): QuotePackageRecord | undefined {
  const now = new Date().toISOString();
  const packageRecord = getQuotePackageByCode(quotePackageCode);

  if (!packageRecord) return undefined;

  packageRecord.productCodes.forEach((productCode) => {
    updateProductPreliminaryRecord(productCode, {
      status: "En cotización",
    });
  });

  return updateQuotePackage(quotePackageCode, {
    status: "Enviado a Commercial Finance",
    exportedAt: now,
  });
}

export function markQuotePackageQuoted(
  quotePackageCode: string
): QuotePackageRecord | undefined {
  const now = new Date().toISOString();
  const packageRecord = getQuotePackageByCode(quotePackageCode);

  if (!packageRecord) return undefined;

  packageRecord.productCodes.forEach((productCode) => {
    updateProductPreliminaryRecord(productCode, {
      status: "Cotizado",
    });
  });

  return updateQuotePackage(quotePackageCode, {
    status: "Cotizado",
    quotedAt: now,
  });
}

export function clearQuotePackageStorage(): void {
  if (!canUseLocalStorage()) return;
  localStorage.removeItem(QUOTE_PACKAGE_STORAGE_KEY);
  localStorage.removeItem(QUOTE_PACKAGE_SEQUENCE_KEY);
}
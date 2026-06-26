import type {
  ProductPreliminaryRecord,
  ProductPreliminaryStatus,
} from "./productPreliminaryTypes";

const PRODUCT_PRELIMINARY_STORAGE_KEY = "odiseo_product_preliminary_records";
const PRODUCT_PRELIMINARY_SEQUENCE_KEY = "odiseo_product_preliminary_sequence";

export type CreateProductPreliminaryInput =
  Omit<ProductPreliminaryRecord, "id" | "productCode" | "createdAt" | "updatedAt"> &
  Partial<Pick<ProductPreliminaryRecord, "id" | "productCode" | "createdAt" | "updatedAt">>;

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

function saveAllProductPreliminaryRecords(records: ProductPreliminaryRecord[]): void {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(PRODUCT_PRELIMINARY_STORAGE_KEY, JSON.stringify(records));
}

export function getProductPreliminaryRecords(): ProductPreliminaryRecord[] {
  if (!canUseLocalStorage()) return [];
  return safeParse<ProductPreliminaryRecord[]>(
    localStorage.getItem(PRODUCT_PRELIMINARY_STORAGE_KEY),
    []
  );
}

export function getProductsByPortfolio(portfolioCode: string): ProductPreliminaryRecord[] {
  return getProductPreliminaryRecords().filter(
    (product) => product.portfolioCode === portfolioCode
  );
}

export function getProductByCode(
  productCode: string
): ProductPreliminaryRecord | undefined {
  return getProductPreliminaryRecords().find(
    (product) => product.productCode === productCode || product.id === productCode
  );
}

export function getNextProductPreliminaryNumber(): number {
  if (!canUseLocalStorage()) return 1;

  const current = Number(localStorage.getItem(PRODUCT_PRELIMINARY_SEQUENCE_KEY) || "0");
  const next = Number.isFinite(current) ? current + 1 : 1;

  localStorage.setItem(PRODUCT_PRELIMINARY_SEQUENCE_KEY, String(next));
  return next;
}

export function getNextProductPreliminaryCode(): string {
  const next = getNextProductPreliminaryNumber();
  return `PP-${String(next).padStart(6, "0")}`;
}

export function createProductPreliminaryRecord(
  input: CreateProductPreliminaryInput
): ProductPreliminaryRecord {
  const now = new Date().toISOString();
  const code = input.productCode || getNextProductPreliminaryCode();

  const record: ProductPreliminaryRecord = {
    ...input,
    id: input.id || code,
    productCode: code,
    status: input.status || "Registrado",
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };

  const records = getProductPreliminaryRecords();
  saveAllProductPreliminaryRecords([record, ...records]);

  return record;
}

export function saveProductPreliminaryRecord(
  record: ProductPreliminaryRecord
): ProductPreliminaryRecord {
  const now = new Date().toISOString();
  const records = getProductPreliminaryRecords();

  const nextRecord: ProductPreliminaryRecord = {
    ...record,
    updatedAt: now,
  };

  const exists = records.some(
    (product) => product.productCode === record.productCode || product.id === record.id
  );

  const nextRecords = exists
    ? records.map((product) =>
        product.productCode === record.productCode || product.id === record.id
          ? nextRecord
          : product
      )
    : [nextRecord, ...records];

  saveAllProductPreliminaryRecords(nextRecords);

  return nextRecord;
}

export function updateProductPreliminaryRecord(
  productCode: string,
  changes: Partial<ProductPreliminaryRecord>
): ProductPreliminaryRecord | undefined {
  const records = getProductPreliminaryRecords();
  const current = records.find(
    (product) => product.productCode === productCode || product.id === productCode
  );

  if (!current) return undefined;

  const updated: ProductPreliminaryRecord = {
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  };

  saveAllProductPreliminaryRecords(
    records.map((product) =>
      product.productCode === current.productCode || product.id === current.id
        ? updated
        : product
    )
  );

  return updated;
}

export function updateProductPreliminaryStatus(
  productCode: string,
  status: ProductPreliminaryStatus
): ProductPreliminaryRecord | undefined {
  return updateProductPreliminaryRecord(productCode, { status });
}

export function deleteProductPreliminaryRecord(productCode: string): void {
  const records = getProductPreliminaryRecords();
  saveAllProductPreliminaryRecords(
    records.filter(
      (product) => product.productCode !== productCode && product.id !== productCode
    )
  );
}

export function clearProductPreliminaryStorage(): void {
  if (!canUseLocalStorage()) return;
  localStorage.removeItem(PRODUCT_PRELIMINARY_STORAGE_KEY);
  localStorage.removeItem(PRODUCT_PRELIMINARY_SEQUENCE_KEY);
}

export function canProductBeQuoted(product: ProductPreliminaryRecord): boolean {
  return product.status === "Listo para cotizar";
}

export function getQuotableProductsByPortfolio(
  portfolioCode: string
): ProductPreliminaryRecord[] {
  return getProductsByPortfolio(portfolioCode).filter(canProductBeQuoted);
}
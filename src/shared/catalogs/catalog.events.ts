// Sistema de eventos global para cambios en catálogos
// Permite que otros módulos se suscriban a actualizaciones de catálogos

export const CATALOGS_UPDATED_EVENT = "odiseo:catalogs-updated";

export interface CatalogsUpdatedEventDetail {
  catalogCode: string;
  catalogName: string;
  logId: string;
  newRecords: number;
  modifiedRecords: number;
  inactivatedRecords: number;
  blockedRecords: number;
  timestamp: string;
}

export function emitCatalogsUpdated(detail: CatalogsUpdatedEventDetail): void {
  const event = new CustomEvent(CATALOGS_UPDATED_EVENT, { detail });
  window.dispatchEvent(event);
}

export function subscribeToCatalogsUpdated(
  callback: (event: CustomEvent<CatalogsUpdatedEventDetail>) => void
): () => void {
  const listener = callback as EventListener;
  window.addEventListener(CATALOGS_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener(CATALOGS_UPDATED_EVENT, listener);
  };
}

export function useCatalogsUpdatedSubscription(
  callback: (detail: CatalogsUpdatedEventDetail) => void
): () => void {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail);
    }
  };

  window.addEventListener(CATALOGS_UPDATED_EVENT, handler);

  return () => {
    window.removeEventListener(CATALOGS_UPDATED_EVENT, handler);
  };
}

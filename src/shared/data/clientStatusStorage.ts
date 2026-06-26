export type ClientStatusEvent = {
  id: string;
  clientId: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: string;
  changedBy: string;
  comment?: string;
};

const CLIENT_STATUS_HISTORY_KEY = "odiseo_client_status_history";

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistHistory(events: ClientStatusEvent[]) {
  localStorage.setItem(CLIENT_STATUS_HISTORY_KEY, JSON.stringify(events));
}

export function registerClientStatusChange(
  clientId: string,
  fromStatus: string | null,
  toStatus: string,
  changedBy: string,
  comment?: string
): ClientStatusEvent {
  const events = safeParseArray<ClientStatusEvent>(
    localStorage.getItem(CLIENT_STATUS_HISTORY_KEY)
  );

  const event: ClientStatusEvent = {
    id: `CSE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    clientId,
    fromStatus,
    toStatus,
    changedAt: new Date().toISOString(),
    changedBy,
    comment,
  };

  events.push(event);
  persistHistory(events);

  return event;
}

export function getClientStatusHistory(clientId: string): ClientStatusEvent[] {
  const events = safeParseArray<ClientStatusEvent>(
    localStorage.getItem(CLIENT_STATUS_HISTORY_KEY)
  );

  return events.filter((event) => event.clientId === clientId);
}

export function getLatestStatusEvent(clientId: string): ClientStatusEvent | undefined {
  const events = getClientStatusHistory(clientId);
  return events.length > 0 ? events[events.length - 1] : undefined;
}

import type { UserStatus } from "./userStorage";

const USER_STATUS_HISTORY_KEY = "odiseo_user_status_history";

export type UserStatusEvent = {
  id: string;
  userId: string;
  fromStatus: UserStatus | null;
  toStatus: UserStatus;
  changedBy: string;
  changedAt: string;
  comment?: string;
  tokenGenerated?: boolean;
};

const ALLOWED_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  pending_activation: ["active", "inactive", "blocked"],
  pending_validation: ["active", "inactive", "blocked", "pending_activation"],
  pending_sync: ["active", "inactive", "blocked", "pending_activation"],
  active: ["inactive", "blocked", "pending_activation", "pending_validation"],
  inactive: ["pending_activation", "active", "blocked"],
  blocked: ["active", "inactive", "pending_activation"],
};

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistHistory(events: UserStatusEvent[]) {
  localStorage.setItem(USER_STATUS_HISTORY_KEY, JSON.stringify(events));
}

function generateEventId(): string {
  return `UHIS-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function canTransitionUserStatus(
  fromStatus: UserStatus,
  toStatus: UserStatus
): boolean {
  if (fromStatus === toStatus) return true;
  return ALLOWED_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
}

export function registerUserStatusChange(
  userId: string,
  fromStatus: UserStatus | null,
  toStatus: UserStatus,
  changedBy: string,
  comment?: string,
  tokenGenerated: boolean = false
): UserStatusEvent {
  const history = safeParseArray<UserStatusEvent>(
    localStorage.getItem(USER_STATUS_HISTORY_KEY)
  );

  const event: UserStatusEvent = {
    id: generateEventId(),
    userId,
    fromStatus,
    toStatus,
    changedBy,
    changedAt: new Date().toISOString(),
    comment,
    tokenGenerated,
  };

  persistHistory([event, ...history]);

  return event;
}

export function getUserStatusHistory(userId: string): UserStatusEvent[] {
  const history = safeParseArray<UserStatusEvent>(
    localStorage.getItem(USER_STATUS_HISTORY_KEY)
  );

  return history
    .filter((event) => event.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
}

export function getAllStatusHistory(): UserStatusEvent[] {
  return safeParseArray<UserStatusEvent>(
    localStorage.getItem(USER_STATUS_HISTORY_KEY)
  ).sort(
    (a, b) =>
      new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
}

export function getLatestStatusEvent(userId: string): UserStatusEvent | null {
  const history = getUserStatusHistory(userId);
  return history.length > 0 ? history[0] : null;
}

export function clearUserStatusHistory(userId: string): void {
  const history = safeParseArray<UserStatusEvent>(
    localStorage.getItem(USER_STATUS_HISTORY_KEY)
  );

  persistHistory(history.filter((event) => event.userId !== userId));
}

export function clearAllUserStatusHistory(): void {
  localStorage.removeItem(USER_STATUS_HISTORY_KEY);
}
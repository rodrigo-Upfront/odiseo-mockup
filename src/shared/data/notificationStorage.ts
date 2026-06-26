import { getUserByEmail } from "./userStorage";

const NOTIFICATIONS_KEY = "odiseo_notifications";

export type NotificationAction =
  | "activation"
  | "reactivation"
  | "unblock"
  | "approval_request"
  | "approval_result";

export type NotificationRecord = {
  id: string;
  userId: string; // destinatario
  type: "in_app" | "email";
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO timestamp
  relatedUserId?: string; // usuario al que se refiere la acción
  action?: NotificationAction;
};

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistNotifications(records: NotificationRecord[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(records));
}

function generateNotificationId(): string {
  return `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function saveNotification(
  record: Omit<NotificationRecord, "id" | "createdAt" | "read">
): NotificationRecord {
  const notifications = safeParseArray<NotificationRecord>(
    localStorage.getItem(NOTIFICATIONS_KEY)
  );

  const notification: NotificationRecord = {
    ...record,
    id: generateNotificationId(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  persistNotifications([notification, ...notifications]);
  return notification;
}

export function getNotificationsForUser(userId: string): NotificationRecord[] {
  const notifications = safeParseArray<NotificationRecord>(
    localStorage.getItem(NOTIFICATIONS_KEY)
  );
  return notifications.filter((n) => n.userId === userId);
}

export function getUnreadCount(userId: string): number {
  return getNotificationsForUser(userId).filter((n) => !n.read).length;
}

export function markNotificationRead(id: string): void {
  const notifications = safeParseArray<NotificationRecord>(
    localStorage.getItem(NOTIFICATIONS_KEY)
  );
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  persistNotifications(updated);
}

export function markAllRead(userId: string): void {
  const notifications = safeParseArray<NotificationRecord>(
    localStorage.getItem(NOTIFICATIONS_KEY)
  );
  const updated = notifications.map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  persistNotifications(updated);
}

export function mockSendEmail(
  to: string,
  subject: string,
  body: string,
  relatedUserId?: string,
  action?: NotificationAction
): NotificationRecord {
  // Mock: find user by email to get userId
  const user = getUserByEmail(to);

  if (!user) {
    throw new Error(`Usuario con correo ${to} no encontrado`);
  }

  return saveNotification({
    userId: user.id,
    type: "email",
    title: subject,
    message: body,
    relatedUserId,
    action,
  });
}

export function getNotificationsSummary(userId: string) {
  const notifications = getNotificationsForUser(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 5);

  return {
    total: notifications.length,
    unreadCount,
    recent,
  };
}

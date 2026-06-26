// Password Reset Request Management
// Stores temporary reset tokens for password recovery

const RESET_REQUESTS_KEY = "odiseo_password_reset_requests";
const TOKEN_EXPIRATION_MINUTES = 30;

export interface PasswordResetRequest {
  id: string;
  email: string;
  userId: string;
  token: string;
  status: "PENDIENTE" | "USADO" | "EXPIRADO";
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

function generateId(): string {
  return `RESET-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getAllResetRequests(): PasswordResetRequest[] {
  return safeParseArray<PasswordResetRequest>(
    localStorage.getItem(RESET_REQUESTS_KEY)
  );
}

export function createResetRequest(
  email: string,
  userId: string
): PasswordResetRequest {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRATION_MINUTES * 60000);

  const request: PasswordResetRequest = {
    id: generateId(),
    email,
    userId,
    token: generateToken(),
    status: "PENDIENTE",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const requests = getAllResetRequests();
  requests.push(request);
  localStorage.setItem(RESET_REQUESTS_KEY, JSON.stringify(requests));

  return request;
}

export function getResetRequestByToken(token: string): PasswordResetRequest | undefined {
  const requests = getAllResetRequests();
  return requests.find((req) => req.token === token);
}

export function validateResetToken(token: string): {
  valid: boolean;
  request?: PasswordResetRequest;
  message: string;
} {
  const request = getResetRequestByToken(token);

  if (!request) {
    return {
      valid: false,
      message: "El enlace de restablecimiento no es válido o ha expirado. Solicita uno nuevo.",
    };
  }

  if (request.status === "USADO") {
    return {
      valid: false,
      message: "El enlace de restablecimiento ya fue utilizado. Solicita uno nuevo.",
    };
  }

  const now = new Date();
  const expiresAt = new Date(request.expiresAt);

  if (now > expiresAt) {
    markAsExpired(token);
    return {
      valid: false,
      message: "El enlace de restablecimiento no es válido o ha expirado. Solicita uno nuevo.",
    };
  }

  if (request.status === "EXPIRADO") {
    return {
      valid: false,
      message: "El enlace de restablecimiento no es válido o ha expirado. Solicita uno nuevo.",
    };
  }

  return {
    valid: true,
    request,
    message: "Token válido",
  };
}

export function markAsUsed(token: string): boolean {
  const requests = getAllResetRequests();
  const request = requests.find((req) => req.token === token);

  if (!request) {
    return false;
  }

  request.status = "USADO";
  request.usedAt = new Date().toISOString();
  localStorage.setItem(RESET_REQUESTS_KEY, JSON.stringify(requests));

  return true;
}

export function markAsExpired(token: string): boolean {
  const requests = getAllResetRequests();
  const request = requests.find((req) => req.token === token);

  if (!request) {
    return false;
  }

  request.status = "EXPIRADO";
  localStorage.setItem(RESET_REQUESTS_KEY, JSON.stringify(requests));

  return true;
}

export function cleanupExpiredRequests(): void {
  const requests = getAllResetRequests();
  const now = new Date();

  const active = requests.filter((req) => {
    if (req.status !== "PENDIENTE") {
      return true;
    }

    const expiresAt = new Date(req.expiresAt);
    return now <= expiresAt;
  });

  localStorage.setItem(RESET_REQUESTS_KEY, JSON.stringify(active));
}

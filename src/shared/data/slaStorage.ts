export type WorkArea =
  | "Comercial"
  | "Master Data"
  | "R&D"
  | "Artes Gráficas"
  | "Commercial Finance"
  | "Sistema Integral"
  | "Cliente";

export type Priority = "Alta" | "Media" | "Baja";

export type SlaStatus = "En plazo" | "Por vencer" | "Vencido" | "Atendido";

export type ProjectSlaRule = {
  id: string;
  projectStatus: string;
  responsibleArea: WorkArea;
  priority: Priority;
  slaHours: number;
  calendarType: "Hábil" | "Corrido";
  isActive: boolean;
};

export type ProjectStatusHistory = {
  id: string;
  projectCode: string;
  stageId?: string;
  fromStatus: string;
  toStatus: string;
  responsibleArea: WorkArea | string;
  changedBy: string;
  changedAt: string;
  comment?: string;
};

export type ProjectSlaTracking = {
  id: string;
  projectCode: string;
  stageId?: string;
  status: string;
  responsibleArea: WorkArea | string;
  assignedAt: string;
  dueAt: string;
  completedAt?: string;
  slaDays: number;
  elapsedDays: number;
  remainingDays: number;
  slaStatus: SlaStatus;
  priority: Priority;
};

const PROJECT_STATUS_HISTORY_KEY = "odiseo_project_status_history";
const PROJECT_SLA_TRACKING_KEY = "odiseo_project_sla_tracking";

export const SLA_RULES: ProjectSlaRule[] = [
  {
    id: "SLA-001",
    projectStatus: "Registrado",
    responsibleArea: "Comercial",
    priority: "Alta",
    slaHours: 8,
    calendarType: "Hábil",
    isActive: true,
  },
  {
    id: "SLA-002",
    projectStatus: "En validación",
    responsibleArea: "R&D",
    priority: "Alta",
    slaHours: 24,
    calendarType: "Hábil",
    isActive: true,
  },
  {
    id: "SLA-003",
    projectStatus: "En validación",
    responsibleArea: "Artes Gráficas",
    priority: "Alta",
    slaHours: 24,
    calendarType: "Hábil",
    isActive: true,
  },
  {
    id: "SLA-004",
    projectStatus: "Observado",
    responsibleArea: "Comercial",
    priority: "Alta",
    slaHours: 24,
    calendarType: "Hábil",
    isActive: true,
  },
  {
    id: "SLA-005",
    projectStatus: "Validado",
    responsibleArea: "Commercial Finance",
    priority: "Alta",
    slaHours: 24,
    calendarType: "Hábil",
    isActive: true,
  },
  {
    id: "SLA-006",
    projectStatus: "Lista para alta",
    responsibleArea: "Master Data",
    priority: "Alta",
    slaHours: 24,
    calendarType: "Hábil",
    isActive: true,
  },
];

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isBusinessDay(date: Date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addBusinessHours(date: Date, hoursToAdd: number) {
  const result = new Date(date);
  let remainingHours = hoursToAdd;
  while (remainingHours > 0) {
    result.setHours(result.getHours() + 1);
    if (isBusinessDay(result)) {
      remainingHours--;
    }
  }
  return result;
}

function diffBusinessDays(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let days = 0;
  const current = new Date(startDate);
  
  // Start counting from the next day
  current.setDate(current.getDate() + 1);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    if (isBusinessDay(current)) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function getProjectStatusHistory(): ProjectStatusHistory[] {
  return safeParseArray<ProjectStatusHistory>(
    localStorage.getItem(PROJECT_STATUS_HISTORY_KEY)
  );
}

export function getProjectSlaTracking(): ProjectSlaTracking[] {
  return safeParseArray<ProjectSlaTracking>(
    localStorage.getItem(PROJECT_SLA_TRACKING_KEY)
  );
}

export function getSlaRule({
  projectStatus,
  responsibleArea,
  priority = "Alta",
}: {
  projectStatus: string;
  responsibleArea: WorkArea;
  priority?: Priority;
}) {
  return SLA_RULES.find(
    (rule) =>
      rule.projectStatus === projectStatus &&
      rule.responsibleArea === responsibleArea &&
      rule.priority === priority &&
      rule.isActive
  );
}

export function registerProjectStatusChange({
  projectCode,
  fromStatus,
  toStatus,
  responsibleArea,
  changedBy,
  comment,
  priority = "Alta",
  stageId,
  slaDays = 0,
}: {
  projectCode: string;
  fromStatus: string;
  toStatus: string;
  responsibleArea: WorkArea | string;
  changedBy: string;
  comment?: string;
  priority?: Priority;
  stageId?: string;
  slaDays?: number;
}) {
  const now = new Date();
  const nowIso = now.toISOString();

  // Mark previous active SLA as completed
  const currentTracking = getProjectSlaTracking();
  const activeSlas = currentTracking.filter(t => t.projectCode === projectCode && !t.completedAt);
  activeSlas.forEach(sla => {
    sla.completedAt = nowIso;
  });

  const history: ProjectStatusHistory = {
    id: `HIS-${crypto.randomUUID()}`,
    projectCode,
    stageId,
    fromStatus,
    toStatus,
    responsibleArea,
    changedBy,
    changedAt: nowIso,
    comment,
  };

  // Convert SLA days to hours roughly for the addBusinessHours function, or just add days
  // Let's implement a simple addBusinessDays
  let dueAt = new Date(now);
  let daysToAdd = slaDays;
  while (daysToAdd > 0) {
    dueAt.setDate(dueAt.getDate() + 1);
    if (isBusinessDay(dueAt)) {
      daysToAdd--;
    }
  }

  const tracking: ProjectSlaTracking = {
    id: `SLA-${crypto.randomUUID()}`,
    projectCode,
    stageId,
    status: toStatus,
    responsibleArea,
    assignedAt: nowIso,
    dueAt: dueAt.toISOString(),
    completedAt: undefined,
    slaDays,
    elapsedDays: 0,
    remainingDays: slaDays,
    slaStatus: "En plazo",
    priority,
  };

  const currentHistory = getProjectStatusHistory();

  localStorage.setItem(
    PROJECT_STATUS_HISTORY_KEY,
    JSON.stringify([history, ...currentHistory])
  );

  if (slaDays > 0) {
    localStorage.setItem(
      PROJECT_SLA_TRACKING_KEY,
      JSON.stringify([tracking, ...currentTracking])
    );
  } else {
    localStorage.setItem(PROJECT_SLA_TRACKING_KEY, JSON.stringify(currentTracking));
  }
}

export function getProjectSlaSummary(projectCode: string) {
  const nowIso = new Date().toISOString();

  return getProjectSlaTracking()
    .filter((item) => item.projectCode === projectCode)
    .map((item) => {
      const completedAt = item.completedAt || nowIso;
      const elapsedDays = diffBusinessDays(item.assignedAt, completedAt);
      const remainingDays = item.slaDays - elapsedDays;

      let slaStatus: SlaStatus = "En plazo";

      if (item.completedAt) {
        slaStatus = "Atendido";
      } else if (remainingDays < 0) {
        slaStatus = "Vencido";
      } else if (remainingDays === 0) {
        slaStatus = "Por vencer";
      }

      return {
        ...item,
        elapsedDays,
        remainingDays,
        slaStatus,
      };
    });
}
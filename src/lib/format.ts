const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("es-US", {
  hour: "numeric",
  minute: "2-digit",
});

const weekdayDateFormatter = new Intl.DateTimeFormat("es-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const enumLabelMap: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  LEAD: "Lead",
  INTAKE: "Ingreso",
  HOLD: "En espera",
  ON_HOLD: "En pausa",
  CLOSED: "Cerrado",
  LOW: "Bajo",
  MODERATE: "Moderado",
  HIGH: "Alto",
  ABA: "ABA",
  MENTAL_HEALTH: "Salud mental",
  CARE_COORDINATION: "Coordinación de cuidado",
  SCHOOL_SUPPORT: "Apoyo escolar",
  THERAPY: "Terapia",
  PSYCHIATRY: "Psiquiatría",
  SKILLS_TRAINING: "Entrenamiento de habilidades",
  REQUESTED: "Solicitada",
  EXPIRING: "Por vencer",
  EXPIRED: "Vencida",
  DENIED: "Denegada",
  UNITS: "Unidades",
  HOURS: "Horas",
  VISITS: "Visitas",
  SCHEDULED: "Programada",
  COMPLETED: "Completada",
  CANCELLED_NO_SHOW: "Ausencia",
  CANCELLED_LATE: "Cancelada tarde",
  DOCUMENTATION_PENDING: "Documentación pendiente",
  DRAFT: "Borrador",
  PENDING_SIGNATURE: "Pendiente de firma",
  SIGNED: "Firmada",
  LOCKED: "Bloqueada",
  READY: "Lista",
  SUBMITTED: "Enviado",
  PAID: "Pagado",
  OPEN: "Abierto",
  RESOLVED: "Resuelto",
  WAIVED: "Exento",
  CURRENT: "Vigente",
  PENDING_REVIEW: "Pendiente de revisión",
  PLANNING: "Planificación",
  PENDING: "Pendiente",
  COMPLETE: "Completo",
  IN_PROGRESS: "En progreso",
  NEEDS_REVIEW: "Requiere revisión",
  NOT_STARTED: "Sin iniciar",
  SENT: "Enviado",
  PARTIAL: "Parcial",
};

export function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Sin fecha";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "Sin programar";
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) return "Sin hora";
  return timeFormatter.format(new Date(value));
}

export function formatWeekdayDate(value: string | Date | null | undefined) {
  if (!value) return "Sin fecha";
  return weekdayDateFormatter.format(new Date(value));
}

export function formatEnumLabel(value: string) {
  if (enumLabelMap[value]) {
    return enumLabelMap[value];
  }

  return value
    .toLowerCase()
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function calculateAge(dateOfBirth: string | Date) {
  const birthDate = new Date(dateOfBirth);
  const today = getNow();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}
import { getNow } from "@/lib/time";

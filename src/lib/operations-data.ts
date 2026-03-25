import type { Prisma } from "@prisma/client";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DataAccessError, assertDemoModeAllowed, isDemoModeEnabled, logQueryFailure } from "@/lib/data-source";
import { getClients } from "@/lib/data";
import type {
  CalendarEventRecord,
  DocumentRecord,
  FormFieldRecord,
  FormPacketRecord,
  FormSectionRecord,
  GroupRecord,
} from "@/lib/domain";
import {
  flattenAuthorizations,
  flattenBilling,
  flattenCompliance,
  flattenProgressNotes,
  flattenSessions,
  getSessionEmployeeName,
} from "@/lib/domain";
import { APP_TIMEZONE, getDateKey, getNow, getWeekDateKeys } from "@/lib/time";
import { demoDocuments, demoFormPackets, demoGroups } from "@/lib/operations-demo-data";

function shouldScopeOperationalData(role?: string | null) {
  return role === "TCM";
}

function toIsoString(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function mapJsonFormFields(value: unknown): FormFieldRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((field, index) => {
    const record = typeof field === "object" && field ? field : {};

    return {
      id:
        typeof (record as { id?: unknown }).id === "string"
          ? (record as { id: string }).id
          : `field-${index + 1}`,
      label:
        typeof (record as { label?: unknown }).label === "string"
          ? (record as { label: string }).label
          : "Field",
      type:
        typeof (record as { type?: unknown }).type === "string"
          ? ((record as { type: FormFieldRecord["type"] }).type ?? "text")
          : "text",
      value:
        typeof (record as { value?: unknown }).value === "string"
          ? (record as { value: string }).value
          : null,
      checked:
        typeof (record as { checked?: unknown }).checked === "boolean"
          ? (record as { checked: boolean }).checked
          : undefined,
      placeholder:
        typeof (record as { placeholder?: unknown }).placeholder === "string"
          ? (record as { placeholder: string }).placeholder
          : undefined,
    };
  });
}

function mapJsonSections(value: Prisma.JsonValue | null): FormSectionRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((section, index) => {
    const record = typeof section === "object" && section ? section : {};

    return {
      id:
        typeof (record as { id?: unknown }).id === "string"
          ? (record as { id: string }).id
          : `section-${index + 1}`,
      title:
        typeof (record as { title?: unknown }).title === "string"
          ? (record as { title: string }).title
          : "Section",
      description:
        typeof (record as { description?: unknown }).description === "string"
          ? (record as { description: string }).description
          : "",
      fields: mapJsonFormFields((record as { fields?: unknown }).fields),
    };
  });
}

async function fetchGroupsFromPrisma() {
  const scope = "groups";
  assertDemoModeAllowed(scope);

  if (isDemoModeEnabled()) {
    return demoGroups;
  }

  if (!process.env.DATABASE_URL) {
    throw new DataAccessError(
      "DATA_SOURCE_NOT_CONFIGURED",
      scope,
      "DATABASE_URL is required when demo mode is disabled.",
    );
  }

  try {
    const session = await getAuthSession();
    if (!shouldScopeOperationalData(session?.role)) {
      const groups = await prisma.group.findMany({
        include: {
          memberships: true,
          sessions: true,
        },
        orderBy: [{ status: "asc" }, { name: "asc" }],
      });

      return groups.map<GroupRecord>((group) => ({
        id: group.id,
        name: group.name,
        track: group.track,
        serviceLine: group.serviceLine,
        status: group.status,
        facilitatorName: group.facilitatorName,
        coFacilitatorName: group.coFacilitatorName,
        location: group.location,
        schedulePattern: group.schedulePattern,
        maxCapacity: group.maxCapacity,
        clinicalFocus: group.clinicalFocus,
        memberships: group.memberships.map((membership) => ({
          id: membership.id,
          clientId: membership.clientId,
          caseId: membership.caseId,
          joinedAt: membership.joinedAt.toISOString(),
          status: membership.status,
          participationGoal: membership.participationGoal,
          attendanceRate: membership.attendanceRate,
        })),
        sessions: group.sessions.map((sessionRecord) => ({
          id: sessionRecord.id,
          scheduledStart: sessionRecord.scheduledStart.toISOString(),
          scheduledEnd: sessionRecord.scheduledEnd.toISOString(),
          facilitatorName: sessionRecord.facilitatorName,
          location: sessionRecord.location,
          status: sessionRecord.status,
          noteCompletionPercent: sessionRecord.noteCompletionPercent,
          attendanceCount: sessionRecord.attendanceCount,
          notesDue: sessionRecord.notesDue,
        })),
      }));
    }

    const clients = await getClients();
    const accessibleClientIds = new Set(clients.map((client) => client.id));
    const groups = await prisma.group.findMany({
      include: {
        memberships: true,
        sessions: true,
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    });

    return groups
      .map<GroupRecord>((group) => {
        const memberships = group.memberships.filter((membership) =>
          accessibleClientIds.has(membership.clientId),
        );

        return {
          id: group.id,
          name: group.name,
          track: group.track,
          serviceLine: group.serviceLine,
          status: group.status,
          facilitatorName: group.facilitatorName,
          coFacilitatorName: group.coFacilitatorName,
          location: group.location,
          schedulePattern: group.schedulePattern,
          maxCapacity: group.maxCapacity,
          clinicalFocus: group.clinicalFocus,
          memberships: memberships.map((membership) => ({
            id: membership.id,
            clientId: membership.clientId,
            caseId: membership.caseId,
            joinedAt: membership.joinedAt.toISOString(),
            status: membership.status,
            participationGoal: membership.participationGoal,
            attendanceRate: membership.attendanceRate,
          })),
          sessions: memberships.length
            ? group.sessions.map((session) => ({
                id: session.id,
                scheduledStart: session.scheduledStart.toISOString(),
                scheduledEnd: session.scheduledEnd.toISOString(),
                facilitatorName: session.facilitatorName,
                location: session.location,
                status: session.status,
                noteCompletionPercent: session.noteCompletionPercent,
                attendanceCount: session.attendanceCount,
                notesDue: session.notesDue,
              }))
            : [],
        };
      })
      .filter((group) => group.memberships.length > 0);
  } catch (error) {
    logQueryFailure(scope, error);
    throw new DataAccessError("PRISMA_QUERY_FAILED", scope, "Unable to load groups.");
  }
}

async function fetchDocumentsFromPrisma() {
  const scope = "documents";
  assertDemoModeAllowed(scope);

  if (isDemoModeEnabled()) {
    return demoDocuments;
  }

  if (!process.env.DATABASE_URL) {
    throw new DataAccessError(
      "DATA_SOURCE_NOT_CONFIGURED",
      scope,
      "DATABASE_URL is required when demo mode is disabled.",
    );
  }

  try {
    const session = await getAuthSession();
    const clients = await getClients();
    const accessibleClientIds = new Set(clients.map((client) => client.id));
    const documents = await prisma.document.findMany({
      orderBy: [{ status: "asc" }, { title: "asc" }],
    });

    if (!shouldScopeOperationalData(session?.role)) {
      return documents.map<DocumentRecord>((document) => ({
        id: document.id,
        clientId: document.clientId,
        caseId: document.caseId,
        groupId: document.groupId,
        formPacketId: document.formPacketId,
        title: document.title,
        category: document.category,
        status: document.status,
        owner: document.owner,
        effectiveDate: toIsoString(document.effectiveDate),
        expiresAt: toIsoString(document.expiresAt),
        source: document.source,
        requiresSignature: document.requiresSignature,
        signedAt: toIsoString(document.signedAt),
        tags: document.tags,
      }));
    }

    return documents
      .filter((document) => {
        if (!document.clientId) {
          return false;
        }

        return accessibleClientIds.has(document.clientId);
      })
      .map<DocumentRecord>((document) => ({
        id: document.id,
        clientId: document.clientId,
        caseId: document.caseId,
        groupId: document.groupId,
        formPacketId: document.formPacketId,
        title: document.title,
        category: document.category,
        status: document.status,
        owner: document.owner,
        effectiveDate: toIsoString(document.effectiveDate),
        expiresAt: toIsoString(document.expiresAt),
        source: document.source,
        requiresSignature: document.requiresSignature,
        signedAt: toIsoString(document.signedAt),
        tags: document.tags,
      }));
  } catch (error) {
    logQueryFailure(scope, error);
    throw new DataAccessError("PRISMA_QUERY_FAILED", scope, "Unable to load documents.");
  }
}

async function fetchFormPacketsFromPrisma() {
  const scope = "form packets";
  assertDemoModeAllowed(scope);

  if (isDemoModeEnabled()) {
    return demoFormPackets;
  }

  if (!process.env.DATABASE_URL) {
    throw new DataAccessError(
      "DATA_SOURCE_NOT_CONFIGURED",
      scope,
      "DATABASE_URL is required when demo mode is disabled.",
    );
  }

  try {
    const session = await getAuthSession();
    const clients = await getClients();
    const accessibleClientIds = new Set(clients.map((client) => client.id));
    const packets = await prisma.formPacket.findMany({
      orderBy: [{ dueDate: "asc" }, { title: "asc" }],
    });

    if (!shouldScopeOperationalData(session?.role)) {
      return packets.map<FormPacketRecord>((packet) => ({
        id: packet.id,
        clientId: packet.clientId,
        caseId: packet.caseId,
        title: packet.title,
        packetType: packet.packetType,
        status: packet.status,
        assignedTo: packet.assignedTo,
        dueDate: packet.dueDate.toISOString(),
        completedAt: toIsoString(packet.completedAt),
        signatureStatus: packet.signatureStatus,
        completionPercent: packet.completionPercent,
        sections: mapJsonSections(packet.sections),
      }));
    }

    return packets
      .filter((packet) => accessibleClientIds.has(packet.clientId))
      .map<FormPacketRecord>((packet) => ({
        id: packet.id,
        clientId: packet.clientId,
        caseId: packet.caseId,
        title: packet.title,
        packetType: packet.packetType,
        status: packet.status,
        assignedTo: packet.assignedTo,
        dueDate: packet.dueDate.toISOString(),
        completedAt: toIsoString(packet.completedAt),
        signatureStatus: packet.signatureStatus,
        completionPercent: packet.completionPercent,
        sections: mapJsonSections(packet.sections),
      }));
  } catch (error) {
    logQueryFailure(scope, error);
    throw new DataAccessError("PRISMA_QUERY_FAILED", scope, "Unable to load form packets.");
  }
}

export async function getGroups() {
  return fetchGroupsFromPrisma();
}

export async function getDocuments() {
  return fetchDocumentsFromPrisma();
}

export async function getFormPackets() {
  return fetchFormPacketsFromPrisma();
}

export async function getCalendarModuleData() {
  const clients = await getClients();
  const groups = await getGroups();
  const forms = await getFormPackets();
  const referenceDate = getNow();
  const weekDateKeys = getWeekDateKeys(referenceDate, APP_TIMEZONE);
  const weekKeySet = new Set(weekDateKeys);

  const sessionEvents = flattenSessions(clients)
    .filter(({ session }) => {
      return weekKeySet.has(getDateKey(session.scheduledStart, APP_TIMEZONE));
    })
    .map<CalendarEventRecord>(({ client, caseRecord, service, session }) => ({
      id: session.id,
      startsAt: session.scheduledStart,
      endsAt: session.scheduledEnd,
      title: `${client.firstName} ${client.lastName}`,
      subtitle: `${service?.serviceCode ?? "UNLINKED"} · ${caseRecord.programName}`,
      eventType: "SESSION",
      status: session.attendanceStatus,
      staffName: getSessionEmployeeName(session),
      durationMinutes:
        (new Date(session.scheduledEnd).getTime() -
          new Date(session.scheduledStart).getTime()) /
        60000,
      href: `/cases/${caseRecord.id}`,
    }));

  const groupEvents = groups
    .flatMap((group) =>
      group.sessions.map<CalendarEventRecord>((session) => ({
        id: session.id,
        startsAt: session.scheduledStart,
        endsAt: session.scheduledEnd,
        title: group.name,
        subtitle: `${group.facilitatorName} · ${group.location}`,
        eventType: "GROUP",
        status: session.status,
        staffName: session.facilitatorName,
        durationMinutes:
          (new Date(session.scheduledEnd).getTime() -
            new Date(session.scheduledStart).getTime()) /
          60000,
        href: "/groups",
      })),
    )
    .filter((event) => {
      return weekKeySet.has(getDateKey(event.startsAt, APP_TIMEZONE));
    });

  const formEvents = forms
    .filter((form) => {
      return weekKeySet.has(getDateKey(form.dueDate, APP_TIMEZONE));
    })
    .map<CalendarEventRecord>((form) => ({
      id: form.id,
      startsAt: form.dueDate,
      title: form.title,
      subtitle: `${form.packetType} packet due`,
      eventType: "FORM",
      status: form.status,
      staffName: form.assignedTo,
      href: "/forms",
    }));

  const authorizationEvents = flattenAuthorizations(clients)
    .filter(({ authorization }) => {
      return weekKeySet.has(getDateKey(authorization.endDate, APP_TIMEZONE));
    })
    .map<CalendarEventRecord>(({ client, caseRecord, service, authorization }) => ({
      id: authorization.id,
      startsAt: authorization.endDate,
      title: `${client.firstName} ${client.lastName}`,
      subtitle: `${service?.serviceCode ?? "UNLINKED"} authorization ends`,
      eventType: "AUTHORIZATION",
      status: authorization.status,
      staffName: caseRecord.clinicalLead,
      href: `/cases/${caseRecord.id}`,
    }));

  const allEvents = [...sessionEvents, ...groupEvents, ...formEvents, ...authorizationEvents].sort(
    (left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  );

  const days = weekDateKeys.map((dayKey) => {
    const events = allEvents.filter(
      (event) => getDateKey(event.startsAt, APP_TIMEZONE) === dayKey,
    );

    return {
      dateKey: dayKey,
      events,
    };
  });

  return {
    referenceDate,
    weekStart: weekDateKeys[0],
    weekEnd: weekDateKeys[weekDateKeys.length - 1],
    allEvents,
    days,
    totals: {
      sessions: sessionEvents.length,
      groups: groupEvents.length,
      forms: formEvents.length,
      authorizations: authorizationEvents.length,
    },
  };
}

export async function getProgressNotesModuleData() {
  const clients = await getClients();
  const referenceDate = getNow();
  const notes = flattenProgressNotes(clients)
    .map(({ client, caseRecord, service, authorization, employee, session, progressNote }) => ({
      client,
      caseRecord,
      service,
      authorization,
      employee,
      session,
      progressNote,
      complianceCount: progressNote.complianceItems.filter((item) => item.status === "OPEN").length,
      billingIssues: progressNote.billingRecords.filter(
        (record) => record.status === "HOLD" || record.status === "DENIED",
      ).length,
      isOverdue:
        progressNote.status !== "SIGNED" &&
        progressNote.status !== "LOCKED" &&
        session.documentationDueAt !== null &&
        new Date(session.documentationDueAt ?? session.scheduledEnd) <
          referenceDate,
    }))
    .sort((left, right) => {
      const leftDue = new Date(left.session.documentationDueAt ?? left.session.scheduledEnd).getTime();
      const rightDue = new Date(right.session.documentationDueAt ?? right.session.scheduledEnd).getTime();
      return leftDue - rightDue;
    });

  const billing = flattenBilling(clients);
  const compliance = flattenCompliance(clients);

  return {
    notes,
    spotlight: notes[0] ?? null,
    metrics: {
      total: notes.length,
      draft: notes.filter(({ progressNote }) => progressNote.status === "DRAFT").length,
      pendingSignature: notes.filter(
        ({ progressNote }) => progressNote.status === "PENDING_SIGNATURE",
      ).length,
      signed: notes.filter(
        ({ progressNote }) =>
          progressNote.status === "SIGNED" || progressNote.status === "LOCKED",
      ).length,
      overdue: notes.filter((note) => note.isOverdue).length,
      billingBlocks: billing.filter(
        ({ billingRecord }) =>
          billingRecord.status === "HOLD" || billingRecord.status === "DENIED",
      ).length,
      openCompliance: compliance.filter(
        ({ complianceItem }) => complianceItem.status === "OPEN",
      ).length,
    },
  };
}

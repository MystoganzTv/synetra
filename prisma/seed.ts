import {
  PrismaClient,
  type Prisma,
  type EmployeeStatus,
  type ServiceDiscipline,
} from "@prisma/client";

import { defaultAuthProfiles, hashPassword } from "../src/lib/auth-config";
import { demoClients, demoStandaloneSessions } from "../src/lib/demo-data";
import {
  demoDocuments,
  demoFormPackets,
  demoGroups,
} from "../src/lib/operations-demo-data";
import { getSynchronizedSessionBillingStatus } from "../src/lib/session-validation";

const prisma = new PrismaClient();

function asDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitName(displayName: string) {
  const parts = displayName.trim().split(/\s+/);
  const lastName = parts.pop() ?? displayName;
  const firstName = parts.join(" ") || lastName;
  return { firstName, lastName };
}

async function main() {
  const employeeDirectory = new Map<
    string,
    {
      id: string;
      firstName: string;
      lastName: string;
      displayName: string;
      title: string;
      credentials: string | null;
      discipline: ServiceDiscipline | null;
      email: string;
      timezone: string;
      status: EmployeeStatus;
      isBillable: boolean;
    }
  >();

  const registerEmployee = (
    clinicianName?: string | null,
    clinicianTitle?: string | null,
    discipline?: ServiceDiscipline | null,
  ) => {
    if (!clinicianName?.trim()) {
      return null;
    }

    const key = `${clinicianName}::${clinicianTitle ?? ""}`;
    const existing = employeeDirectory.get(key);

    if (existing) {
      return existing;
    }

    const { firstName, lastName } = splitName(clinicianName);
    const employee = {
      id: `employee-${slugify(clinicianName)}`,
      firstName,
      lastName,
      displayName: clinicianName,
      title: clinicianTitle ?? "Clinician",
      credentials: null,
      discipline: discipline ?? null,
      email:
        clinicianName === "Enrique Padron"
          ? "enrique@synetra.app"
          : `${slugify(clinicianName)}@synetra.demo`,
      timezone: "America/New_York",
      status: "ACTIVE" as const,
      isBillable: true,
    };

    employeeDirectory.set(key, employee);
    return employee;
  };

  registerEmployee("Enrique Padron", "TCM", "CARE_COORDINATION");

  const cases = demoClients.flatMap((client) =>
    client.cases.map((caseRecord) => ({
      id: caseRecord.id,
      caseNumber: caseRecord.caseNumber,
      clientId: client.id,
      caseType: caseRecord.caseType,
      programName: caseRecord.programName,
      payerName: caseRecord.payerName,
      clinicalLead: caseRecord.clinicalLead,
      renderingProvider: caseRecord.renderingProvider ?? null,
      location: caseRecord.location,
      status: caseRecord.status,
      startDate: new Date(caseRecord.startDate),
      endDate: asDate(caseRecord.endDate),
      acuityLevel: caseRecord.acuityLevel,
      carePlanSummary: caseRecord.carePlanSummary ?? null,
    })),
  );

  const services = demoClients.flatMap((client) =>
    client.cases.flatMap((caseRecord) =>
      caseRecord.services.map((service) => ({
        id: service.id,
        caseId: caseRecord.id,
        serviceCode: service.serviceCode,
        title: service.title,
        discipline: service.discipline,
        unitType: service.unitType,
        defaultUnitsPerSession: service.defaultUnitsPerSession,
        defaultRateCents: service.defaultRateCents,
        frequency: service.frequency,
        status: service.status,
        isPrimary: service.isPrimary,
      })),
    ),
  );

  const authorizations = demoClients.flatMap((client) =>
    client.cases.flatMap((caseRecord) =>
      caseRecord.services.flatMap((service) =>
        service.authorizations.map((authorization) => ({
          id: authorization.id,
          serviceId: service.id,
          authorizationNumber: authorization.authorizationNumber,
          payerName: authorization.payerName,
          approvedUnits: authorization.approvedUnits,
          usedUnits: authorization.usedUnits,
          remainingUnits: authorization.remainingUnits,
          unitType: authorization.unitType,
          startDate: new Date(authorization.startDate),
          endDate: new Date(authorization.endDate),
          status: authorization.status,
          utilizationThreshold: authorization.utilizationThreshold,
          notes: authorization.notes ?? null,
        })),
      ),
    ),
  );

  const authorizedSessions = demoClients.flatMap((client) =>
    client.cases.flatMap((caseRecord) =>
      caseRecord.services.flatMap((service) =>
        service.authorizations.flatMap((authorization) =>
          authorization.sessions.map((session) => {
            const employee =
              registerEmployee(
                session.clinicianName,
                session.clinicianTitle,
                service.discipline,
              ) ?? null;

            const billingStatus = getSynchronizedSessionBillingStatus({
              client,
              caseRecord,
              service,
              authorization,
              employee,
              session: {
                ...session,
                clientId: client.id,
                caseId: caseRecord.id,
                serviceId: service.id,
                authorizationId: authorization.id,
                employeeId: employee?.id ?? null,
                employee,
              },
            });

            return {
              id: session.id,
              clientId: client.id,
              caseId: caseRecord.id,
              serviceId: service.id,
              authorizationId: authorization.id,
              employeeId: employee?.id ?? null,
              scheduledStart: new Date(session.scheduledStart),
              scheduledEnd: new Date(session.scheduledEnd),
              location: session.location,
              sessionType: session.sessionType,
              attendanceStatus: session.attendanceStatus,
              unitsRendered: session.unitsRendered,
              noteStatus: session.noteStatus,
              billingStatus,
              documentationDueAt: asDate(session.documentationDueAt),
            };
          }),
        ),
      ),
    ),
  );

  const standaloneSessions = demoStandaloneSessions.map((session) => {
      const client = demoClients.find((candidate) => candidate.id === session.clientId)!;
      const caseRecord = client.cases.find((candidate) => candidate.id === session.caseId)!;
      const service = demoClients
        .flatMap((client) => client.cases)
        .flatMap((caseRecord) => caseRecord.services)
        .find((candidate) => candidate.id === session.serviceId);
      const authorization =
        service?.authorizations.find(
          (candidate) => candidate.id === session.authorizationId,
        ) ?? null;
      const employee =
        registerEmployee(
          session.clinicianName,
          session.clinicianTitle,
          service?.discipline ?? null,
        ) ?? null;
      const billingStatus = getSynchronizedSessionBillingStatus({
        client,
        caseRecord,
        service: service ?? null,
        authorization,
        employee,
        session: {
          ...session,
          employeeId: employee?.id ?? null,
          employee,
        },
      });

      return {
        id: session.id,
        clientId: session.clientId!,
        caseId: session.caseId!,
        serviceId: session.serviceId!,
        authorizationId: session.authorizationId ?? null,
        employeeId: employee?.id ?? null,
        scheduledStart: new Date(session.scheduledStart),
        scheduledEnd: new Date(session.scheduledEnd),
        location: session.location,
        sessionType: session.sessionType,
        attendanceStatus: session.attendanceStatus,
        unitsRendered: session.unitsRendered,
        noteStatus: session.noteStatus,
        billingStatus,
        documentationDueAt: asDate(session.documentationDueAt),
      };
    });

  const sessions: Prisma.SessionCreateManyInput[] = [
    ...authorizedSessions,
    ...standaloneSessions,
  ];

  const notes = demoClients.flatMap((client) =>
    client.cases.flatMap((caseRecord) =>
      caseRecord.services.flatMap((service) =>
        service.authorizations.flatMap((authorization) =>
          authorization.sessions.flatMap((session) =>
            session.progressNotes.map((note) => ({
              id: note.id,
              sessionId: session.id,
              authorName: note.authorName,
              status: note.status,
              submittedAt: asDate(note.submittedAt),
              signedAt: asDate(note.signedAt),
              subjective: note.subjective,
              objective: note.objective,
              assessment: note.assessment,
              plan: note.plan,
              incidentReported: note.incidentReported,
            })),
          ),
        ),
      ),
    ),
  );

  const billingRecords = demoClients.flatMap((client) =>
    client.cases.flatMap((caseRecord) =>
      caseRecord.services.flatMap((service) =>
        service.authorizations.flatMap((authorization) =>
          authorization.sessions.flatMap((session) =>
            session.progressNotes.flatMap((note) =>
              note.billingRecords.map((record) => ({
                id: record.id,
                progressNoteId: note.id,
                claimNumber: record.claimNumber,
                cptCode: record.cptCode,
                unitsBilled: record.unitsBilled,
                amountCents: record.amountCents,
                status: record.status,
                submittedAt: asDate(record.submittedAt),
                paidAt: asDate(record.paidAt),
                denialReason: record.denialReason ?? null,
              })),
            ),
          ),
        ),
      ),
    ),
  );

  const complianceItems = demoClients.flatMap((client) =>
    client.cases.flatMap((caseRecord) =>
      caseRecord.services.flatMap((service) =>
        service.authorizations.flatMap((authorization) =>
          authorization.sessions.flatMap((session) =>
            session.progressNotes.flatMap((note) =>
              note.complianceItems.map((item) => ({
                id: item.id,
                progressNoteId: note.id,
                title: item.title,
                description: item.description,
                severity: item.severity,
                status: item.status,
                dueDate: asDate(item.dueDate),
                resolvedAt: asDate(item.resolvedAt),
                owner: item.owner,
              })),
            ),
          ),
        ),
      ),
    ),
  );

  const groups = demoGroups.map((group) => ({
    id: group.id,
    name: group.name,
    track: group.track,
    serviceLine: group.serviceLine,
    status: group.status,
    facilitatorName: group.facilitatorName,
    coFacilitatorName: group.coFacilitatorName ?? null,
    location: group.location,
    schedulePattern: group.schedulePattern,
    maxCapacity: group.maxCapacity,
    clinicalFocus: group.clinicalFocus,
  }));

  const groupMemberships = demoGroups.flatMap((group) =>
    group.memberships.map((membership) => ({
      id: membership.id,
      groupId: group.id,
      clientId: membership.clientId,
      caseId: membership.caseId ?? null,
      joinedAt: new Date(membership.joinedAt),
      status: membership.status,
      participationGoal: membership.participationGoal,
      attendanceRate: membership.attendanceRate,
    })),
  );

  const groupSessions = demoGroups.flatMap((group) =>
    group.sessions.map((session) => ({
      id: session.id,
      groupId: group.id,
      scheduledStart: new Date(session.scheduledStart),
      scheduledEnd: new Date(session.scheduledEnd),
      facilitatorName: session.facilitatorName,
      location: session.location,
      status: session.status,
      noteCompletionPercent: session.noteCompletionPercent,
      attendanceCount: session.attendanceCount,
      notesDue: session.notesDue,
    })),
  );

  const formPackets = demoFormPackets.map((packet) => ({
    id: packet.id,
    clientId: packet.clientId,
    caseId: packet.caseId ?? null,
    title: packet.title,
    packetType: packet.packetType,
    status: packet.status,
    assignedTo: packet.assignedTo,
    dueDate: new Date(packet.dueDate),
    completedAt: asDate(packet.completedAt),
    signatureStatus: packet.signatureStatus,
    completionPercent: packet.completionPercent,
    sections: packet.sections as unknown as Prisma.InputJsonValue,
  }));

  const documents = demoDocuments.map((document) => ({
    id: document.id,
    clientId: document.clientId ?? null,
    caseId: document.caseId ?? null,
    groupId: document.groupId ?? null,
    formPacketId: document.formPacketId ?? null,
    title: document.title,
    category: document.category,
    status: document.status,
    owner: document.owner,
    effectiveDate: asDate(document.effectiveDate),
    expiresAt: asDate(document.expiresAt),
    source: document.source,
    requiresSignature: document.requiresSignature,
    signedAt: asDate(document.signedAt),
    tags: document.tags,
  }));

  const employees = Array.from(employeeDirectory.values());

  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.document.deleteMany(),
    prisma.formPacket.deleteMany(),
    prisma.groupSession.deleteMany(),
    prisma.groupMembership.deleteMany(),
    prisma.group.deleteMany(),
    prisma.complianceItem.deleteMany(),
    prisma.billingRecord.deleteMany(),
    prisma.progressNote.deleteMany(),
    prisma.session.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.authorization.deleteMany(),
    prisma.service.deleteMany(),
    prisma.case.deleteMany(),
    prisma.client.deleteMany(),
  ]);

  await prisma.client.createMany({
    data: [
      ...demoClients.map((client) => ({
        id: client.id,
        externalId: client.externalId,
        ownerEmail: null,
        firstName: client.firstName,
        lastName: client.lastName,
        preferredName: client.preferredName ?? null,
        dateOfBirth: new Date(client.dateOfBirth),
        email: client.email ?? null,
        phone: client.phone ?? null,
        city: client.city ?? null,
        state: client.state ?? null,
        timezone: client.timezone,
        status: client.status,
        riskLevel: client.riskLevel,
        primaryDiagnosisCode: client.primaryDiagnosisCode ?? null,
        payerSegment: client.payerSegment ?? null,
        referralSource: client.referralSource ?? null,
      })),
    ],
  });

  await prisma.user.createMany({
    data: defaultAuthProfiles.map((user) => ({
      email: user.email.toLowerCase(),
      name: user.name,
      passwordHash: hashPassword(user.password),
      role: user.role,
      status: "ACTIVE",
    })),
  });

  await prisma.employee.createMany({ data: employees });
  await prisma.case.createMany({ data: cases });
  await prisma.service.createMany({ data: services });
  await prisma.authorization.createMany({ data: authorizations });
  await prisma.session.createMany({ data: sessions });
  await prisma.progressNote.createMany({ data: notes });
  await prisma.billingRecord.createMany({ data: billingRecords });
  await prisma.complianceItem.createMany({ data: complianceItems });
  await prisma.group.createMany({ data: groups });
  await prisma.groupMembership.createMany({ data: groupMemberships });
  await prisma.groupSession.createMany({ data: groupSessions });
  await prisma.formPacket.createMany({ data: formPackets });
  await prisma.document.createMany({ data: documents });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('LEAD', 'INTAKE', 'ACTIVE', 'HOLD', 'DISCHARGED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('INTAKE', 'ACTIVE', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('ABA', 'MENTAL_HEALTH', 'CARE_COORDINATION', 'SCHOOL_SUPPORT');

-- CreateEnum
CREATE TYPE "ServiceDiscipline" AS ENUM ('ABA', 'THERAPY', 'PSYCHIATRY', 'CARE_COORDINATION', 'SKILLS_TRAINING');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AuthorizationStatus" AS ENUM ('REQUESTED', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'DENIED');

-- CreateEnum
CREATE TYPE "AuthorizationUnitType" AS ENUM ('UNITS', 'HOURS', 'VISITS');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED_NO_SHOW', 'CANCELLED_LATE', 'DOCUMENTATION_PENDING');

-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'LOCKED');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('READY', 'SUBMITTED', 'PAID', 'DENIED', 'HOLD');

-- CreateEnum
CREATE TYPE "ComplianceSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('OPEN', 'RESOLVED', 'WAIVED');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "GroupMembershipStatus" AS ENUM ('ACTIVE', 'PENDING', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GroupSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('ASSESSMENT', 'PLAN', 'CONSENT', 'ID', 'AUTHORIZATION', 'CLINICAL', 'LEGAL');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('CURRENT', 'EXPIRING', 'EXPIRED', 'PENDING_REVIEW', 'DRAFT');

-- CreateEnum
CREATE TYPE "FormPacketType" AS ENUM ('INTAKE', 'CONSENT', 'ROI', 'FINANCIAL', 'SAFETY_PLAN');

-- CreateEnum
CREATE TYPE "FormPacketStatus" AS ENUM ('IN_PROGRESS', 'PENDING_SIGNATURE', 'COMPLETED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('NOT_STARTED', 'SENT', 'PARTIAL', 'COMPLETE');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "preferredName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "primaryDiagnosisCode" TEXT,
    "payerSegment" TEXT,
    "referralSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "credentials" TEXT,
    "discipline" "ServiceDiscipline",
    "email" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "caseType" "CaseType" NOT NULL,
    "programName" TEXT NOT NULL,
    "payerName" TEXT NOT NULL,
    "clinicalLead" TEXT NOT NULL,
    "renderingProvider" TEXT,
    "location" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "acuityLevel" TEXT NOT NULL,
    "carePlanSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "discipline" "ServiceDiscipline" NOT NULL,
    "unitType" "AuthorizationUnitType" NOT NULL,
    "defaultUnitsPerSession" INTEGER NOT NULL,
    "defaultRateCents" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authorization" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "authorizationNumber" TEXT NOT NULL,
    "payerName" TEXT NOT NULL,
    "approvedUnits" INTEGER NOT NULL,
    "usedUnits" INTEGER NOT NULL,
    "remainingUnits" INTEGER NOT NULL,
    "unitType" "AuthorizationUnitType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AuthorizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "utilizationThreshold" INTEGER NOT NULL DEFAULT 85,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "authorizationId" TEXT,
    "employeeId" TEXT,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "attendanceStatus" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "unitsRendered" INTEGER NOT NULL,
    "noteStatus" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
    "billingStatus" "BillingStatus" NOT NULL DEFAULT 'READY',
    "documentationDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressNote" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "status" "NoteStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "subjective" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "incidentReported" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingRecord" (
    "id" TEXT NOT NULL,
    "progressNoteId" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "cptCode" TEXT NOT NULL,
    "unitsBilled" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "BillingStatus" NOT NULL DEFAULT 'READY',
    "submittedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "denialReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceItem" (
    "id" TEXT NOT NULL,
    "progressNoteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "ComplianceSeverity" NOT NULL DEFAULT 'LOW',
    "status" "ComplianceStatus" NOT NULL DEFAULT 'OPEN',
    "dueDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "serviceLine" TEXT NOT NULL,
    "status" "GroupStatus" NOT NULL DEFAULT 'PLANNING',
    "facilitatorName" TEXT NOT NULL,
    "coFacilitatorName" TEXT,
    "location" TEXT NOT NULL,
    "schedulePattern" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "clinicalFocus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "caseId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "status" "GroupMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "participationGoal" TEXT NOT NULL,
    "attendanceRate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupSession" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "facilitatorName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "GroupSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "noteCompletionPercent" INTEGER NOT NULL,
    "attendanceCount" INTEGER NOT NULL,
    "notesDue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormPacket" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "caseId" TEXT,
    "title" TEXT NOT NULL,
    "packetType" "FormPacketType" NOT NULL,
    "status" "FormPacketStatus" NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "signatureStatus" "SignatureStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completionPercent" INTEGER NOT NULL,
    "sections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormPacket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "caseId" TEXT,
    "groupId" TEXT,
    "formPacketId" TEXT,
    "title" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "owner" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "source" TEXT NOT NULL,
    "requiresSignature" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_externalId_key" ON "Client"("externalId");

-- CreateIndex
CREATE INDEX "Client_lastName_firstName_idx" ON "Client"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Client_status_idx" ON "Client"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_lastName_firstName_idx" ON "Employee"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Employee_status_idx" ON "Employee"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_clientId_status_idx" ON "Case"("clientId", "status");

-- CreateIndex
CREATE INDEX "Case_payerName_idx" ON "Case"("payerName");

-- CreateIndex
CREATE INDEX "Service_caseId_status_idx" ON "Service"("caseId", "status");

-- CreateIndex
CREATE INDEX "Service_serviceCode_idx" ON "Service"("serviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "Authorization_authorizationNumber_key" ON "Authorization"("authorizationNumber");

-- CreateIndex
CREATE INDEX "Authorization_serviceId_status_idx" ON "Authorization"("serviceId", "status");

-- CreateIndex
CREATE INDEX "Authorization_endDate_idx" ON "Authorization"("endDate");

-- CreateIndex
CREATE INDEX "Session_caseId_scheduledStart_idx" ON "Session"("caseId", "scheduledStart");

-- CreateIndex
CREATE INDEX "Session_clientId_idx" ON "Session"("clientId");

-- CreateIndex
CREATE INDEX "Session_authorizationId_idx" ON "Session"("authorizationId");

-- CreateIndex
CREATE INDEX "Session_employeeId_idx" ON "Session"("employeeId");

-- CreateIndex
CREATE INDEX "ProgressNote_sessionId_status_idx" ON "ProgressNote"("sessionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BillingRecord_claimNumber_key" ON "BillingRecord"("claimNumber");

-- CreateIndex
CREATE INDEX "BillingRecord_status_submittedAt_idx" ON "BillingRecord"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "ComplianceItem_status_severity_idx" ON "ComplianceItem"("status", "severity");

-- CreateIndex
CREATE INDEX "ComplianceItem_dueDate_idx" ON "ComplianceItem"("dueDate");

-- CreateIndex
CREATE INDEX "Group_status_idx" ON "Group"("status");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_status_idx" ON "GroupMembership"("groupId", "status");

-- CreateIndex
CREATE INDEX "GroupMembership_clientId_idx" ON "GroupMembership"("clientId");

-- CreateIndex
CREATE INDEX "GroupSession_groupId_scheduledStart_idx" ON "GroupSession"("groupId", "scheduledStart");

-- CreateIndex
CREATE INDEX "FormPacket_clientId_status_idx" ON "FormPacket"("clientId", "status");

-- CreateIndex
CREATE INDEX "FormPacket_dueDate_idx" ON "FormPacket"("dueDate");

-- CreateIndex
CREATE INDEX "Document_status_expiresAt_idx" ON "Document"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "Document"("category");

-- CreateIndex
CREATE INDEX "Document_clientId_idx" ON "Document"("clientId");

-- CreateIndex
CREATE INDEX "Document_caseId_idx" ON "Document"("caseId");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "Authorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNote" ADD CONSTRAINT "ProgressNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingRecord" ADD CONSTRAINT "BillingRecord_progressNoteId_fkey" FOREIGN KEY ("progressNoteId") REFERENCES "ProgressNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceItem" ADD CONSTRAINT "ComplianceItem_progressNoteId_fkey" FOREIGN KEY ("progressNoteId") REFERENCES "ProgressNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSession" ADD CONSTRAINT "GroupSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormPacket" ADD CONSTRAINT "FormPacket_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormPacket" ADD CONSTRAINT "FormPacket_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_formPacketId_fkey" FOREIGN KEY ("formPacketId") REFERENCES "FormPacket"("id") ON DELETE SET NULL ON UPDATE CASCADE;


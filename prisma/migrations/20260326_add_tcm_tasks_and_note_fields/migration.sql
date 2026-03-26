-- CreateEnum
CREATE TYPE "TcmTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "TcmTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TcmTaskType" AS ENUM ('GENERAL', 'FOLLOW_UP', 'OUTREACH', 'DOCUMENT_REQUEST', 'AUTHORIZATION', 'CARE_PLAN');

-- AlterTable
ALTER TABLE "ProgressNote"
ADD COLUMN "contactType" TEXT,
ADD COLUMN "participants" TEXT,
ADD COLUMN "barriers" TEXT,
ADD COLUMN "interventions" TEXT,
ADD COLUMN "nextStep" TEXT,
ADD COLUMN "followUpAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TcmTask" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "caseId" TEXT,
    "ownerEmail" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "TcmTaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TcmTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "taskType" "TcmTaskType" NOT NULL DEFAULT 'GENERAL',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TcmTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TcmTask_ownerEmail_status_dueAt_idx" ON "TcmTask"("ownerEmail", "status", "dueAt");

-- CreateIndex
CREATE INDEX "TcmTask_clientId_dueAt_idx" ON "TcmTask"("clientId", "dueAt");

-- CreateIndex
CREATE INDEX "TcmTask_caseId_idx" ON "TcmTask"("caseId");

-- AddForeignKey
ALTER TABLE "TcmTask" ADD CONSTRAINT "TcmTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TcmTask" ADD CONSTRAINT "TcmTask_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

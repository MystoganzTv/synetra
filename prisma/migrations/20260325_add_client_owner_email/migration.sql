ALTER TABLE "Client"
ADD COLUMN "ownerEmail" TEXT;

CREATE INDEX "Client_ownerEmail_idx" ON "Client"("ownerEmail");

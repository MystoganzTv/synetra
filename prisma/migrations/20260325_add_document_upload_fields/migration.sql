ALTER TABLE "Document"
ADD COLUMN "fileName" TEXT,
ADD COLUMN "fileMimeType" TEXT,
ADD COLUMN "fileSizeBytes" INTEGER,
ADD COLUMN "fileData" BYTEA;

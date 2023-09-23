/*
  Warnings:

  - Added the required column `customMessage` to the `InvoiceStatus` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvoiceStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoicableType" TEXT NOT NULL,
    "invoicableId" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "version" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "customMessage" TEXT NOT NULL
);
INSERT INTO "new_InvoiceStatus" ("createdAt", "id", "invoicableId", "invoicableType", "paid", "updatedAt", "version") SELECT "createdAt", "id", "invoicableId", "invoicableType", "paid", "updatedAt", "version" FROM "InvoiceStatus";
DROP TABLE "InvoiceStatus";
ALTER TABLE "new_InvoiceStatus" RENAME TO "InvoiceStatus";
CREATE INDEX "invoicableType_invoicableId_idx" ON "InvoiceStatus"("invoicableType", "invoicableId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

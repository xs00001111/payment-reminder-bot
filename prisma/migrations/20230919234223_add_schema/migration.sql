/*
  Warnings:

  - You are about to alter the column `invoicableId` on the `InvoiceStatus` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

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
    "paid" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_InvoiceStatus" ("createdAt", "id", "invoicableId", "invoicableType", "paid", "updatedAt", "version") SELECT "createdAt", "id", "invoicableId", "invoicableType", "paid", "updatedAt", "version" FROM "InvoiceStatus";
DROP TABLE "InvoiceStatus";
ALTER TABLE "new_InvoiceStatus" RENAME TO "InvoiceStatus";
CREATE INDEX "invoicableType_invoicableId_idx" ON "InvoiceStatus"("invoicableType", "invoicableId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

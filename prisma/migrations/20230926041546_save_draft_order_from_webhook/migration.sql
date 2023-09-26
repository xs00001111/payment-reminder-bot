-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DraftOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DraftOrder" ("createdAt", "id", "orderId") SELECT "createdAt", "id", "orderId" FROM "DraftOrder";
DROP TABLE "DraftOrder";
ALTER TABLE "new_DraftOrder" RENAME TO "DraftOrder";
CREATE UNIQUE INDEX "DraftOrder_orderId_key" ON "DraftOrder"("orderId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

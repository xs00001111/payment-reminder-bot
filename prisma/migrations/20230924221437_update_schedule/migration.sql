/*
  Warnings:

  - Added the required column `shop` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "object_type" TEXT NOT NULL DEFAULT 'DRAFT_ORDER',
    "shop" TEXT NOT NULL,
    "recurring_days" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Schedule" ("created_at", "id", "object_type", "recurring_days", "updated_at") SELECT "created_at", "id", "object_type", "recurring_days", "updated_at" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
CREATE UNIQUE INDEX "Schedule_recurring_days_object_type_shop_key" ON "Schedule"("recurring_days", "object_type", "shop");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

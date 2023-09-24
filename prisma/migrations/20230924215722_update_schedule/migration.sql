/*
  Warnings:

  - You are about to drop the column `shop` on the `Session` table. All the data in the column will be lost.
  - Added the required column `shop` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT
);
INSERT INTO "new_Session" ("accessToken", "expires", "id", "isOnline", "scope", "state", "userId") SELECT "accessToken", "expires", "id", "isOnline", "scope", "state", "userId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE TABLE "new_Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "object_type" TEXT NOT NULL DEFAULT 'DRAFT_ORDER',
    "recurring_days" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Schedule" ("created_at", "id", "object_type", "recurring_days", "updated_at") SELECT "created_at", "id", "object_type", "recurring_days", "updated_at" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
CREATE UNIQUE INDEX "Schedule_shop_recurring_days_object_type_key" ON "Schedule"("shop", "recurring_days", "object_type");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

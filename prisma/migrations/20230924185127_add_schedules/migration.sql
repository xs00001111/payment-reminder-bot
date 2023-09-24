-- CreateTable
CREATE TABLE "ScheduledInvoiceSentLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "schedule_id" INTEGER NOT NULL,
    "object_id" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ScheduledInvoiceSentLog_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "Schedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

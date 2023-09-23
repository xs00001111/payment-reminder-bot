-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "paymentStatusId" INTEGER NOT NULL,
    "paymentTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "draftOrderId" INTEGER,
    "orderId" INTEGER,
    "pendingInvoiceId" INTEGER,
    CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_draftOrderId_fkey" FOREIGN KEY ("draftOrderId") REFERENCES "DraftOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_pendingInvoiceId_fkey" FOREIGN KEY ("pendingInvoiceId") REFERENCES "PendingInvoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "customerId", "draftOrderId", "id", "paymentStatusId", "paymentTime", "pendingInvoiceId", "updatedAt") SELECT "amount", "createdAt", "customerId", "draftOrderId", "id", "paymentStatusId", "paymentTime", "pendingInvoiceId", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_draftOrderId_key" ON "Payment"("draftOrderId");
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
CREATE UNIQUE INDEX "Payment_pendingInvoiceId_key" ON "Payment"("pendingInvoiceId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

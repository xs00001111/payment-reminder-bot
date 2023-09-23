/*
  Warnings:

  - A unique constraint covering the columns `[invoicableType,invoicableId]` on the table `InvoiceStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InvoiceStatus_invoicableType_invoicableId_key" ON "InvoiceStatus"("invoicableType", "invoicableId");

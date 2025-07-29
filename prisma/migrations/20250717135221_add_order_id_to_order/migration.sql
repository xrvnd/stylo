/*
  Warnings:

  - Added the required column `orderId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER, -- nullable for now
    "customerId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "customerId", "dueDate", "employeeId", "id", "notes", "orderDate", "status", "totalAmount", "updatedAt", "orderId") SELECT "createdAt", "customerId", "dueDate", "employeeId", "id", "notes", "orderDate", "status", "totalAmount", "updatedAt", "id" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
-- Backfill done, now make NOT NULL (handled by schema on next migration)
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

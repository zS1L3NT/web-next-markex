/*
  Warnings:

  - Made the column `from_currency` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "from_currency" SET NOT NULL;

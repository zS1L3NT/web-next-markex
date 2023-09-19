/*
  Warnings:

  - You are about to drop the column `currency_pair` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "currency_pair";
ALTER TABLE "Transaction" ADD COLUMN     "instrument" STRING;

-- CreateTable
CREATE TABLE "Asset" (
    "user_id" STRING NOT NULL,
    "instrument" STRING NOT NULL,
    "quantity" FLOAT8 NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_user_id_instrument_key" ON "Asset"("user_id", "instrument");

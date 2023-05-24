/*
  Warnings:

  - You are about to drop the column `from_currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `to_currency` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `currency_pair` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('buy', 'sell');

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "from_currency";
ALTER TABLE "Transaction" DROP COLUMN "to_currency";
ALTER TABLE "Transaction" ADD COLUMN     "currency_pair" STRING NOT NULL;
ALTER TABLE "Transaction" ADD COLUMN     "type" "TransactionType" NOT NULL;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" STRING NOT NULL,
    "from_currency" STRING,
    "to_currency" STRING NOT NULL,
    "amount" FLOAT8 NOT NULL,
    "price" FLOAT8 NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "user_id" STRING NOT NULL,
    "currency" STRING NOT NULL,
    "amount" FLOAT8 NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Balance_user_id_currency_key" ON "Balance"("user_id", "currency");

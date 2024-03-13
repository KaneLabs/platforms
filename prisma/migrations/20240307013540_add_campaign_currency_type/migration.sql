-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('ETH', 'USDC', 'USDT');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "currency" "CurrencyType";

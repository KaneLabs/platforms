/*
  Warnings:

  - Made the column `campaignId` on table `CampaignContribution` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `CampaignContribution` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CampaignContribution" DROP CONSTRAINT "CampaignContribution_campaignId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "threshold" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CampaignContribution" ALTER COLUMN "campaignId" SET NOT NULL,
ALTER COLUMN "amount" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CampaignTier" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "CampaignContribution" ADD CONSTRAINT "CampaignContribution_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

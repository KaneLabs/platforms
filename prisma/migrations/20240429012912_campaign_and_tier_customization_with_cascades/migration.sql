-- CreateEnum
CREATE TYPE "FinancialVisibilityType" AS ENUM ('AMOUNT_AND_TARGET', 'TARGET_ONLY', 'BUTTON_ONLY');

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignApplication" DROP CONSTRAINT "CampaignApplication_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignContribution" DROP CONSTRAINT "CampaignContribution_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignTier" DROP CONSTRAINT "CampaignTier_campaignId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "financialVisibility" "FinancialVisibilityType",
ADD COLUMN     "fundButtonText" TEXT;

-- AlterTable
ALTER TABLE "CampaignTier" ADD COLUMN     "isOpenAmount" BOOLEAN;

-- CreateTable
CREATE TABLE "CampaignPageLink" (
    "id" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "CampaignPageLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignTier" ADD CONSTRAINT "CampaignTier_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignPageLink" ADD CONSTRAINT "CampaignPageLink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContribution" ADD CONSTRAINT "CampaignContribution_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignApplication" ADD CONSTRAINT "CampaignApplication_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

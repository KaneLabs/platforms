/*
  Warnings:

  - You are about to drop the column `senderEthAddress` on the `CampaignContribution` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[formResponseId]` on the table `CampaignApplication` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contributionId]` on the table `CampaignApplication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `CampaignContribution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CampaignContribution" DROP CONSTRAINT "CampaignContribution_senderEthAddress_fkey";

-- DropIndex
DROP INDEX "FormResponse_userId_formId_key";

-- AlterTable
ALTER TABLE "CampaignApplication" ADD COLUMN     "campaignTierId" TEXT,
ADD COLUMN     "contributionId" TEXT,
ADD COLUMN     "formResponseId" TEXT;

-- AlterTable
ALTER TABLE "CampaignContribution" DROP COLUMN "senderEthAddress",
ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CampaignApplication_formResponseId_key" ON "CampaignApplication"("formResponseId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignApplication_contributionId_key" ON "CampaignApplication"("contributionId");

-- AddForeignKey
ALTER TABLE "CampaignContribution" ADD CONSTRAINT "CampaignContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignApplication" ADD CONSTRAINT "CampaignApplication_formResponseId_fkey" FOREIGN KEY ("formResponseId") REFERENCES "FormResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignApplication" ADD CONSTRAINT "CampaignApplication_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "CampaignContribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignApplication" ADD CONSTRAINT "CampaignApplication_campaignTierId_fkey" FOREIGN KEY ("campaignTierId") REFERENCES "CampaignTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

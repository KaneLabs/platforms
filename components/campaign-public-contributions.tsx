"use client";

import useEthereum from "@/hooks/useEthereum";
import {
  ApplicationStatus,
  Campaign,
  CampaignApplication,
  CampaignContribution,
  CampaignTier,
  User,
} from "@prisma/client";
import { useState, useEffect } from "react";
import LoadingDots from "@/components/icons/loading-dots";
import CampaignTierCard from "@/components/campaign-tier-card";
import { Button } from "./ui/button";
import { getApplicationStatusText, getCurrencySymbol } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CampaignPublicView({
  campaignApplication,
}: {
  campaignApplication: CampaignApplication & { campaign: Campaign } & {
    user: User | null;
  } & { campaignTier: CampaignTier | null } & {
    contribution: CampaignContribution | null;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { withdrawContribution, isCampaignCompleted } = useEthereum(); 

  const campaign = campaignApplication.campaign;

  useEffect(() => {
    async function fetchIsCampaignCompleted() {
      if (campaign?.deployed) {
        const isCompleted = await isCampaignCompleted(campaign);
        setIsCompleted(isCompleted);
      }
    }
    fetchIsCampaignCompleted();
  }, [campaign])

  const handleWithdraw = async () => {
    await withdrawContribution(campaign, campaignApplication, campaignApplication.contribution as CampaignContribution);
    router.refresh();
  };

  if (loading) {
    return <LoadingDots color="#808080" />;
  } else if (!campaignApplication || !campaignApplication.campaignTier) {
    return <div>Campaign application not found</div>;
  }

  return (
    <div>
      {
        <div className="flex flex-col">
          <div className="flex space-x-16">
            <div className="flex grow flex-col space-y-8">
              <div className="flex flex-col items-start space-y-2">
                <h1 className="font-serif text-4xl font-semibold dark:text-white">
                  {campaign.name}
                </h1>
                <h4 className="truncate rounded-md bg-gray-100 py-1 font-medium text-gray-600 transition-colors dark:bg-gray-800 dark:text-gray-400">
                  Explore the campaign you backed
                </h4>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Your Contributor Tier</h2>
                <CampaignTierCard
                  tier={campaignApplication.campaignTier}
                  currency={campaign.currency}
                />
              </div>
              <div className="flex grow flex-col space-y-4">
                <h2 className="text-xl font-semibold">Status</h2>
                <div>
                  Submitted: <span className="font-medium">{campaignApplication.createdAt.toLocaleString()}</span>
                </div>
                <div>
                  Status: <span className="font-medium">{getApplicationStatusText(campaignApplication.status)}</span>
                </div>
                {campaignApplication.campaignTier.isOpenAmount && <div>
                  Amount: <span className="font-medium">{getCurrencySymbol(campaign.currency)}{campaignApplication.contribution?.amount} {campaign.currency}</span>
                </div>}
                <div>
                  {!isCompleted && campaignApplication.status !==
                    ApplicationStatus.NOT_SUBMITTED && (
                    <Button onClick={handleWithdraw}>
                      Withdraw Application
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

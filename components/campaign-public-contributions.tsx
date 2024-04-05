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
import { getApplicationStatusText } from "@/lib/utils";
import { withdrawCampaignApplication } from "@/lib/actions";
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const campaign = campaignApplication.campaign;

  const handleWithdraw = async () => {
    await withdrawCampaignApplication(campaignApplication.id);
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
            <div className="flex grow flex-col space-y-4">
              <div className="mb-4 text-lg">
                You backed <span className="font-medium">{campaign.name}</span>
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
                  Submitted: {campaignApplication.createdAt.toLocaleString()}
                </div>
                <div>
                  Status: {getApplicationStatusText(campaignApplication.status)}
                </div>
                <div>
                  {campaignApplication.status !==
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

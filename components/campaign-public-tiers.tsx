"use client";

import { useState, useEffect } from "react";
import {
  getCampaign,
  CampaignWithData,
} from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import CampaignTierSelector from "@/components/campaign-tier-selector";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { CampaignTier } from "@prisma/client";

export default function CampaignPublicTiers({
  campaignId,
  subdomain,
}: {
  campaignId: string;
  subdomain: string;
}) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignWithData | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<CampaignTier | null>(null);

  const handleTierSelect = (tierId: string) => {
    if (campaign) {
      const selected = campaign.campaignTiers.find(tier => tier.id === tierId);
      setSelectedTier(selected as CampaignTier);
    }
  }

  useEffect(() => {
    getCampaign(campaignId)
      .then((result) => {
        if (result) {
          setCampaign(result);
          setSelectedTier(result.campaignTiers[0]);
        }
      })
      .then(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return <LoadingDots color="#808080" />;
  } else if (!campaign || !campaign.organizationId) {
    return <div>Campaign not found</div>;
  }

  return (
    <div>
      {loading ? (
        <LoadingDots color="#808080" />
      ) : !campaign || !campaign.organizationId ? (
        <div>Campaign not found</div>
      ) : (
        <div className="flex flex-col space-y-4">
          <div className="flex-grow">
            {campaign.campaignTiers && (
              <div>
                <h2 className="text-xl">Please select a Tier to continue.</h2>
                <CampaignTierSelector
                  tiers={campaign.campaignTiers}
                  currency={campaign.currency}
                  onTierSelect={handleTierSelect}
                />
              </div>
            )}
          </div>
          <div className="self-end">
            <Button
              onClick={() => {
                setLoading(true);
                if (selectedTier?.formId) {
                  router.push(`${selectedTier?.id}/form/`)
                } else {
                  router.push(`${selectedTier?.id}/fund/`)
                }
              }}
              className="hover:bg-gray-700"
              disabled={!selectedTier}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

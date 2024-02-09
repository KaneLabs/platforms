"use client";

import useEthereum from "@/hooks/useEthereum";
import { Campaign, CampaignTier } from "@prisma/client";
import { useState, useEffect } from "react";
// import { ethers } from "ethers";
import {
  getCampaign,
  createCampaignApplication,
  CampaignWithData,
} from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
// import { Button } from "@/components/ui/button";
import CampaignContributeButton from "@/components/campaign-contribute-button";
import CampaignPageTierCard from "@/components/campaign-page-tier-card";
// import { Progress } from "@/components/ui/progress"
import Link from "next/link";
import BannerImage from "./site-layouts/social-media/banner-image";
import { ETH_PRICE_IN_DOLLARS } from "@/lib/utils";

export default function CampaignPublicView({
  campaignId,
  subdomain,
}: {
  campaignId: string;
  subdomain: string;
  isPublic: boolean;
}) {
  const { getContributionTotal, getContractBalance, contribute  } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(BigInt(0));
  const [contractBalance, setContractBalance] = useState(BigInt(0));
  const [campaign, setCampaign] = useState<CampaignWithData | undefined>(
    undefined,
  );
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);

  // const numBackers = 12;  // TEMP

  const triggerRefresh = () => {
    setRefreshFlag((prev) => !prev);
  };

  useEffect(() => {
    getCampaign(campaignId)
      .then((result) => {
        if (result) {
          setCampaign(result);
        }
      })
      .then(() => setLoading(false));
  }, [refreshFlag, campaignId]);

  useEffect(() => {
    async function fetchTotalContributions() {
      if (campaign?.deployed) {
        const total = await getContributionTotal(campaign.deployedAddress!);
        setTotalContributions(total);
      }
    }
    fetchTotalContributions();

    async function fetchContractBalance() {
      if (campaign?.deployed) {
        const balance = await getContractBalance(campaign.deployedAddress!);
        setContractBalance(balance);
      }
    }
    fetchContractBalance();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  if (loading) {
    return <LoadingDots color="#808080" />;
  } else if (!campaign || !campaign.organizationId) {
    return <div>Campaign not found</div>;
  }

  const getProgress = (contributions: bigint, thresholdWei: bigint) => {
    if (contributions < thresholdWei) {
      return Number((contributions * BigInt(100)) / thresholdWei);
    } else {
      return 100;
    }
  };


  const isValidAmount = (amount: number | null) => {
    if (!amount) return false;
    const num = parseFloat(amount.toString());
    return !isNaN(num) && num > 0;
  };

  const handleContribution = async (tier: CampaignTier) => {
    if (isValidAmount(tier.price)) {
      const amountETH = (tier.price as number) / ETH_PRICE_IN_DOLLARS;
      contribute(amountETH.toString(), campaign).then(() => alert("Success"));
    }
  };

  return (
    <>
      {loading ? (
        <LoadingDots color="#808080" />
      ) : !campaign || !campaign.organizationId ? (
        <div>Campaign not found</div>
      ) : (
        <div className="grid max-w-6xl grid-cols-1 md:grid-cols-3 md:gap-6  md:px-6">
          <div className="col-span-1 mb-6 md:col-span-3">
            {campaign.organization.image ? (
              <BannerImage src={campaign.organization.image} />
            ) : null}
          </div>

          <div className="col-span-1 md:col-span-2 px-5 md:px-0">
            <div className="space-y-4">
              <h1 className="mb-6 text-2xl font-bold">{campaign.name}</h1>
              <div>
                Hosted by
                <Link href={`/`} className="font-bold">
                  {` ${campaign.organization.name}`}
                </Link>
              </div>
              <div className="mb-6 flex flex-col space-y-4">
                <div className="flex space-x-8"></div>
              </div>
              <p>{campaign.content}</p>
              {campaign.campaignTiers && (
                <div>
                  <h2 className="text-xl">Campaign Tiers</h2>
                  {campaign.campaignTiers.map(
                    (tier: CampaignTier, index: number) => (
                      <CampaignPageTierCard onClick={handleContribution} key={index} tier={tier} />
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:flex md:flex-col col-span-1 md:col-span-1 px-5 md:px-0">
            <CampaignContributeButton
              campaign={campaign}
              subdomain={subdomain}
              // TODO createCampaignApplication only works if the user is signed in,
              // should prompt signin if they aren't
              onComplete={() => {
                triggerRefresh;
                createCampaignApplication(campaign.id);
              }}
              className={"min-w-52 rounded-md border border-gray-500 p-4"}
            />
          </div>
        </div>
      )}
    </>
  );
}

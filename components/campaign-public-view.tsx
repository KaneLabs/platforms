"use client";

import useEthereum from "@/hooks/useEthereum";
import { Campaign, CampaignTier } from "@prisma/client";
import { useState, useEffect } from 'react';
import { getCampaign, CampaignWithData } from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import CampaignContributeSection from "@/components/campaign-contribute-section";
import CampaignTierCard from "@/components/campaign-tier-card";
import Link from "next/link";
import BannerImage from "./site-layouts/social-media/banner-image";


export default function CampaignPublicView(
  {campaignId, subdomain}:
  {campaignId: string, subdomain: string, isPublic: boolean}
) {
  const { getContributionTotal, getContractBalance } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(BigInt(0));
  const [contractBalance, setContractBalance] = useState(BigInt(0));
  const [campaign, setCampaign] = useState<CampaignWithData | undefined>(undefined);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);

  const triggerRefresh = () => {
    setRefreshFlag(prev => !prev);
  };

  useEffect(() => {
    getCampaign(campaignId).then(result => {
      if (result) {
        setCampaign(result);
      }
    }).then(() => setLoading(false));
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
    return <LoadingDots color="#808080" />
  }
  else if (!campaign || !campaign.organizationId) {
    return <div>Campaign not found</div>
  }

  return (
    <div>
      {loading ? (
        <LoadingDots color="#808080" />
      ) : !campaign || !campaign.organizationId ? (
        <div>Campaign not found</div>
      ) : (
        <div className="flex space-x-16">
          {/* <BannerImage /> */}
          <div className="flex-grow 0 flex-basis 2/3">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold mb-6">{campaign.name}</h1>
              <div>
                Hosted by
                <Link href={`/`} className="font-bold">
                  {` ${campaign.organization.name}`}
                </Link>
              </div>
              <div className="mb-6 flex flex-col space-y-4">
                <div className="flex space-x-8">
                </div>
              </div>
              <p>{campaign.content}</p>
              <div className="flex flex-wrap gap-2">
                {campaign.medias 
                  ? campaign.medias.map(m => {
                    return (
                      <div className="flex flex-wrap rounded-md" key={m.id}>
                          <img
                            src={m.uri}
                            alt="Preview"
                            className="h-[96px] w-[200px] rounded-md object-cover object-center"
                          />
                      </div>
                    )
                    })
                  : null
                }
              </div>
              {campaign.campaignTiers &&
                <div>
                  <h2 className="text-xl">Contributor Tiers</h2>
                  {campaign.campaignTiers.map((tier: CampaignTier, index: number) =>
                    <CampaignTierCard
                      key={index}
                      tier={tier}
                      currency={campaign.currency}
                    />
                  )}
                </div>
              }
            </div>
          </div>
          <div className="flex-grow 0 flex-basis 1/3">
            <CampaignContributeSection
              campaign={campaign}
              className={"p-4 border border-gray-500 rounded-md min-w-52"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

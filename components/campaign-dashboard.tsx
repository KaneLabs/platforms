"use client";

import LaunchCampaignButton from "@/components/launch-campaign-button";
import CampaignWithdrawButton from "@/components/campaign-withdraw-button";
import CampaignTierCard from "@/components/campaign-tier-card";
import useEthereum from "@/hooks/useEthereum";
import {
  CampaignTier,
  FormResponse,
  Answer,
  User,
  CampaignApplication,
  CampaignContribution,
  Question,
} from "@prisma/client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  getCampaign,
  CampaignWithData,
  getCampaignApplications,
} from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import CampaignResponseDataTable from "@/components/form-response-table/campaign-response-data-table";
import { ETH_PRICE_IN_DOLLARS, getCurrencySymbol, getSubdomainUrl } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export default function CampaignDashboard({
  campaignId,
  subdomain,
}: {
  campaignId: string;
  subdomain: string;
  isPublic: boolean;
}) {
  const { getContributionTotal, getContractBalance } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(BigInt(0));
  const [contractBalance, setContractBalance] = useState(BigInt(0));
  const [campaign, setCampaign] = useState<CampaignWithData | undefined>(
    undefined,
  );
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplicatons] = useState<
    Array<CampaignApplication & { user: User | null } & { campaignTier: CampaignTier | null } & { formResponse: FormResponse & { answers: Array<Answer & { question: Question }> } | null } & { contribution: CampaignContribution | null }> | undefined
  >([]);

  const router = useRouter();

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
  }, [refreshFlag, campaign]);

  useEffect(() => {
    // async function fetchTotalContributions() {
    //   if (campaign?.deployed) {
    //     const total = await getContributionTotal(campaign);
    //     setTotalContributions(total);
    //   }
    // }
    // fetchTotalContributions();

    // async function fetchContractBalance() {
    //   if (campaign?.deployed) {
    //     const balance = await getContractBalance(campaign.deployedAddress!);
    //     setContractBalance(balance);
    //   }
    // }
    // fetchContractBalance();

    async function fetchCampaignApplications() {
      if (campaign) {
        const applications = await getCampaignApplications(campaign.id);
        setApplicatons(applications);
      }
    }
    fetchCampaignApplications();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFlag, campaign]);

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

  return (
    <div>
      {loading ? (
        <LoadingDots color="#808080" />
      ) : !campaign || !campaign.organizationId ? (
        <div>Campaign not found</div>
      ) : (
        <div className="text-gray-800">
          <div className="my-4 space-y-4">
            <div className="flex flex-row my-6 items-start justify-between gap-[20px] flex-wrap">
              <h1 className="font-serif text-3xl dark:text-white flex gap-2 items-center">
                {campaign.name}
                {campaign.deployed && (
                    <a
                      href={`${getSubdomainUrl(subdomain)}/campaigns/${campaign.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                )}
              </h1>
              <div className="flex flex-row gap-2 items-end">
                <div className="mr-4">{Intl.NumberFormat("en-US").format(campaign.threshold as number)} in <span className="font-medium">{campaign.currency}</span></div>
                <Button
                  onClick={() =>
                    router.push(
                      `/city/${subdomain}/campaigns/${campaignId}/settings/basic/edit`,
                    )
                  }
                >
                  Edit
                </Button>
                {!campaign.deployed && <LaunchCampaignButton
                  campaign={campaign}
                  subdomain={subdomain}
                  onComplete={triggerRefresh}
                />}
                </div>
            </div>
            <div className="mb-6 flex flex-col space-y-1">
              {/* <div className="flex justify-between space-x-4">
                <Progress
                  value={getProgress(totalContributions, campaign.thresholdWei)}
                  className="h-6 w-full"
                />
              </div> */}
              {/* <div className="flex space-x-8">
                <p className="text-sm">
                  {`${Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    parseFloat(ethers.formatEther(totalContributions)) *
                      ETH_PRICE_IN_DOLLARS,
                  )} of 
                  ${Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    parseFloat(ethers.formatEther(campaign.thresholdWei)) *
                      ETH_PRICE_IN_DOLLARS,
                  )} funded`}
                </p>
                <p className="text-sm">
                  {`${Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    parseFloat(ethers.formatEther(contractBalance)) *
                      ETH_PRICE_IN_DOLLARS,
                  )} available`}
                </p>
              </div> */}
            </div>
            <div className="my-6">
              {campaign.content}
            </div>
            <div className="pt-6 flex flex-wrap gap-2">
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
          </div>
          {campaign.campaignTiers && (
            <div className="mt-12">
              <h2 className="text-xl font-medium">Campaign Tiers</h2>
              {campaign.campaignTiers.map(
                (tier: CampaignTier, index: number) => (
                  <CampaignTierCard
                    key={index}
                    tier={tier}
                    currency={campaign.currency}
                  />
                ),
              )}
            </div>
          )}
          {applications && applications.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-medium">Applications</h2>
              <CampaignResponseDataTable
                campaign={campaign}
                applications={applications}
              />
            </div>
          )}
          {/* {campaign.deployed && (
            <div className="mt-12">
              <h2 className="text-xl font-medium">Withdrawal</h2>
              <CampaignWithdrawButton 
                campaign={campaign}
                subdomain={subdomain}
                onComplete={triggerRefresh}
              />
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}

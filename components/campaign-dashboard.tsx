"use client";

import LaunchCampaignButton from "@/components/launch-campaign-button";
import CampaignWithdrawButton from "@/components/campaign-withdraw-button";
import CampaignTierCard from "@/components/campaign-tier-card";
import useEthereum from "@/hooks/useEthereum";
import {
  Campaign,
  CampaignTier,
  Question,
  Form,
  FormResponse,
  Answer,
  User,
} from "@prisma/client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  getCampaign,
  CampaignWithData,
  getFormResponses,
  getFormQuestions,
} from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import CampaignResponseDataTable from "@/components/form-response-table/campaign-response-data-table";
import { ETH_PRICE_IN_DOLLARS } from "@/lib/utils";

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
  const [deadline, setDeadline] = useState(undefined);
  const [formQuestions, setFormQuestions] = useState<
    (Question & { form: Form })[] | undefined
  >([]);
  const [formResponses, setFormResponses] = useState<
    (FormResponse & { answers: Answer[]; user: User })[] | undefined
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

    async function fetchFormResponses() {
      if (campaign && campaign.formId) {
        const questions = await getFormQuestions(campaign.formId);
        setFormQuestions(questions);

        const formResponses = await getFormResponses(campaign.formId);
        setFormResponses(formResponses);
      }
    }
    fetchFormResponses();
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

  return (
    <div>
      {loading ? (
        <LoadingDots color="#808080" />
      ) : !campaign || !campaign.organizationId ? (
        <div>Campaign not found</div>
      ) : (
        <div>
          <div className="my-4 space-y-4">
            <div className="flex flex-row my-6 items-start justify-between gap-[20px] flex-wrap">
              <h1 className="text-3xl font-semibold">{campaign.name}</h1>
              <div className="flex flex-row gap-2">
                <Button
                  onClick={() =>
                    router.push(
                      `/city/${subdomain}/campaigns/${campaignId}/settings`,
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
              <div className="flex justify-between space-x-4">
                <Progress
                  value={getProgress(totalContributions, campaign.thresholdWei)}
                  className="h-6 w-full"
                />
              </div>
              <div className="flex space-x-8">
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
              </div>
            </div>
            <div className="my-6">
              {campaign.content}
            </div>
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
          </div>
          {campaign.campaignTiers && (
            <div className="mt-12">
              <h2 className="text-xl">Campaign Tiers</h2>
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
          {formQuestions && formResponses && (
            <div className="mt-12">
              <h2 className="text-xl">Applications</h2>
              <CampaignResponseDataTable
                campaign={campaign}
                questions={formQuestions}
                formResponses={formResponses}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

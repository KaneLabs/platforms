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
  CampaignPageLink,
} from "@prisma/client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  getCampaign,
  CampaignWithData,
  getCampaignApplications,
  deleteCampaign,
} from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import CampaignResponseDataTable from "@/components/form-response-table/campaign-response-data-table";
import { ETH_PRICE_IN_DOLLARS, getCurrencySymbol, getSubdomainUrl } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import CampaignLinkCard from "./campaign-link-card";
import { toast } from "sonner";

export default function CampaignDashboard({
  campaignId,
  subdomain,
}: {
  campaignId: string;
  subdomain: string;
  isPublic: boolean;
}) {
  const { getContributionTotal, getContributionTransferred, isCampaignCompleted } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(0);
  const [amountTransferred, setAmountTransferred] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

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

  const routeToCampaignPage = () => {
    router.push(`${getSubdomainUrl(subdomain)}/campaigns/${campaign?.id}`);
  }

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
        const total = await getContributionTotal(campaign);
        setTotalContributions(total);
      }
    }
    fetchTotalContributions();

    async function fetchAmountTransferred() {
      if (campaign?.deployed) {
        const tranferred = await getContributionTransferred(campaign);
        setAmountTransferred(tranferred);
      }
    }
    fetchAmountTransferred();

    async function fetchIsCampaignCompleted() {
      if (campaign?.deployed) {
        const isCompleted = await isCampaignCompleted(campaign);
        setIsCompleted(isCompleted);
      }
    }
    fetchIsCampaignCompleted();

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

  const getProgress = (contributions: number, threshold: number) => {
    if (contributions < threshold) {
      return Number((contributions * 100) / threshold);
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
              <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
                <h1 className="font-serif text-3xl dark:text-white flex gap-4 items-center">
                  {campaign.name}
                </h1>
                {campaign.deployed && (
                  <a
                    href={`${getSubdomainUrl(subdomain)}/campaigns/${campaign.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-1 truncate rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" 
                  >
                    View campaign page
                    <ExternalLink className="h-3 w-3"/>
                  </a>
                )}
              </div>
              <div className="flex flex-row gap-2 items-end">
                <div className="mr-4">{Intl.NumberFormat("en-US").format(campaign.threshold as number)} in <span className="font-medium">{campaign.currency}</span></div>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/city/${subdomain}/campaigns/${campaignId}/settings/basic/edit`,
                    )
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  disabled={campaign.deployed}
                  onClick={async () =>
                    window.confirm("Are you sure you want to delete your campaign?") &&
                    deleteCampaign({
                      campaign
                    }, { params: { subdomain } }, "delete")
                      .then(async (res) => {
                        if (res.error) {
                          toast.error(res.error);
                        } else {
                          router.push(
                            `/city/${subdomain}/campaigns/`,
                          )
                          toast.success(`Successfully deleted campaign!`);
                        }
                      })
                      .catch((err: Error) => toast.error(err.message))
                  }
                >
                  Delete
                </Button>
                {!campaign.deployed && <LaunchCampaignButton
                  campaign={campaign}
                  subdomain={subdomain}
                  onComplete={() => {
                    routeToCampaignPage();
                  }}
                />}
                </div>
            </div>
            {campaign.content && campaign.content.length > 0 && <div className="my-6">
              {campaign.content}
            </div>}
            {campaign.medias && campaign.medias.length > 0 && <div className="pt-6 flex flex-wrap gap-2">
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
            </div>}
          </div>
          {campaign.threshold && campaign.deployed && totalContributions > 0 && <div className="mt-12 mb-6 flex flex-col space-y-4">
              <h2 className="text-xl font-medium">Current Progress</h2>
              <div className="flex flex-col">
                <p className="text-md mb-2">
                  {`${getCurrencySymbol(campaign.currency)}${totalContributions} / 
                  ${getCurrencySymbol(campaign.currency)}${campaign.threshold} ${campaign.currency} raised`}
                </p>
                <Progress
                  value={getProgress(totalContributions, campaign.threshold)}
                  className="h-6 w-full"
                />
                <div className="mt-4">
                    <span className="text-md text-gray-800">Threshold: </span>
                    <span className="text-md font-medium">{totalContributions >= campaign.threshold ? "Passed. Organizer can withdraw." : "Not yet passed. Users can withdraw contributions."}</span>
                </div>
                <div className="mt-2">
                    <span className="text-md text-gray-800">Deadline: </span>
                    <span className="text-md font-medium">{campaign.deadline?.toLocaleDateString()}</span>
                </div>
              </div>
            </div>}
          {campaign.campaignTiers && campaign.campaignTiers.length > 0 && (
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
          {campaign.links && campaign.links.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-medium">Links</h2>
              {campaign.links.map(
                (link: CampaignPageLink, index: number) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <CampaignLinkCard
                      key={index}
                      link={link}
                    />
                  </a>
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
                subdomain={subdomain}
              />
            </div>
          )}
          {isCompleted && (
            <div className="mt-12">
              <h2 className="text-xl font-medium">Withdrawal</h2>
              <div className="flex gap-4 mt-4 mb-6">
                <div>
                  <div className="text-sm">Amount Transferred</div>
                  <div className="text-lg font-semibold text-gray-800">{getCurrencySymbol(campaign.currency)}{(amountTransferred).toFixed(5)} {campaign.currency}</div>
                </div>
                <div>
                  <div className="text-sm">Amount Available</div>
                  <div className="text-lg font-semibold text-gray-800">{getCurrencySymbol(campaign.currency)}{(totalContributions - amountTransferred).toFixed(5)} {campaign.currency}</div>
                </div>
              </div>
              <CampaignWithdrawButton 
                amountAvailable={totalContributions - amountTransferred}
                campaign={campaign}
                subdomain={subdomain}
                onComplete={triggerRefresh}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

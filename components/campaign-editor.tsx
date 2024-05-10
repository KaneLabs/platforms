"use client";

import useEthereum from "@/hooks/useEthereum";
import {
  Campaign,
  CampaignTier,
  Form,
  CurrencyType,
  CampaignMedia,
  CampaignPageLink,
  FinancialVisibilityType,
} from "@prisma/client";
import { useState, useEffect } from "react";
import { Result, ethers } from "ethers";
import {
  getCampaign,
  updateCampaign,
  upsertCampaignTiers,
  upsertCampaignMedias,
  getOrganizationForms,
  upsertCampaignLinks,
  CampaignWithData,
} from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/form-builder/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useRouter } from "next/navigation";
import CampaignTierEditor from "@/components/campaign-tier-editor";
import CampaignTierCard from "@/components/campaign-tier-card";
import MultiUploader from "./form/uploader-multiple";
import CampaignLinkEditor from "./campaign-link-editor";
import CampaignLinkCard from "./campaign-link-card";
import CampaignContributeSection from "./campaign-contribute-section";

interface EditedFields {
  name?: string;
  threshold?: string;
  content?: string;
  requireApproval?: boolean;
  deadline?: Date;
  formId?: string | null;
  currency?: string | null;
  images?: FileList | null;
  financialVisibility?: FinancialVisibilityType | null;
  fundButtonText?: string;
}

interface Payload {
  id: string;
  name?: string;
  threshold?: number;
  content?: string | null;
  requireApproval?: boolean;
  deadline?: Date | null;
  formId?: string | null;
  currency?: CurrencyType | null;
  financialVisibility?: FinancialVisibilityType | null;
  fundButtonText?: string;
}

export default function CampaignEditor({
  campaignId,
  subdomain,
  isPublic,
  segment,
  editType,
}: {
  campaignId: string;
  subdomain: string;
  isPublic: boolean;
  segment: string;
  editType: string;
}) {
  const { getContributionTotal, getContractBalance, extendCampaignDeadline } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(0);
  const [contractBalance, setContractBalance] = useState(BigInt(0));
  const [forms, setForms] = useState<Form[]>([]);
  const [campaign, setCampaign] = useState<CampaignWithData | undefined>(undefined);
  const [campaignTiers, setCampaignTiers] = useState<Partial<CampaignTier>[]>(
    [],
  );
  const [campaignLinks, setCampaignLinks] = useState<Partial<CampaignPageLink>[]>(
    [],
  );
  const [campaignMedias, setCampaignMedias] = useState<
    Partial<CampaignMedia>[]
  >([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedCampaign, setEditedCampaign] = useState<EditedFields>({
    name: undefined,
    threshold: undefined,
    content: undefined,
    deadline: undefined,
    requireApproval: undefined,
    formId: undefined,
    currency: undefined,
    financialVisibility: undefined,
    fundButtonText: undefined
  });
  const [editingTierIndex, setEditingTierIndex] = useState<number | null>(null);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    getCampaign(campaignId)
      .then((result) => {
        if (result) {
          setCampaign(result);
          setCampaignTiers(result.campaignTiers);
          setCampaignLinks(result.links);
          setCampaignMedias(result.medias || []);
          getOrganizationForms(result.organizationId).then(setForms);

          if (segment === "tiers" && result.campaignTiers.length === 0) {
            addNewTier();
          }
        }
      })
      .then(() => setLoading(false));
  }, [refreshFlag, campaignId]);

  useEffect(() => {
    // async function fetchTotalContributions() {
    //   if (campaign?.deployed) {
    //     const total = await getContributionTotal(campaign.deployedAddress!);
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  useEffect(() => {
    if (campaign) {
      setEditedCampaign({
        name: campaign.name,
        threshold: campaign.threshold?.toString() ?? undefined,
        content: campaign.content ?? undefined,
        deadline: campaign.deadline ?? undefined,
        requireApproval: campaign.requireApproval,
        formId: campaign.formId,
        currency: campaign.currency || CurrencyType.ETH,
        financialVisibility: campaign.financialVisibility || FinancialVisibilityType.AMOUNT_AND_TARGET,
        fundButtonText: campaign.fundButtonText ?? undefined
      });
    }
  }, [campaign]);

  const deleteTier = (index: number) => {
    const updatedTiers = [...campaignTiers];
    updatedTiers.splice(index, 1);
    setCampaignTiers(updatedTiers);
  };

  const deleteLink = (index: number) => {
    const updatedLinks = [...campaignLinks];
    updatedLinks.splice(index, 1);
    setCampaignLinks(updatedLinks);
  };

  const addNewTier = () => {
    const newNumTiers = campaignTiers.length + 1;
    setCampaignTiers([
      ...campaignTiers,
      { name: "", description: "", price: null, formId: null },
    ]);
    startEditTier(newNumTiers - 1);
  };

  const addNewLink = () => {
    const newNumLinks = campaignLinks.length + 1;
    setCampaignLinks([
      ...campaignLinks,
      { href: "", title: "", description: "" },
    ]);
    startEditLink(newNumLinks - 1);
  };

  const updateTier = (index: number, updatedTier: EditedFields) => {
    const updatedTiers = [...campaignTiers];
    let newTier: Partial<CampaignTier> = { ...updatedTiers[index] };

    Object.entries(updatedTier).forEach(([key, value]) => {
      switch (key) {
        case "quantity":
        case "price":
          newTier[key] =
            value === "" || value == undefined ? null : Number(value);
          break;
        default:
          newTier[key as keyof CampaignTier] = value || null;
      }
    });

    updatedTiers[index] = newTier;
    setCampaignTiers(updatedTiers);
  };

  const updateLink = (index: number, updatedLink: Partial<CampaignPageLink>) => {
    const updatedLinks = [...campaignLinks];
    updatedLinks[index] = updatedLink;
    setCampaignLinks(updatedLinks);
  };

  const startEditTier = (index: number) => {
    setEditingTierIndex(index);
  };

  const startEditLink = (index: number) => {
    setEditingLinkIndex(index);
  };

  const stopEditTier = () => {
    setEditingTierIndex(null);
  };

  const stopEditLink = () => {
    setEditingLinkIndex(null);
  };

  const handleFieldChange = (
    field: string,
    value:
      | number
      | string
      | string[]
      | FileList
      | boolean
      | Date
      | ((prevState: string[]) => string[]),
  ) => {
    setEditedCampaign((prev) => ({ ...prev, [field]: value }));
  };

  const submitChanges = async () => {
    // check in case somehow `campaign` hasn't loaded yet
    if (campaign) {
      if (campaignTiers) {
        campaignTiers.forEach((tier, tierIndex) => {
          if (!tier.name) {
            throw new Error(`Tier ${tierIndex+1}: Name is required`);
          }
          if (!tier.isOpenAmount && !tier.price) {
            throw new Error(`Tier ${tierIndex+1}: Price is required`);
          }
        })
      }

      if (campaignLinks) {
        campaignLinks.forEach((link, linkIndex) => {
          if (!link.href) {
            throw new Error(`Link ${linkIndex+1}: Url is required`);
          }
          if (!link.title) {
            throw new Error(`Link ${linkIndex+1}: Title is required`);
          }
        })
      }

      let payload: Payload = { id: campaignId };
      if (editedCampaign.name) payload.name = editedCampaign.name;
      if (editedCampaign.threshold !== undefined)
        payload.threshold = parseFloat(editedCampaign.threshold);
      if (editedCampaign.requireApproval !== undefined)
        payload.requireApproval = editedCampaign.requireApproval;
      if (editedCampaign.deadline) payload.deadline = editedCampaign.deadline;
      if (editedCampaign.formId) payload.formId = editedCampaign.formId;
      if (editedCampaign.currency)
        payload.currency = editedCampaign.currency as CurrencyType;
      if (editedCampaign.financialVisibility)
        payload.financialVisibility = editedCampaign.financialVisibility as FinancialVisibilityType;
      
      payload.content = editedCampaign.content ?? "";
      payload.fundButtonText = editedCampaign.fundButtonText;

      if (campaign.deployed && payload.deadline && campaign.deadline) {
        if (payload.deadline < campaign.deadline) {
          throw new Error(`Campaign deadline must be in the future.`);
        }
        if (payload.deadline > campaign.deadline) {
          await extendCampaignDeadline(campaign, payload.deadline);
        }
      }

      await updateCampaign(payload, { params: { subdomain } }, null);

      await upsertCampaignTiers(
        { tiers: campaignTiers, campaign: campaign },
        { params: { subdomain: subdomain as string } },
        null,
      );

      await upsertCampaignLinks(
        { links: campaignLinks, campaign: campaign },
        { params: { subdomain: subdomain as string } },
        null,
      );

      if (editedCampaign.images && editedCampaign.images.length > 0) {
        const formData = new FormData();
        Array.from(editedCampaign.images).forEach((image: File) => {
          formData.append("images", image);
        });

        await upsertCampaignMedias(
          { formData, campaign },
          { params: { subdomain } },
          null,
        );
      }
    }
  };

  const routeToNextPage = (isContinue: boolean) => {
    if (isContinue) {
      if (segment === "basic") {
        router.push(
          `/city/${subdomain}/campaigns/${campaignId}/settings/details/${editType}`,
        );
      } else if (segment === "details") {
        router.push(
          `/city/${subdomain}/campaigns/${campaignId}/settings/tiers/${editType}`,
        );
      } else if (segment === "tiers") {
        router.push(
          `/city/${subdomain}/campaigns/${campaignId}/settings/links/${editType}`,
        );
      } else {
        router.push(`/city/${subdomain}/campaigns/${campaignId}`);
      }
    } else {
      if (segment === "links") {
        router.push(
          `/city/${subdomain}/campaigns/${campaignId}/settings/tiers/${editType}`,
        );
      } else if (segment === "tiers") {
        router.push(
          `/city/${subdomain}/campaigns/${campaignId}/settings/details/${editType}`,
        );
      } else if (segment === "details") {
        router.push(
          `/city/${subdomain}/campaigns/${campaignId}/settings/basic/${editType}`,
        );
      } else {
        router.push(`/city/${subdomain}/campaigns/${campaignId}`);
      }
    }
  }

  const saveChanges = (isContinue: boolean) => {
    setLoading(true);
    submitChanges()
      .then(() => {
        routeToNextPage(isContinue);
      })
      .catch((error: any) => {
        console.error("Error updating campaign", error);
        toast.error(error.message);
        setLoading(false);
      });
  };

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
        <div>
          <div>
            <div className="mb-4 space-y-8 font-medium text-gray-800">
              {segment === "basic" && (
                <>
                  <div className="flex flex-col space-y-4">
                    <div>How would you like to name the Campaign?</div>
                    <Input
                      type="text"
                      id="campaignName"
                      value={editedCampaign.name}
                      placeholder="Campaign name"
                      onChange={(e) =>
                        handleFieldChange("name", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div>Tell your audience a bit more about the Campaign (you will get the chance to edit this later)</div>
                    <Textarea
                      value={editedCampaign.content}
                      id="content"
                      onChange={(e) =>
                        handleFieldChange("content", e.target.value)
                      }
                      disabled={isPublic}
                    />
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div>Please upload images for your Campaign</div>
                    <MultiUploader
                      values={campaignMedias.map((m) => m.uri as string)}
                      name={"image"}
                      aspectRatio={"aspect-square"}
                      onChange={(files) => handleFieldChange("images", files)}
                    />
                    <div className="rounded-md text-sm font-medium text-gray-600 transition-colors">
                      Upload all your images in one batch. The first image will be used as your Campaign cover image. Other images will be shown on your Campaign page under your Campaign description in the order you selected them.
                    </div>
                  </div>
                </>
              )}
              {segment === "tiers" && (
                <div>
                  {campaignTiers.map((tier, index) => {
                    const isOldCampaignTier = campaign.campaignTiers.some(t => t.id === tier.id);
                    const shouldEnableTierFields = campaign.deployed && !isOldCampaignTier || !campaign.deployed;
                    return editingTierIndex === index ? (
                      <CampaignTierEditor
                        key={index}
                        tier={tier as CampaignTier}
                        forms={forms}
                        disableFields={!shouldEnableTierFields}
                        onCancel={
                          (updatedTier) => {
                            if (updatedTier.name || updatedTier.price) {
                              stopEditTier();
                            } else {
                              deleteTier(index);
                            }
                          }
                        }
                        onSave={(updatedTier) => {
                          updateTier(index, updatedTier);
                          stopEditTier();
                        }}
                      />
                    ) : (
                      <div key={index}>
                        <CampaignTierCard
                          tier={tier as CampaignTier}
                          currency={editedCampaign.currency as CurrencyType}
                          onClickEdit={() => startEditTier(index)}
                          onClickDelete={shouldEnableTierFields ? () => deleteTier(index) : undefined}
                        />
                      </div>
                    );
                  })}
                  <Button onClick={addNewTier}>
                    Add New Tier
                  </Button>
                </div>
              )}
              {segment === "details" && (
                <>
                  <div className="flex flex-col space-y-4">
                    <div>
                      Please set a deadline
                      <div className="truncate rounded-md text-sm font-medium text-gray-600 transition-colors">
                        Contributions will be closed after this date
                      </div>
                    </div>
                    <DatePicker
                      id="deadline"
                      date={editedCampaign.deadline}
                      onSelect={(date) => {
                        if (date) {
                          handleFieldChange("deadline", date);
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div>
                      What is the minimum you are looking to raise with this Campaign (aka contribution threshold)?
                      <div className="rounded-md text-sm font-medium text-gray-600 transition-colors">
                        Campaign contributors will be able to freely withdraw their tokens until the contribution threshold is reached. To make all contributions non-refundable, set a threshold lower than your lowest tier.
                      </div>
                    </div>
                    <div className="flex space-x-4">
                    <Input
                      className="w-60"
                      type="text"
                      value={editedCampaign.threshold}
                      id="threshold"
                      placeholder="Fundraising goal"
                      pattern="^\d*\.?\d*$"
                      inputMode="decimal"
                      onKeyDown={(e) => {
                        if (!/[\d.]/.test(e.key) && 
                            e.key !== "Backspace" && 
                            e.key !== "Tab" && 
                            e.key !== "ArrowLeft" && 
                            e.key !== "ArrowRight"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d.]/g, '');

                        if (parseFloat(value) < 0) value = '0';

                        handleFieldChange("threshold", value);
                      }}
                      disabled={campaign.deployed}
                    />    
                      <ToggleGroup.Root
                        className={`inline-flex rounded-full bg-gray-200 shadow-md ${campaign.deployed && "opacity-50 cursor-not-allowed"}`}
                        type="single"
                        defaultValue={CurrencyType.ETH}
                        value={editedCampaign.currency ?? CurrencyType.ETH}
                        onValueChange={(value) => {
                          if (value) {
                            handleFieldChange("currency", value)
                          }
                        }}
                        disabled={campaign.deployed}
                      >
                        <ToggleGroup.Item
                          className="w-20 rounded-l-full bg-gray-800 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-accent-green/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                          value={CurrencyType.ETH}
                        >
                          ETH
                        </ToggleGroup.Item>
                        <ToggleGroup.Item
                          className="w-20 bg-gray-800 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-accent-green/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                          value={CurrencyType.USDC}
                        >
                          USDC
                        </ToggleGroup.Item>
                        <ToggleGroup.Item
                          className="w-20 rounded-r-full bg-gray-800 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-accent-green/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                          value={CurrencyType.USDT}
                        >
                          USDT
                        </ToggleGroup.Item>
                      </ToggleGroup.Root>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div>
                      Please set the Fund button text
                      <div className="truncate rounded-md text-sm font-medium text-gray-600 transition-colors">
                        Max 15 characters
                      </div>
                    </div>
                    <Input
                      className="w-60"
                      type="text"
                      maxLength={15}
                      id="fundingButtonText"
                      value={editedCampaign.fundButtonText}
                      onChange={(e) =>
                        handleFieldChange("fundButtonText", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div>
                      Should Campaign page visitors see how much has been raised so far?
                    </div>
                    <div className="flex space-x-4">
                      <ToggleGroup.Root
                        className={`inline-flex space-x-4`}
                        type="single"
                        defaultValue={FinancialVisibilityType.AMOUNT_AND_TARGET}
                        value={editedCampaign.financialVisibility ?? FinancialVisibilityType.AMOUNT_AND_TARGET}
                        onValueChange={(value) => {
                          if (value) {
                            handleFieldChange("financialVisibility", value)
                          }
                        }}
                      >
                        <ToggleGroup.Item
                          className="group"
                          value={FinancialVisibilityType.AMOUNT_AND_TARGET}
                        >
                          <CampaignContributeSection 
                            campaign={editedCampaign as Partial<Campaign>}
                            isDeadlineExceeded={false}
                            totalContribution={totalContributions}
                            className={"p-8 rounded-xl w-64 min-h-44 shadow-md hover:bg-gray-50/50 border border-gray-300 group-data-[state=on]:!border-accent-green/90"}
                            visibility={FinancialVisibilityType.AMOUNT_AND_TARGET}
                            fundButtonText={editedCampaign.fundButtonText}
                          />
                          <div className="mt-2">Amount raised & target</div>
                        </ToggleGroup.Item>
                        <ToggleGroup.Item
                          className="group"
                          value={FinancialVisibilityType.TARGET_ONLY}
                        >
                          <CampaignContributeSection 
                            campaign={editedCampaign as Partial<Campaign>}
                            isDeadlineExceeded={false}
                            className={"p-8 rounded-xl w-64 min-h-44 shadow-md hover:bg-gray-50/50 border border-gray-300 group-data-[state=on]:!border-accent-green/90"}
                            visibility={FinancialVisibilityType.TARGET_ONLY}
                            fundButtonText={editedCampaign.fundButtonText}
                          />
                          <div className="mt-2">Target only</div>
                        </ToggleGroup.Item>
                        <ToggleGroup.Item
                          className="group"
                          value={FinancialVisibilityType.BUTTON_ONLY}
                        >
                          <CampaignContributeSection 
                            campaign={editedCampaign as Partial<Campaign>}
                            isDeadlineExceeded={false}
                            className={"p-8 rounded-xl w-64 min-h-44 shadow-md hover:bg-gray-50/50 border border-gray-300 group-data-[state=on]:!border-accent-green/90"}
                            visibility={FinancialVisibilityType.BUTTON_ONLY}
                            fundButtonText={editedCampaign.fundButtonText}
                          />
                          <div className="mt-2">No figures</div>
                        </ToggleGroup.Item>
                      </ToggleGroup.Root>
                    </div>
                  </div>
                  <div className="flex space-x-6">
                    <div>Do contributors need to be approved?</div>
                    <div className="flex space-x-2">
                      <Switch
                        className={`h-6`}
                        id="requireApproval"
                        checked={editedCampaign.requireApproval}
                        onCheckedChange={(val) =>
                          handleFieldChange("requireApproval", val)
                        }
                      />
                      <span>
                        {editedCampaign.requireApproval ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </>
              )}
              {segment === "links" && (
                <div>
                  {campaignLinks.map((link, index) => 
                    editingLinkIndex === index ? (
                      <CampaignLinkEditor
                        key={index}
                        link={link as CampaignPageLink}
                        onCancel={
                          () => deleteLink(index)
                        }
                        onSave={(updatedLink) => {
                          updateLink(index, updatedLink);
                          stopEditLink();
                        }}
                      />
                    ) : (
                      <div key={index}>
                        <CampaignLinkCard
                          link={link as CampaignPageLink}
                          onClickEdit={() => startEditLink(index)}
                          onClickDelete={() => deleteLink(index)}
                        />
                      </div>
                    )
                  )}
                  <Button onClick={addNewLink}>
                    Add New Link
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => saveChanges(false)}
            >
              Back
            </Button>
            <Button
              className="float-right"
              disabled={loading}
              onClick={() => saveChanges(true)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

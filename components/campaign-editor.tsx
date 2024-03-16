"use client";

import useEthereum from "@/hooks/useEthereum";
import {
  Campaign,
  CampaignTier,
  Form,
  CurrencyType,
  CampaignMedia,
} from "@prisma/client";
import { useState, useEffect } from "react";
import { Result, ethers } from "ethers";
import {
  getCampaign,
  updateCampaign,
  upsertCampaignTiers,
  upsertCampaignMedias,
  getOrganizationForms,
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
import { ETH_PRICE_IN_DOLLARS } from "@/lib/utils";
import MultiUploader from "./form/uploader-multiple";

interface EditedFields {
  name?: string;
  thresholdUSD?: string;
  content?: string;
  requireApproval?: boolean;
  deadline?: Date;
  formId?: string | null;
  currency?: string | null;
  images?: FileList | null;
}

interface Payload {
  id: string;
  name?: string;
  thresholdWei?: bigint;
  content?: string | null;
  requireApproval?: boolean;
  deadline?: Date | null;
  campaignTiers?: CampaignTier[] | null;
  formId?: string | null;
  currency?: CurrencyType | null;
}

export default function CampaignEditor({
  campaignId,
  subdomain,
  isPublic,
}: {
  campaignId: string;
  subdomain: string;
  isPublic: boolean;
}) {
  const { getContributionTotal, getContractBalance } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(0);
  const [contractBalance, setContractBalance] = useState(BigInt(0));
  const [forms, setForms] = useState<Form[]>([]);
  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
  const [campaignTiers, setCampaignTiers] = useState<Partial<CampaignTier>[]>(
    [],
  );
  const [campaignMedias, setCampaignMedias] = useState<
    Partial<CampaignMedia>[]
  >([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedCampaign, setEditedCampaign] = useState<EditedFields>({
    name: undefined,
    thresholdUSD: undefined,
    content: undefined,
    deadline: undefined,
    requireApproval: undefined,
    formId: undefined,
    currency: undefined,
  });
  const [editingTierIndex, setEditingTierIndex] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    getCampaign(campaignId)
      .then((result) => {
        if (result) {
          setCampaign(result);
          setCampaignTiers(result.campaignTiers);
          setCampaignMedias(result.medias || []);
          getOrganizationForms(result.organizationId).then(setForms);
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

  useEffect(() => {
    if (campaign) {
      setEditedCampaign({
        name: campaign.name,
        thresholdUSD: (
          parseFloat(ethers.formatEther(campaign.thresholdWei)) *
          ETH_PRICE_IN_DOLLARS
        ).toString(),
        content: campaign.content ?? undefined,
        deadline: campaign.deadline ?? undefined,
        requireApproval: campaign.requireApproval,
        formId: campaign.formId,
        currency: campaign.currency,
      });
    }
  }, [campaign]);

  const addNewTier = () => {
    const newNumTiers = campaignTiers.length + 1;
    setCampaignTiers([
      ...campaignTiers,
      { name: "", description: "", quantity: null, price: 0, formId: null },
    ]);
    startEditTier(newNumTiers - 1);
  };

  const updateTier = (index: number, updatedTier: EditedFields) => {
    const updatedTiers = [...campaignTiers];
    let newTier: Partial<CampaignTier> = { ...updatedTiers[index] };

    Object.entries(updatedTier).forEach(([key, value]) => {
      switch (key) {
        case "quantity":
        case "price":
          newTier[key] = value === "" || value == undefined ? null : Number(value);
          break;
        default:
          newTier[key as keyof CampaignTier] = value || null;
      }
    });

    updatedTiers[index] = newTier;
    setCampaignTiers(updatedTiers);
  };

  const startEditTier = (index: number) => {
    setEditingTierIndex(index);
  };

  const stopEditTier = () => {
    setEditingTierIndex(null);
  };

  const handleFieldChange = (
    field: string,
    value:
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
      let payload: Payload = { id: campaignId };
      if (editedCampaign.name) payload.name = editedCampaign.name;
      if (editedCampaign.thresholdUSD !== undefined)
        payload.thresholdWei =
          ethers.parseEther(editedCampaign.thresholdUSD) /
          BigInt(ETH_PRICE_IN_DOLLARS);
      if (editedCampaign.content)
        payload.content = editedCampaign.content ?? null;
      if (editedCampaign.requireApproval !== undefined)
        payload.requireApproval = editedCampaign.requireApproval;
      if (editedCampaign.deadline) payload.deadline = editedCampaign.deadline;
      if (editedCampaign.formId) payload.formId = editedCampaign.formId;
      if (editedCampaign.currency)
        payload.currency = editedCampaign.currency as CurrencyType;

      try {
        await updateCampaign(payload, { params: { subdomain } }, null);

        await upsertCampaignTiers(
          { tiers: campaignTiers, campaign: campaign },
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

        toast.success(`Campaign updated`);

        setCampaign({ ...campaign, ...payload });
        router.refresh();
      } catch (error: any) {
        console.error("Error updating campaign or tiers", error);
        toast.error(error.message);
      }
    }
  };

  const saveChanges = () => {
    submitChanges().then(() =>
      router.push(`/city/${subdomain}/campaigns/${campaignId}`),
    );
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
            <h1 className="text-2xl">Campaign Settings</h1>
            <div className="my-4 space-y-4">
              <div>What is your Campaign named?</div>
              <Input
                type="text"
                id="campaignName"
                value={editedCampaign.name}
                placeholder="Campaign name"
                onChange={(e) => handleFieldChange("name", e.target.value)}
                disabled={isPublic || campaign.deployed}
              />
              <div>How would you describe it?</div>
              <Textarea
                value={editedCampaign.content}
                id="content"
                onChange={(e) => handleFieldChange("content", e.target.value)}
                disabled={isPublic}
              />
              <div>Please upload images for your Campaign</div>
              <MultiUploader
                values={campaignMedias.map((m) => m.uri as string)}
                name={"image"}
                aspectRatio={"aspect-square"}
                onChange={(files) => handleFieldChange("images", files)}
              />
              <div>
                <h2 className="text-xl">Campaign Tiers</h2>
                {campaignTiers.map((tier, index) =>
                  editingTierIndex === index ? (
                    <CampaignTierEditor
                      key={index}
                      tier={tier as CampaignTier}
                      forms={forms}
                      onSave={(updatedTier) => {
                        updateTier(index, updatedTier);
                        stopEditTier();
                      }}
                    />
                  ) : (
                    <div key={index}>
                      <CampaignTierCard
                        tier={tier as CampaignTier}
                        onClickEdit={() => startEditTier(index)}
                      />
                    </div>
                  ),
                )}
                <Button className="mt-2" onClick={addNewTier}>
                  Add New Tier
                </Button>
              </div>
              <div className="flex space-x-4">
                <div>Require approval for contributors?</div>
                <Switch
                  id="requireApproval"
                  checked={editedCampaign.requireApproval}
                  onCheckedChange={(val) =>
                    handleFieldChange("requireApproval", val)
                  }
                />
              </div>
              <div className="flex flex-col space-y-4">
                <div>Please set a deadline</div>
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
                <div>Please set your contribution threshold & token</div>
                <div className="flex space-x-4">
                  <Input
                    className="w-1/5"
                    type="text"
                    value={editedCampaign.thresholdUSD}
                    id="thresholdUSD"
                    placeholder="Fundraising goal"
                    onChange={(e) =>
                      handleFieldChange("thresholdUSD", e.target.value)
                    }
                    disabled={isPublic || campaign.deployed}
                  />
                  <ToggleGroup.Root
                    className="inline-flex rounded-full bg-gray-200 shadow-md"
                    type="single"
                    defaultValue={CurrencyType.ETH}
                    value={editedCampaign.currency ?? CurrencyType.ETH}
                    onValueChange={(value) =>
                      handleFieldChange("currency", value)
                    }
                  >
                    <ToggleGroup.Item
                      className="w-20 rounded-l-full bg-gray-800 p-2 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-gray-600/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                      value={CurrencyType.ETH}
                    >
                      ETH
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="w-20 bg-gray-800 p-2 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-gray-600/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                      value={CurrencyType.USDC}
                    >
                      USDC
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="w-20 rounded-r-full bg-gray-800 p-2 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-gray-600/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                      value={CurrencyType.USDT}
                    >
                      USDT
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                </div>
              </div>
            </div>
          </div>

          {!isPublic && (
            <Button className="float-right" onClick={saveChanges}>
              {"Save Changes"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

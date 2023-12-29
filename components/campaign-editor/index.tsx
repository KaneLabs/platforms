"use client";

import useEthereum from "@/hooks/useEthereum";
import { Campaign, CampaignTier, Form } from "@prisma/client";
import { useState, useEffect } from "react";
import { Result, ethers } from "ethers";
import {
  getCampaign,
  updateCampaign,
  upsertCampaignTiers,
  getOrganizationForms,
} from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/form-builder/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
// import { Select } from "@/components/ui/select";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useRouter } from "next/navigation";
import CampaignTierEditor from "@/components/campaign-tier-editor";
import CampaignTierCard from "@/components/campaign-tier-card";
import SidebarLayout from "./sidebar";

interface EditedFields {
  name?: string;
  thresholdETH?: string;
  content?: string;
  requireApproval?: boolean;
  deadline?: Date;
  formId?: string | null;
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
  const [campaignTiers, setCampaignTiers] = useState<CampaignTier[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedCampaign, setEditedCampaign] = useState<EditedFields>({
    name: undefined,
    thresholdETH: undefined,
    content: undefined,
    deadline: undefined,
    requireApproval: undefined,
    formId: undefined,
  });
  const [editingTierIndex, setEditingTierIndex] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    getCampaign(campaignId)
      .then((result) => {
        console.log('result: result')
        if (result) {
          setCampaign(result);
          setCampaignTiers(result.campaignTiers);
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
        thresholdETH: ethers.formatEther(campaign.thresholdWei),
        content: campaign.content ?? undefined,
        deadline: campaign.deadline ?? undefined,
        requireApproval: campaign.requireApproval,
      });
    }
  }, [campaign]);

  const addNewTier = () => {
    setCampaignTiers([
      // @ts-expect-error
      ...campaignTiers,
      // @ts-expect-error
      { name: "", description: "", quantity: null, price: 0 },
    ]);
  };

  const updateTier = (index: number, updatedTier: EditedFields) => {
    const updatedTiers = [...campaignTiers];
    updatedTiers[index] = { ...updatedTiers[index], ...updatedTier };
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
      | boolean
      | Date
      | ((prevState: string[]) => string[]),
  ) => {
    console.log("handling");
    setEditedCampaign((prev) => ({ ...prev, [field]: value }));
  };

  const submitChanges = async () => {
    // check in case somehow `campaign` hasn't loaded yet
    if (campaign) {
      let payload: Payload = { id: campaignId };
      if (editedCampaign.name) payload.name = editedCampaign.name;
      if (editedCampaign.thresholdETH !== undefined)
        payload.thresholdWei = ethers.parseEther(editedCampaign.thresholdETH);
      if (editedCampaign.content)
        payload.content = editedCampaign.content ?? null;
      if (editedCampaign.requireApproval !== undefined)
        payload.requireApproval = editedCampaign.requireApproval;
      if (editedCampaign.deadline) payload.deadline = editedCampaign.deadline;
      if (editedCampaign.formId) payload.formId = editedCampaign.formId;

      try {
        await updateCampaign(payload, { params: { subdomain } }, null);

        await upsertCampaignTiers(
          { tiers: campaignTiers, campaign: campaign },
          { params: { subdomain: subdomain as string } },
          null,
        );
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
    <SidebarLayout>
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
                <Input
                  type="text"
                  id="campaignName"
                  value={editedCampaign.name}
                  placeholder="Campaign name"
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  disabled={isPublic || campaign.deployed}
                />
                <Input
                  type="text"
                  value={editedCampaign.thresholdETH}
                  id="thresholdETH"
                  placeholder="Fundraising goal"
                  onChange={(e) =>
                    handleFieldChange("thresholdETH", e.target.value)
                  }
                  disabled={isPublic || campaign.deployed}
                />
                <Textarea
                  value={editedCampaign.content}
                  id="content"
                  onChange={(e) => handleFieldChange("content", e.target.value)}
                  disabled={isPublic}
                />
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
                <div className="flex items-center space-x-4">
                  <div>Deadline</div>
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
                <div className="flex items-center space-x-4">
                  <div>Currency</div>
                  <ToggleGroup.Root
                    className="inline-flex rounded-full bg-gray-200 shadow-md"
                    type="single"
                    defaultValue="eth"
                  >
                    <ToggleGroup.Item
                      className="w-20 rounded-l-full bg-gray-800 p-2 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-gray-600/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                      value="eth"
                    >
                      ETH
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="w-20 bg-gray-800 p-2 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-gray-600/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                      value="usdc"
                    >
                      USDC
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      className="w-20 rounded-r-full bg-gray-800 p-2 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-gray-600/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
                      value="usdt"
                    >
                      USDT
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                </div>
              </div>
              <div className="my-4">
                <h2 className="text-xl">Application Form</h2>
                <select
                  value={editedCampaign.formId || ""}
                  onChange={(e) => handleFieldChange("formId", e.target.value)}
                  disabled={isPublic}
                  className="text-black"
                >
                  <option value="">Select a Form</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h2 className="text-xl">Campaign Tiers</h2>
                {campaignTiers.map((tier, index) =>
                  editingTierIndex === index ? (
                    <CampaignTierEditor
                      key={index}
                      tier={tier}
                      onSave={(updatedTier) => {
                        updateTier(index, updatedTier);
                        stopEditTier();
                      }}
                    />
                  ) : (
                    <div key={index}>
                      <CampaignTierCard tier={tier} />
                      <Button onClick={() => startEditTier(index)}>Edit</Button>
                    </div>
                  ),
                )}
                <Button className="mt-2" onClick={addNewTier}>
                  Add New Tier
                </Button>
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
    </SidebarLayout>
  );
}

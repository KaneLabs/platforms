"use client";

import useEthereum from "@/hooks/useEthereum";
import { Campaign, CampaignTier, Form } from "@prisma/client";
import { useState, useEffect } from 'react';
import { Result, ethers } from "ethers";
import { getCampaign, updateCampaign, upsertCampaignTiers,
  getOrganizationForms } from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/form-builder/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
// import { Select } from "@/components/ui/select";
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useRouter } from "next/navigation";
import CampaignTierEditor from "@/components/campaign-tier-editor";
import CampaignTierCard from "@/components/campaign-tier-card";
import { ETH_PRICE_IN_DOLLARS } from "@/lib/utils";


interface EditedFields {
  name?: string;
  thresholdUSD?: string;
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


export default function CampaignEditor(
  {campaignId, subdomain, isPublic}:
  {campaignId: string, subdomain: string, isPublic: boolean}
) {
  const { getContributionTotal, getContractBalance } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(0);
  const [contractBalance, setContractBalance] = useState(BigInt(0));
  const [forms, setForms] = useState<Form[]>([]);
  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
  const [campaignTiers, setCampaignTiers] = useState<Partial<CampaignTier>[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedCampaign, setEditedCampaign] = useState<EditedFields>(
    { name: undefined, thresholdUSD: undefined, content: undefined,
      deadline: undefined, requireApproval: undefined,
      formId: undefined });
  const [editingTierIndex, setEditingTierIndex] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    getCampaign(campaignId).then(result => {
      if (result) {
        setCampaign(result);
        setCampaignTiers(result.campaignTiers);
        getOrganizationForms(result.organizationId).then(setForms);
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

  useEffect(() => {
    if (campaign) {
      setEditedCampaign({
        name: campaign.name,
        thresholdUSD: (parseFloat(ethers.formatEther(campaign.thresholdWei)) * ETH_PRICE_IN_DOLLARS).toString(),
        content: campaign.content ?? undefined,
        deadline: campaign.deadline ?? undefined,
        requireApproval: campaign.requireApproval,
      });
    }
  }, [campaign]);

  const addNewTier = () => {
    const newNumTiers = campaignTiers.length + 1;
    setCampaignTiers([...campaignTiers, { name: '', description: '',
      quantity: null, price: 0 }]);
    startEditTier(newNumTiers - 1);
  };

const updateTier = (index: number, updatedTier: EditedFields) => {
    const updatedTiers = [...campaignTiers];
    let newTier: Partial<CampaignTier> = { ...updatedTiers[index] };

    Object.entries(updatedTier).forEach(([key, value]) => {
        switch (key) {
            case "quantity":
            case "price":
                newTier[key] = value === '' ? null : Number(value);
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

  const handleFieldChange = (field: string, value: string | string[] | boolean | Date | ((prevState: string[]) => string[])) => {
    setEditedCampaign(prev => ({ ...prev, [field]: value }));
  };

  const submitChanges = async () => {
    // check in case somehow `campaign` hasn't loaded yet
    if (campaign) {
      let payload: Payload = { id: campaignId };
      if (editedCampaign.name) payload.name = editedCampaign.name;
      if (editedCampaign.thresholdUSD !== undefined) payload.thresholdWei =
        ethers.parseEther(editedCampaign.thresholdUSD) / BigInt(ETH_PRICE_IN_DOLLARS);
      if (editedCampaign.content) payload.content = editedCampaign.content ?? null;
      if (editedCampaign.requireApproval !== undefined) payload.requireApproval = editedCampaign.requireApproval;
      if (editedCampaign.deadline) payload.deadline = editedCampaign.deadline;
      if (editedCampaign.formId) payload.formId = editedCampaign.formId

      try {
        await updateCampaign(
          payload,
          { params: { subdomain } },
          null,
        );

        await upsertCampaignTiers(
          { tiers: campaignTiers, campaign: campaign },
          { params: { subdomain: subdomain as string } },
          null,
        );
        toast.success(`Campaign updated`);
        
        setCampaign({...campaign, ...payload});
        router.refresh();

      } catch (error: any) {
        console.error('Error updating campaign or tiers', error);
        toast.error(error.message);
      }
    }
  };

  const saveChanges = () => {
    submitChanges()
    .then(() => router.push(`/city/${subdomain}/campaigns/${campaignId}`))
  };

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
        <div className="max-w-[500px]">
          <div>
            <h1 className="text-3xl">
              Campaign Settings
            </h1>
            <div className="space-y-4 my-4">
              <Input
                type="text" 
                id="campaignName"
                value={editedCampaign.name}
                placeholder="Campaign name"
                onChange={(e) => handleFieldChange('name', e.target.value)} 
                disabled={isPublic || campaign.deployed}
              />
              <Textarea 
                value={editedCampaign.content} 
                id="content"
                onChange={(e) => handleFieldChange('content', e.target.value)}
                disabled={isPublic}
              />
            </div>
            <div className="space-y-4 mt-8">
              <h2 className="text-2xl font-bold">Goal</h2>
              <div className="flex space-x-8 items-center">
                <div className="flex items-center">
                  <p className="mr-2">$</p>
                  <Input
                    type="text"
                    value={editedCampaign.thresholdUSD}
                    id="thresholdUSD"
                    placeholder="Fundraising goal"
                    onChange={(e) => handleFieldChange('thresholdUSD', e.target.value)}
                    disabled={isPublic || campaign.deployed}
                  />
                </div>
                <div className="flex space-x-4 items-center">
                  <div>
                    Deadline
                  </div>
                  <DatePicker
                    id="deadline"
                    date={editedCampaign.deadline}
                    onSelect={(date) => {
                      if (date) {
                        handleFieldChange('deadline', date);
                      }
                    }}
                  />
                </div>
              </div>
              {/* <div className="flex space-x-4 items-center">
                <div>Currency to accept</div>
                <ToggleGroup.Root
                  className="inline-flex bg-gray-200 rounded-full shadow-md"
                  type="single"
                  defaultValue="eth"
                >
                  <ToggleGroup.Item
                    className="bg-gray-800 w-20 p-2 text-gray-100 shadow hover:bg-gray-800/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90 data-[state=on]:!bg-gray-600/90 rounded-l-full"
                    value="eth"
                  >
                    ETH
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    className="bg-gray-800 w-20 p-2 text-gray-100 shadow hover:bg-gray-800/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90 data-[state=on]:!bg-gray-600/90"
                    value="usdc"
                  >
                    USDC
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    className="bg-gray-800 w-20 p-2 text-gray-100 shadow hover:bg-gray-800/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90 data-[state=on]:!bg-gray-600/90 rounded-r-full"
                    value="usdt"
                  >
                    USDT
                  </ToggleGroup.Item>
                </ToggleGroup.Root>
              </div> */}
            </div>
            <div className="space-y-4 my-8">
              <h2 className="text-2xl font-bold">Contributing</h2>
              <div className="flex space-x-4">
                  <div>Require approval for contributors?</div>
                  <Switch
                    id="requireApproval"
                    checked={editedCampaign.requireApproval}
                    onCheckedChange={(val) => handleFieldChange('requireApproval', val)}
                  />
              </div>
              <div className="my-4">
                <h3>Application Form</h3>
                <select
                  value={editedCampaign.formId || ""}
                  onChange={(e) => handleFieldChange('formId', e.target.value)}
                  disabled={isPublic}
                  className="text-black mt-2"
                >
                  <option value="">Select a Form</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-2">Campaign Tiers</h2>
              {
                campaignTiers.map((tier, index) => (
                  editingTierIndex === index ? (
                    <CampaignTierEditor
                      key={index}
                      tier={tier as CampaignTier}
                      onSave={(updatedTier) => {
                        updateTier(index, updatedTier);
                        stopEditTier();
                      }}
                    />
                  ) : (
                    <div key={index}>
                      <CampaignTierCard tier={tier as CampaignTier} onClickEdit={() => startEditTier(index)} />
                    </div>
                  )
                ))
              }
              <Button
                className="mt-2"
                onClick={addNewTier}
              >
                Add New Tier
              </Button>
            </div>
          </div>

          {!isPublic && (
            <Button
              className="float-right"
              onClick={saveChanges}
            >
              {'Save Changes'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
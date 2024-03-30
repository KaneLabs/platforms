"use client";

import PaperDoc from "@/components/paper-doc";
import { useRouter } from "next/navigation";
import FormTitle from "@/components/form-title";
import DynamicForm from "@/components/form/dynamic-form";
import { Campaign, CampaignTier, Form, FormResponse, Question } from "@prisma/client";

export type CampaignTierWithData = CampaignTier & { campaign: Campaign } & { Form: Form & { questions: Question[] }};

export default function CampaignPublicForm({
  campaignTier,
}: {
  campaignTier: CampaignTierWithData
}) {
  const router = useRouter();

  const onSubmit = (response: FormResponse) => {
    router.push(`/campaigns/${campaignTier.campaign.id}/checkout/${campaignTier.id}/fund/${response.id}/`);
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-6">
        {campaignTier.Form && (
          <DynamicForm form={campaignTier.Form} onSubmitCallback={onSubmit} />
        )}
      </div>
    </div>
  );
}

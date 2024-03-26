"use client";

import CampaignTierCard from "@/components/campaign-tier-card";
import { formatAnswer } from "@/components/form-response-table/utils";
import CampaignFundButton from "@/components/campaign-fund-button";
import { createCampaignApplication } from "@/lib/actions";
import { Answer, Campaign, CampaignTier, Form, FormResponse, Question } from "@prisma/client";
import { useRouter } from "next/navigation";

export type CampaignTierWithData = CampaignTier & { campaign: Campaign } & { Form: Form & { formResponse?: Array<FormResponse & { answers: Array<Answer & { question: Question }> }> }};

export default function CampaignPublicCheckoutSummary({
  campaignTier,
}: {
  campaignTier: CampaignTierWithData
}) {
  const router = useRouter();
  const formResponse = campaignTier.Form?.formResponse?.[0];

  const formattedFormAnswers = formResponse && formResponse.answers.map(
    (value) => {
      const question = value.question;

      return (
        <div key={value.id}>
          <h2 className="text-xl">{question.text}</h2>
          <h2 className="text-xl">{question.description}</h2>
          <p className="text-sm">
            {formatAnswer(question!, value)}
          </p>
        </div>
      );
    },
  ); 

  return (
    <div className="flex flex-col min-h-full max-w-lg space-y-4 mx-6 my-6">
      <div>Here’s a summary of your application</div>
      <div className="w-full transform overflow-hidden rounded-2xl bg-gray-500 p-6 text-left align-middle shadow-xl transition-all">
        <div className="mt-2 flex flex-col space-y-6">
          {formattedFormAnswers}
        </div>
        <CampaignTierCard
          tier={campaignTier}
          currency={campaignTier.campaign.currency}
        />
        <div className="text-sm">
          *you can claim your refund if your application isn’t accepted.
        </div>
      </div>
      <div className="self-end ">
        <CampaignFundButton 
          amount={campaignTier.price as number}
          onComplete={async () => {
            await createCampaignApplication(campaignTier.campaign.id, formResponse ? formResponse.id : undefined);
            router.push(`/campaigns/${campaignTier.campaign.id}`);
          }}
        />
      </div>
    </div>
  );
}

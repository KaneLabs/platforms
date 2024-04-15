"use client";

import CampaignTierCard from "@/components/campaign-tier-card";
import { formatAnswer } from "@/components/form-response-table/utils";
import CampaignFundButton from "@/components/campaign-fund-button";
import { Answer, Campaign, CampaignTier, Form, FormResponse, Question } from "@prisma/client";
import { useRouter } from "next/navigation";
import useEthereum from "@/hooks/useEthereum";

export type CampaignTierWithData = CampaignTier & { campaign: Campaign } & { Form: Form & { formResponse?: Array<FormResponse & { answers: Array<Answer & { question: Question }> }> }};

export default function CampaignPublicCheckoutSummary({
  campaignTier,
}: {
  campaignTier: CampaignTierWithData
}) {
  const router = useRouter();
  const { contribute } = useEthereum();

  const formResponse = campaignTier.Form?.formResponse?.[0];
  const amount = Number(campaignTier.price);

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
    <div className="flex flex-col min-h-full max-w-lg space-y-4 my-6">
      <div>Here&apos;s a summary of your contribution</div>
      <div className="w-full transform overflow-hidden rounded-2xl border border-gray-500 py-8 px-8 text-left align-middle shadow-xl transition-all">
        <div className="flex flex-col space-y-6">
          {formattedFormAnswers || "Tier"}
        </div>
        <CampaignTierCard
          tier={campaignTier}
          currency={campaignTier.campaign.currency}
        />
      </div>
      <div className="text-sm">
        * You will be able to get a refund if your application isn&#39;t accepted or the campaign doesn&#39;t reach its target.
      </div>
      <div className="self-end ">
        <CampaignFundButton 
          amount={amount}
          onComplete={async (amount: number) => {
            try {
              await contribute(amount, campaignTier.campaign, campaignTier, formResponse);
              router.push(`/campaigns/${campaignTier.campaign.id}/contributions`);
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </div>
    </div>
  );
}

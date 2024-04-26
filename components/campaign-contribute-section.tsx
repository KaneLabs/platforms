"use client";

import { Button } from "./ui/button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrencySymbol } from "@/lib/utils";
import { Campaign, FinancialVisibilityType } from "@prisma/client";

const defaultAmount = 0;
const defaultTarget = 5000;
const defaultFundText = "Fund";

interface CampaignContributeSectionProps {
  campaign: Partial<Campaign>;
  isDeadlineExceeded: boolean;
  totalContribution?: number | null;
  className: string;
  visibility?: FinancialVisibilityType | null;
  isPublic?: boolean;
  fundButtonText?: string | null;
}

export default function CampaignContributeSection({
  campaign,
  isDeadlineExceeded,
  totalContribution,
  className,
  visibility,
  isPublic,
  fundButtonText
}: CampaignContributeSectionProps) {

  const router = useRouter();

  if (visibility === FinancialVisibilityType.BUTTON_ONLY) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <Button
          onClick={() => isPublic && router.push(`${campaign.id}/checkout/tiers`)}
          className="w-full rounded-full"
          disabled={isDeadlineExceeded}
        >
          {isDeadlineExceeded ? "Ended" : fundButtonText || defaultFundText}
        </Button>
      </div>
    );
  }

  if (visibility === FinancialVisibilityType.TARGET_ONLY) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div>
          <div className="text-left text-2xl font-semibold">
            {getCurrencySymbol(campaign.currency)}{campaign.threshold || defaultTarget} {campaign.currency}
          </div>
          <div className="text-left text-sm">Target raise</div>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => isPublic && router.push(`${campaign.id}/checkout/tiers`)}
            className="w-full rounded-full"
            disabled={isDeadlineExceeded}
          >
            {isDeadlineExceeded ? "Ended" : fundButtonText || defaultFundText}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div>
        <div className="text-left text-2xl font-semibold">
          {getCurrencySymbol(campaign.currency)}{totalContribution || defaultAmount} {campaign.currency}
        </div>
        <div className="text-left text-sm">Raised of {getCurrencySymbol(campaign.currency)}{campaign.threshold || defaultTarget} {campaign.currency} target</div>
      </div>
      <div className="mt-4">
        <Button
          onClick={() => isPublic && router.push(`${campaign.id}/checkout/tiers`)}
          className="w-full rounded-full"
          disabled={isDeadlineExceeded}
        >
          {isDeadlineExceeded ? "Ended" : fundButtonText || defaultFundText}
        </Button>
      </div>
    </div>
  );
}

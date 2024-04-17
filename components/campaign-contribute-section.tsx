"use client";

import { Button } from "./ui/button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CampaignWithData } from "@/lib/actions";
import { getCurrencySymbol } from "@/lib/utils";

interface CampaignContributeSectionProps {
  campaign: CampaignWithData;
  className: string;
}

export default function CampaignContributeSection({
  campaign,
  className,
}: CampaignContributeSectionProps) {

  const router = useRouter();

  return (
    <div className={`flex flex-col ${className}`}>
      <div>
        <div className="text-2xl font-semibold">
          {getCurrencySymbol(campaign.currency)}{campaign.threshold} {campaign.currency}
        </div>
        <div className="text-sm">Minimum Target</div>
      </div>
      <div className="mt-4">
        <Button
          onClick={() => router.push(`${campaign.id}/checkout/tiers`)}
          className="w-full rounded-full"
        >
          Fund
        </Button>
      </div>
    </div>
  );
}

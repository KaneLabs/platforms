"use client";

import { Button } from "./ui/button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CampaignWithData } from "@/lib/actions";

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
        <div className="text-2xl">
          {campaign.thresholdWei.toString()} {campaign.currency}
        </div>
        <div>Goal</div>
      </div>
      <div className="mt-4">
        <Button
          onClick={() => router.push(`${campaign.id}/checkout/tiers`)}
          className="hover:bg-gray-700"
        >
          Fund
        </Button>
      </div>
    </div>
  );
}

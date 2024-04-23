"use client";

import React from 'react';
import { Campaign } from "@prisma/client";
import { Button } from "./ui/button";
import useEthereum from "@/hooks/useEthereum";


interface LaunchCampaignButtonProps {
  campaign: Campaign;
  subdomain: string;
  onComplete: () => void;
}

export default function LaunchCampaignButton({ campaign, subdomain, onComplete }: LaunchCampaignButtonProps) {
  const { launch } = useEthereum();
  const onClick = async () => {
    try {
      await launch(campaign, { subdomain }).then(onComplete);
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <Button onClick={onClick}>
      Launch Campaign
    </Button>
  );
}

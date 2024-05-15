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
      window.confirm("Fora currently supports Campaigns on Ethereum and Optimism. Please make sure your Metamask wallet is set to your preferred network for all contributions and withdrawals as it will not be able to be changed later.") &&
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

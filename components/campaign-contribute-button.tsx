"use client";

import { Campaign } from "@prisma/client";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from 'react';
import useEthereum from "@/hooks/useEthereum";
import { ethers } from "ethers";


interface CampaignContributeButtonProps {
  campaign: Campaign;
  subdomain: string;
  onComplete: () => void;
  className: string;
}

export default function CampaignContributeButton({ 
  campaign, 
  subdomain,
  onComplete,
  className
}: CampaignContributeButtonProps) {
  const { contribute } = useEthereum();
  const [amount, setAmount] = useState('');

  const isValidAmount = () => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const handleContribution = async () => {
    if (isValidAmount()) {
      contribute(amount, campaign).then(onComplete);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div>
        <div className="text-2xl">
          {ethers.formatEther(campaign.thresholdWei)} ETH
        </div>
        <div>
          Goal
        </div>
      </div>
      <div className={"flex items-center space-x-4 my-4"}>
        <Input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (ETH)"
          className="w-36"
        />
        <Button
          onClick={handleContribution}
          disabled={!isValidAmount()}
          className={`${isValidAmount() ? 'hover:bg-gray-700' : 'bg-gray-500'}`}
        >
          {campaign.requireApproval ? "Apply to Join" : "Fund"}
        </Button>
      </div>
    </div>
  );
}
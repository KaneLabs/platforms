"use client";

import { Campaign } from "@prisma/client";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from 'react';
import useEthereum from "@/hooks/useEthereum";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { CampaignWithData } from "@/lib/actions";
import { ETH_PRICE_IN_DOLLARS } from "@/lib/utils";


interface CampaignContributeButtonProps {
  campaign: CampaignWithData;
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

  const router = useRouter();

  const isValidAmount = () => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const handleContribution = async () => {
    if (isValidAmount()) {
      const amountETH = (parseFloat(amount) / ETH_PRICE_IN_DOLLARS).toString();
      contribute(amountETH, campaign).then(onComplete);
    }
  };


  return (
    <div className={`flex flex-col ${className}`}>
      <div>
        <div className="text-2xl">
          {`${Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                .format(parseFloat(ethers.formatEther(campaign.thresholdWei))
                * ETH_PRICE_IN_DOLLARS)}
          `}
        </div>
        <div>
          Goal
        </div>
      </div>
      {campaign.requireApproval ? (
        <div className="mt-4">
          <Button
            onClick={() => router.push(`${campaign.id}/checkout/tiers`)}
            className="hover:bg-gray-700"
          >
            Fund
          </Button>
        </div>
        ) : (
          <div className={"flex flex-col space-y-4 mt-4"}>
            <div className="flex items-center">
              $
              <Input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-36 ml-2"
              />
            </div>
            <Button
              onClick={handleContribution}
              disabled={!isValidAmount()}
              className={`${isValidAmount() ? "hover:bg-gray-700" : "bg-gray-500"}`}
            >
              Fund
            </Button>
          </div>
        )
      }
    </div>
  );
}
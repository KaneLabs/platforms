"use client";

import { Campaign } from "@prisma/client";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useState } from 'react';
import useEthereum from "@/hooks/useEthereum";


interface CampaignWithdrawButtonProps {
  campaign: Campaign;
  subdomain: string;
  onComplete: () => void;
}

export default function CampaignWithdrawButton({ 
  campaign, 
  subdomain,
  onComplete
}: CampaignWithdrawButtonProps) {
  const { withdrawFromCampaign } = useEthereum();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const isValidAmount = () => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const isValidRecipient = () => {
    return recipient && recipient.length > 0 && /^0x[a-fA-F0-9]{40}$/.test(recipient);
  }

  const handleWithdraw = () => {
    if (isValidAmount() && isValidRecipient()) {
      withdrawFromCampaign(amount, recipient, campaign).then(onComplete);
    }
  };

  return (
    <div className="flex items-center space-x-4 my-4">
      <div className="mb-4 space-y-8 font-medium text-gray-800">
        <div className="flex flex-col space-y-4">
          <div>How much {campaign.currency} do you want to withdraw?</div>
          <Input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`0`}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <div>What is the recipient wallet address?</div>
          <Input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x123"
          />
        </div>
        <Button
          onClick={handleWithdraw}
          disabled={!isValidAmount() || !isValidRecipient()}
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
}
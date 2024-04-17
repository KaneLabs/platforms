"use client";

import { Button } from "./ui/button";
import React, { useState } from "react";

interface CampaignFundButtonProps {
  amount: number;
  onComplete: (amount: number) => void;
}

export default function CampaignFundButton({
  amount,
  onComplete,
}: CampaignFundButtonProps) {

  const isValidAmount = () => {
    return !isNaN(amount) && amount > 0;
  };

  const handleContribution = async () => {
    if (isValidAmount()) {
      onComplete(amount);
    }
  };

  return (
    <div className={"flex flex-col space-y-4"}>
      <Button
        onClick={handleContribution}
        disabled={!isValidAmount()}
      >
        Fund
      </Button>
    </div>
  );
}

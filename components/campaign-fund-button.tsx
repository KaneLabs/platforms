"use client";

import { Button } from "./ui/button";
import React, { useState } from "react";
import useEthereum from "@/hooks/useEthereum";

interface CampaignFundButtonProps {
  amount: number;
  onComplete: () => void;
}

export default function CampaignFundButton({
  amount,
  onComplete,
}: CampaignFundButtonProps) {
  const { contribute } = useEthereum();

  const isValidAmount = () => {
    return !isNaN(amount) && amount > 0;
  };

  const handleContribution = async () => {
    if (isValidAmount()) {
      // await contribute(amount.toString(), campaign).then(onComplete);
      onComplete();
    }
  };

  return (
    <div className={"mt-4 flex flex-col space-y-4"}>
      <Button
        onClick={handleContribution}
        disabled={!isValidAmount()}
        className={`${isValidAmount() ? "hover:bg-gray-700" : "bg-gray-500"}`}
      >
        Fund
      </Button>
    </div>
  );
}

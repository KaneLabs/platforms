"use client";

import { Button } from "./ui/button";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";

interface CampaignFundButtonProps {
  isOpenAmount: boolean;
  tierAmount: string | undefined;
  fundButtonText: string | null;
  onComplete: (amount: number) => void;
}

export default function CampaignFundButton({
  isOpenAmount,
  tierAmount,
  fundButtonText,
  onComplete,
}: CampaignFundButtonProps) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setAmount(tierAmount || "");
  }, [tierAmount]);

  const isValidAmount = () => {
    return !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  };

  const handleContribution = async () => {
    if (isValidAmount()) {
      onComplete(parseFloat(amount));
    }
  };

  return (
    <div className={"flex flex-col space-y-4"}>
      {isOpenAmount && <div className="flex flex-col space-y-4">
        <div>Enter amount:</div>
        <Input
          type="text"
          value={amount}
          placeholder="E.g. 100, 8.99, 0.001"
          pattern="^\d*\.?\d*$"
          inputMode="decimal"
          onKeyDown={(e) => {
            if (!/[\d.]/.test(e.key) && 
                e.key !== "Backspace" && 
                e.key !== "Tab" && 
                e.key !== "ArrowLeft" && 
                e.key !== "ArrowRight"
            ) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            let value = e.target.value.replace(/[^\d.]/g, '');

            if (parseFloat(value) < 0) value = '0';

            setAmount(value);
          }}
        />
      </div>}
      <Button
        onClick={handleContribution}
        disabled={!isValidAmount()}
      >
        {fundButtonText || "Fund"}
      </Button>
    </div>
  );
}

import React, { useState } from 'react';
import CampaignTierCard from './campaign-tier-card';
import { CampaignTier, CurrencyType } from '@prisma/client';

export default function CampaignTierSelector({ tiers, currency, onTierSelect }:
  { tiers: CampaignTier[], currency?: CurrencyType | null, onTierSelect: (tierId: string) => void }) {
  const [selectedTierIndex, setSelectedTierIndex] = useState(0); 

  const handleSelect = (tierId: string, index: number) => {
    onTierSelect(tierId);
    setSelectedTierIndex(index);
  }

  return (
    <div>
      {tiers.map((tier, index) => (
        <CampaignTierCard
          key={index}
          tier={tier}
          currency={currency}
          isSelected={selectedTierIndex === index}
          onClickSelect={(tierId) => handleSelect(tierId, index)} 
        />
      ))}
    </div>
  );
}
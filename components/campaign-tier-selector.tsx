import React, { useState } from 'react';
import CampaignTierCard from './campaign-tier-card';
import { CampaignTier, CurrencyType } from '@prisma/client';

export default function CampaignTierSelector({ tiers, currency }:
  { tiers: CampaignTier[], currency?: CurrencyType | null }) {
  const [selectedTierIndex, setSelectedTierIndex] = useState(0); 

  return (
    <div>
      {tiers.map((tier, index) => (
        <CampaignTierCard
          key={index}
          tier={tier}
          currency={currency}
          isSelected={selectedTierIndex === index}
          onClickSelect={() => setSelectedTierIndex(index)} 
        />
      ))}
    </div>
  );
}
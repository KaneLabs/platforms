import React from 'react';
import { CampaignTier } from "@prisma/client";
import { Button } from "@/components/ui/button";


export default function CampaignTierCard({ tier, onClickEdit }:
  { tier: CampaignTier, onClickEdit?: () => void })
{
  return (
    <div className="space-y-4 my-4 rounded-md border border-gray-500 p-4">
      <div>
        <h1 className="text-2xl font-bold">{tier.name}</h1>
        {tier.description && 
          <div className="mb-6 flex flex-col space-y-4">
            {tier.description}
          </div>
        }
        {tier.quantity && 
          <div className="flex space-x-4 items-center">
            {`${tier.quantity} total`}
          </div>
        }
        {tier.price && 
          <div className="flex space-x-4 items-center">
            {`${Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                .format(tier.price)}
            `}
          </div>
        }
      </div>
      {onClickEdit && <Button onClick={onClickEdit}>Edit</Button>}
    </div>
  );
}
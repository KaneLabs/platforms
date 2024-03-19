import React from 'react';
import { CampaignTier, CurrencyType } from "@prisma/client";
import { Edit } from 'lucide-react';

export default function CampaignTierCard({ tier, currency, onClickEdit }:
  { tier: CampaignTier, currency?: CurrencyType | null, onClickEdit?: () => void })
{
  return (
    <div className="flex flex-col space-y-4 my-4 rounded-lg border border-gray-500 p-4">
      <div className='relative'>
        <div className="flex flex-row items-start justify-between gap-[20px] flex-wrap">
          <div className="text-2xl">{tier.name}</div>
          {tier.price && 
            <div className="flex space-x-4 items-center text-2xl">
              {tier.price} {currency}
            </div>
          }
        </div>
        {tier.description && 
          <div className="mb-2 mt-2 flex flex-col space-y-4 italic">
            {tier.description}
          </div>
        }
        <div className="flex justify-end w-full">
          {onClickEdit && <Edit className="cursor-pointer" onClick={onClickEdit} width={18} />}
        </div>
      </div>
    </div>
  );
}
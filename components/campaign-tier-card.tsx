"use client";

import React from 'react';
import { CampaignTier, CurrencyType } from "@prisma/client";
import { Edit, Trash2 } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/utils';

export default function CampaignTierCard({ tier, currency, onClickEdit, onClickDelete, isSelected, onClickSelect }:
  { tier: CampaignTier, currency?: CurrencyType | null, onClickEdit?: () => void, onClickDelete?: () => void, isSelected?: boolean, onClickSelect?: (tierId: string) => void }) {

  return (
    <div
      className={`flex flex-col space-y-4 my-4 rounded-lg border py-6 px-8 bg-gray-100 dark:bg-gray-800 transition ease-in-out ${onClickSelect && isSelected ? 'border border-blue-500 bg-white dark:bg-gray-800' : 'border border-gray-500'} ${onClickSelect && 'cursor-pointer hover:bg-white hover:dark:bg-gray-800'} `}
      onClick={() => {
        if (onClickSelect) {
          onClickSelect(tier.id);
        }
      }}
    >
      <div className='relative'>
        <div className="flex flex-row items-start justify-between gap-[20px] flex-wrap">
          <div className="text-2xl font-semibold">{tier.name}</div>
          {tier.price &&
            <div className="flex space-x-4 items-center text-2xl font-semibold">
              {getCurrencySymbol(currency)}{tier.price} {currency}
            </div>
          }
        </div>
        {tier.description && 
          <div className="mb-2 mt-2 flex flex-col space-y-4 italic">
            {tier.description}
          </div>
        }
        <div className="flex justify-end w-full">
          {onClickEdit && 
            <Edit 
              className="cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                onClickEdit();
              }} 
              width={18} 
            />
          }
          {onClickDelete && 
            <Trash2 
              className="cursor-pointer ml-2" 
              onClick={(e) => {
                e.stopPropagation();
                onClickDelete();
              }} 
              width={18} 
            />
          }
        </div>
      </div>
    </div>
  );
}
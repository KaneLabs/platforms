"use client";

import React, { useState } from 'react';
import { CampaignTier, CurrencyType } from "@prisma/client";
import { Edit } from 'lucide-react';

export default function CampaignTierCard({ tier, currency, onClickEdit, isSelected, onClickSelect }:
  { tier: CampaignTier, currency?: CurrencyType | null, onClickEdit?: () => void, isSelected?: boolean, onClickSelect?: (tierId: string) => void }) {

  return (
    <div
      className={`flex flex-col space-y-4 my-4 rounded-lg border p-4 bg-gray-100 transition ease-in-out ${onClickSelect && isSelected ? 'border border-blue-500 bg-white' : 'border border-gray-500'} ${onClickSelect && 'cursor-pointer hover:bg-white'} `}
      onClick={() => {
        if (onClickSelect) {
          onClickSelect(tier.id);
        }
      }}
    >
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
        </div>
      </div>
    </div>
  );
}
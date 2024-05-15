"use client";

import React from "react";
import { CampaignTier, CurrencyType } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
import { getCurrencySymbol } from "@/lib/utils";
import { Button } from "./ui/button";

export default function CampaignTierCard({
  tier,
  currency,
  onClickEdit,
  onClickDelete,
  isSelected,
  onClickSelect,
  onClickPrimaryButton,
}: {
  tier: CampaignTier;
  currency?: CurrencyType | null;
  onClickEdit?: () => void;
  onClickDelete?: () => void;
  isSelected?: boolean;
  onClickSelect?: (tierId: string) => void;
  onClickPrimaryButton?: () => void;
}) {
  return (
    <div
      className={`dark:bg-gray-800 my-4 flex flex-col space-y-4 rounded-lg border bg-gray-100 px-8 py-6 transition ease-in-out ${
        onClickSelect && isSelected
          ? "dark:bg-gray-800 border border-accent-green bg-white"
          : "border border-gray-300"
      } ${
        onClickSelect && "hover:dark:bg-gray-800 cursor-pointer hover:bg-white"
      } `}
      onClick={() => {
        if (onClickSelect) {
          onClickSelect(tier.id);
        }
      }}
    >
      <div className="relative">
        <div className="flex flex-row flex-wrap items-start justify-between gap-[20px]">
          <div className="text-2xl font-semibold">{tier.name}</div>
          {tier.isOpenAmount && (
            <div className="flex items-center space-x-4 text-2xl font-semibold">
              {getCurrencySymbol(currency)}Custom {currency}
            </div>
          )}
          {tier.price && (
            <div className="flex items-center space-x-4 text-2xl font-semibold">
              {getCurrencySymbol(currency)}
              {tier.price} {currency}
            </div>
          )}
        </div>
        {tier.description && (
          <div className="mb-2 mt-2 flex flex-col space-y-4 italic">
            {tier.description}
          </div>
        )}
        <div className="flex w-full justify-end">
          {onClickEdit && (
            <Edit
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onClickEdit();
              }}
              width={18}
            />
          )}
          {onClickDelete && (
            <Trash2
              className="ml-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onClickDelete();
              }}
              width={18}
            />
          )}
          {onClickPrimaryButton && (
            <Button
              className="mt-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onClickPrimaryButton();
              }}
            >
              Pledge {getCurrencySymbol(currency)}
              {tier.isOpenAmount ? "Custom" : tier.price}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

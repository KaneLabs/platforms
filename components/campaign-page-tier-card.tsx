import React from "react";
import { CampaignTier } from "@prisma/client";

export default function CampaignPageTierCard({
  tier,
  onClick,
}: {
  tier: CampaignTier;
  onClick: (tier: CampaignTier) => any;
}) {
  console.log("prop:", tier);
  return (
    <div
      onClick={() => {
        onClick(tier);
      }}
      className="my-4 space-y-4 rounded-md border border-gray-500 p-4"
    >
      <div>
        <h1 className="text-2xl font-bold">{tier.name}</h1>
        {tier.description && (
          <div className="mb-6 flex flex-col space-y-4">{tier.description}</div>
        )}
        {tier.quantity && (
          <div className="flex items-center space-x-4">
            {`${tier.quantity} total`}
          </div>
        )}
        {tier.price && (
          <div className="flex items-center space-x-4">
            {`${Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(tier.price)}`}
          </div>
        )}
      </div>
    </div>
  );
}

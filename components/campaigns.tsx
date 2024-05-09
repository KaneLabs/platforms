"use client";

import Image from "next/image";
import CampaignCard, { CampaignWithMedia } from "./campaign-card";
import { Campaign, Organization } from "@prisma/client";
import { useEffect, useState } from "react";
import { getCampaigns } from "@/lib/actions";
import LoadingDots from "./icons/loading-dots";

export default function Campaigns({
  organization,
}: {
  organization: Organization;
}) {
  const [campaigns, setCampaigns] = useState<CampaignWithMedia[] | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const data = await getCampaigns(organization.id);
      setCampaigns(data);
    }
    fetchCampaigns();
  }, [organization.id]);

  if (campaigns == null) {
    return <div><LoadingDots /></div>;
  }

  return (
    <div>
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {campaigns.map((campaign) => (
            <CampaignCard
            {...campaign}
              key={campaign.id}
              campaign={campaign}
              name={campaign.name}
              organization={organization}
            />
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center space-x-4">
          <h1 className="font-cal text-4xl">No Campaigns Yet</h1>
          <Image
            alt="Missing Campaigns"
            src="https://illustrations.popsy.co/gray/web-design.svg"
            width={400}
            height={400}
          />
          <p className="text-lg text-gray-500">
            Create a campaign to fund a project, event, or initiative.
          </p>
        </div>
      )}
    </div>
  );
}

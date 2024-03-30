import Image from "next/image";
import CampaignCard from "./campaign-card";
import { Campaign, Organization } from "@prisma/client";

export default function Campaigns({
  organization,
  campaigns,
}: {
  organization: Organization;
  campaigns: Campaign[];
}) {

  return (
    <div>
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

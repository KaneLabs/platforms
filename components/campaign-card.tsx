import BlurImage from "@/components/blur-image";
import { placeholderBlurhash, random } from "@/lib/utils";
import { Campaign, CampaignMedia, Event, Organization } from "@prisma/client";
import Link from "next/link";

export type CampaignWithMedia = Campaign & { medias: CampaignMedia[] };

export default function CampaignCard({
  campaign,
  organization,
  isPublic
}: {
  campaign: CampaignWithMedia;
  name: string;
  organization: Organization;
  isPublic?: boolean;
}) {
  const campaignImage = campaign.medias && campaign.medias[0] && campaign.medias[0].uri;
  const href = isPublic ? `/campaigns/${campaign.id}` : `/city/${organization.subdomain}/campaigns/${campaign.id}`;

  return (
    <div className="relative rounded-lg border border-gray-200 bg-gray-50 pb-10 shadow-md transition-all hover:shadow-xl dark:border-gray-700 dark:hover:border-white">
      <Link
        href={href}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <BlurImage
          alt={campaign.name ?? "Card thumbnail"}
          className="h-44 object-cover"
          src={campaignImage ?? "/placeholder.png"}
          placeholder="blur"
          blurDataURL={placeholderBlurhash}
          width={800}
          height={400}
        />
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <h3 className="my-0 truncate text-xl font-bold tracking-wide text-gray-800 dark:text-gray-200">
            {campaign.name}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-gray-500 dark:text-gray-400">
            {campaign.content}
          </p>
        </div>
      </Link>
      {!campaign.deployed && (
        <div className="absolute bottom-4 right-4 rounded-md bg-accent-orange px-3 py-0.5 text-sm font-medium text-gray-50 shadow-md">
          Draft
        </div>
      )}
    </div>
  );
}

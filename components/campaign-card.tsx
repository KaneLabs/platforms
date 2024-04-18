import { Campaign, Organization } from "@prisma/client";
import Link from "next/link";
import { AspectRatio } from "./ui/aspect-ratio";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";

const getPlaceholderImage = (campaign: Campaign) => {
  // @ts-ignore
  return undefined;
  // Add your own logic for placeholder images based on form
};

export default function CampaignCard({
  campaign,
  name,
  organization,
  isPublic
}: {
  campaign: Campaign;
  name: string;
  organization: Organization;
  isPublic?: boolean;
}) {
  const campaignImage = getPlaceholderImage(campaign);
  return (
    <Card className="overflow-hidden">
      <Link href={isPublic ? `/campaigns/${campaign.id}` : `/city/${organization.subdomain}/campaigns/${campaign.id}`}>
        <div className="relative h-40 p-6">
          <CardTitle>{campaign.name}</CardTitle>

          {campaignImage ? (
            <div className="w-full">
              <AspectRatio ratio={1 / 1}>
                <Image
                  src={campaignImage}
                  alt={`${campaign.id} card image`}
                  layout="fill"
                />
              </AspectRatio>
            </div>
          ) : null}
          {!campaign.deployed && (
            <span className="absolute bottom-6 right-6 rounded-md border border-gray-350 bg-accent-orange px-3 py-0.5 text-sm font-medium text-gray-50 shadow-md">
              Draft
            </span>
          )}
        </div>
      </Link>
    </Card>
  );
}

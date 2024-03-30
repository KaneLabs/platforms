import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CampaignPublicTiers from "@/components/campaign-public-tiers";

export default async function CheckoutTiersPage({
  params,
}: {
  params: { id: string; subdomain: string };
}) {
  const data = await prisma.campaign.findFirst({
    where: {
      id: params.id,
    },
    include: {
      organization: {
        select: {
          subdomain: true,
        },
      },
    },
  });

  if (!data) {
    notFound();
  }

  return (
    <div>
      <CampaignPublicTiers
        campaignId={params.id}
        subdomain={params.subdomain}
      />
    </div>
  );
}

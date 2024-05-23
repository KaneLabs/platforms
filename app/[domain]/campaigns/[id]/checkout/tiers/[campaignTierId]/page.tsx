import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CampaignPublicTiers from "@/components/campaign-public-tiers";
import { getSession } from "@/lib/auth";
import AuthModalCoverProvider from "@/components/auth-modal-cover-provider";

export default async function CheckoutTiersPage({
  params,
}: {
  params: { id: string; subdomain: string; campaignTierId: string };
}) {
  const session = await getSession();

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
    <AuthModalCoverProvider show={!session}>
      <CampaignPublicTiers
        campaignId={params.id}
        selectedTierId={params.campaignTierId}
        subdomain={params.subdomain}
      />
    </AuthModalCoverProvider>
  );
}

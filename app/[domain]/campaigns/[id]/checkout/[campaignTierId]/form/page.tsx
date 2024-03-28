import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AuthModalCoverProvider from "@/components/auth-modal-cover-provider";
import CampaignPublicForm from "@/components/campaign-public-form";
import { CampaignTierWithData } from "@/components/campaign-public-form";

export default async function CheckoutFormPage({
  params,
}: {
  params: { domain: string; campaignTierId: string };
}) {
  const session = await getSession();

  const campaignTierId = params.campaignTierId;

  const campaignTier = await prisma.campaignTier.findUnique({
    where: {
      id: campaignTierId,
    },
    include: {
      campaign: true,
      Form: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!campaignTier) {
    return notFound();
  }

  return (
    <AuthModalCoverProvider show={!session}>
      <CampaignPublicForm 
        campaignTier={campaignTier as CampaignTierWithData}
      />
    </AuthModalCoverProvider>
  );
}

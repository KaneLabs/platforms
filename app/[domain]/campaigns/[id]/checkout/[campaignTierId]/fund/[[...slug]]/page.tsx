import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import AuthModalCoverProvider from "@/components/auth-modal-cover-provider";
import CampaignPublicCheckoutSummary, { CampaignTierWithData } from "@/components/campaign-public-fund-summary";

export default async function CheckoutFundPage({
  params,
}: {
  params: { domain: string; campaignTierId: string, slug: string[] };
}) {
  const session = await getSession();
  const formResponseId = params.slug && params.slug[0];

  const campaignTier = await prisma.campaignTier.findUnique({
    where: {
      id: params.campaignTierId,
    },
    include: {
      campaign: true,
      Form: {
        include: {
          formResponse: {
            where: {
              id: formResponseId,
              userId: session?.user.id,
            },
            include: {
              answers: {
                include: {
                  question: true
                }
              },
            },
          },
        },
      },
    },
  });

  if (!campaignTier) {
    return notFound();
  }

  return (
    <AuthModalCoverProvider show={!session}>
      <CampaignPublicCheckoutSummary
        campaignTier={campaignTier as CampaignTierWithData}
      />
    </AuthModalCoverProvider>
  );
}

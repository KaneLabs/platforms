import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import AuthModalCoverProvider from "@/components/auth-modal-cover-provider";
import CheckoutSummary from "@/components/campaign-public-fund-summary";

export default async function CheckoutFund({
  params,
}: {
  params: { domain: string; campaignTierId: string };
}) {
  const session = await getSession();

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
      <CheckoutSummary
        campaignTier={campaignTier}
      />
    </AuthModalCoverProvider>
  );
}

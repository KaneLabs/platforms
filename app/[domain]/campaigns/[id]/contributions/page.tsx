import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CampaignPublicContributions from "@/components/campaign-public-contributions";
import AuthModalCoverProvider from "@/components/auth-modal-cover-provider";

export default async function PublicCampaignPage({
  params,
}: {
  params: { id: string; subdomain: string };
}) {
  const session = await getSession();

  const campaignApplication = await prisma.campaignApplication.findFirst({
    where: {
      campaignId: params.id,
      userId: session?.user.id,
    },
    include: {
      campaign: true,
      user: true,
      contribution: true,
      campaignTier: true,
    },
  });

  if (!campaignApplication) {
    notFound();
  }

  return (
    <AuthModalCoverProvider show={!session}>
      <div className="px-24 py-12">
        <CampaignPublicContributions
          campaignApplication={campaignApplication}
        />
      </div>
    </AuthModalCoverProvider>
  );
}

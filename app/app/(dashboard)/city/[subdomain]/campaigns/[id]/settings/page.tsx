import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import notFound from "../../../not-found";
import CampaignEditor from "@/components/campaign-editor";

export default async function CampaignPage({
  params,
}: {
  params: { path: string; subdomain: string; id: string, segment: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: params.id,
    },
    include: {
      organization: true,
      contributions: true,
    },
  });

  if (!campaign || !campaign.organization) {
    return notFound();
  }

  return <CampaignEditor
    campaignId={params.id}
    subdomain={params.subdomain}
    isPublic={false}
    segment={params.segment}
  />
}
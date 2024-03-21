import PaperDoc from "@/components/paper-doc";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import FormTitle from "@/components/form-title";
import DynamicForm from "./dynamic-form";
import AuthModalCoverProvider from "@/components/auth-modal-cover-provider";

export default async function CheckoutPage({
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
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-6">
          <PaperDoc className="mx-auto">
            <FormTitle>{campaignTier.name}</FormTitle>
            {session && campaignTier.Form && (
              <DynamicForm form={campaignTier.Form} onSubmitRoute={`/campaigns/${campaignTier.campaign.id}/checkout/${campaignTier.id}/fund`} />
            )}
          </PaperDoc>
        </div>
      </div>
    </AuthModalCoverProvider>
  );
}

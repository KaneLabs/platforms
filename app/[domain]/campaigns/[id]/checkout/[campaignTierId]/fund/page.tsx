import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import AuthModalCoverProvider from "@/components/auth-modal-cover-provider";
import CampaignTierCard from "@/components/campaign-tier-card";
import { formatAnswer } from "@/components/form-response-table/utils";
import { Button } from "@/components/ui/button";

export default async function CheckoutFund({
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

  let formattedFormAnswers = campaignTier.Form?.formResponse[0].answers.map(
    (value) => {
      const question = value.question;

      return (
        <div key={value.id}>
          <h2 className="text-xl">{question.text}</h2>
          <p className="text-sm">
            {formatAnswer(question!, value)}
          </p>
        </div>
      );
    },
  );

  return (
    <AuthModalCoverProvider show={!session}>
      <div className="flex flex-col min-h-full max-w-lg space-y-4 mx-6 my-6">
        <div>Here’s a summary of your application</div>
        <div className="w-full transform overflow-hidden rounded-2xl bg-gray-500 p-6 text-left align-middle shadow-xl transition-all">
          <div className="mt-2 flex flex-col space-y-6">
            {formattedFormAnswers}
          </div>
          <CampaignTierCard
            tier={campaignTier}
            currency={campaignTier.campaign.currency}
          />
          <div className="text-sm">
            *you can claim your refund if your application isn’t accepted.
          </div>
        </div>
        <div className="self-end ">
          <Button className="hover:bg-gray-700">Continue</Button>
        </div>
      </div>
    </AuthModalCoverProvider>
  );
}

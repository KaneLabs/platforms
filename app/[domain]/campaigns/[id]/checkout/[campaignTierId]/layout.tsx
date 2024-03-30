import { ReactNode } from "react";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CampaignCheckoutNav from "./nav";

export default async function CampaignCheckoutLayout({
  params,
  children,
}: {
  params: { subdomain: string, id: string };
  children: ReactNode;
}) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!campaign) {
    notFound();
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 px-24 py-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-start space-y-2">
          <h1 className="font-serif text-4xl font-semibold dark:text-white">
            Contribute to {campaign.name}
          </h1>
          <h4 className="truncate rounded-md bg-gray-100 py-1 font-medium text-gray-600 transition-colors dark:bg-gray-800 dark:text-gray-400">
            Customize your {campaign.name} experience
          </h4>
        </div>
        <CampaignCheckoutNav />
        {children}
      </div>
    </div>
  );
}
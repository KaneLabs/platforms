import { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CampaignSettingsNav from "./nav";
import { userHasOrgRole } from "@/lib/actions";

const subTextDict: { [key: string]: string; } = {
  basic: "Start with the basic information of your Campaign",
  tiers: "Set your contribution tiers",
  details: "Set parameters for how you want contributions to be made"
}

export default async function CampaignSettingsLayout({
  params,
  children,
}: {
  params: { subdomain: string, editType: string, segment: string };
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const organization = await prisma.organization.findUnique({
    where: {
      subdomain: params.subdomain,
    },
  });

  if (!organization) {
    notFound();
  }

  const userIsAdmin = await userHasOrgRole(
    session.user.id,
    organization?.id,
    "Admin",
  );

  if (!userIsAdmin) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-start space-y-2">
        <h1 className="font-serif text-3xl text-gray-800 font-semibold dark:text-white">
          {params.editType === "create" ? "Create Campaign" : "Edit Campaign"} 
        </h1>
        <h4 className="truncate rounded-md bg-gray-100 py-1 font-medium text-gray-600 transition-colors dark:bg-gray-800 dark:text-gray-400">
          {subTextDict[params.segment]}
        </h4>
      </div>
      <CampaignSettingsNav />
      {children}
    </>
  );
}
import { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CampaignSettingsNav from "./nav";
import { userHasOrgRole } from "@/lib/actions";

export default async function CampaignSettingsLayout({
  params,
  children,
}: {
  params: { subdomain: string, editType: string };
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
      <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
        <h1 className="text-xl dark:text-white sm:text-3xl">
          {params.editType === "create" ? "Create Campaign" : "Edit Campaign"} 
        </h1>
      </div>
      <CampaignSettingsNav />
      {children}
    </>
  );
}
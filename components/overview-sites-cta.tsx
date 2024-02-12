import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CreateOrganizationButton from "./create-organization-button";
import CreateOrganizationModal from "./modal/create-organization";
import Link from "next/link";

export default async function OverviewSitesCTA() {
  const session = await getSession();
  if (!session) {
    return 0;
  }

  const organizations = await prisma.organization.findMany();

  return organizations.length > 0 ? (
    <Link
      href="/cities"
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-gray-100 dark:border-gray-700 dark:hover:border-gray-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-gray-800"
    >
      View My Cities
    </Link>
  ) : (
    <CreateOrganizationButton>
      <CreateOrganizationModal />
    </CreateOrganizationButton>
  );
}

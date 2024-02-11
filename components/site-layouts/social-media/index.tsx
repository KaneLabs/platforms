import { ReactNode, Suspense } from "react";

import { notFound, redirect } from "next/navigation";
import { getSiteData } from "@/lib/fetchers";
import { fontMapper } from "@/styles/fonts";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
// import Drawer from "@/components/drawer";


export default async function SocialMediaSiteLayout({
  params,
  children,
}: {
  params: { domain: string };
  children: ReactNode;
}) {
  const domain = params.domain.replace("%3A", ":");
  const data = await getSiteData(domain);

  if (!data) {
    return notFound();
  }

  // Optional: Redirect to custom domain if it exists
  if (
    domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
    data.customDomain &&
    process.env.REDIRECT_TO_CUSTOM_DOMAIN_IF_EXISTS === "true"
  ) {
    return redirect(`https://${data.customDomain}`);
  }

  return (
    <div className={cn(fontMapper[data.font], "min-h-screen")}>{children}</div>
  );
}

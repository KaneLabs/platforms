import { ReactNode, Suspense } from "react";

import { notFound, redirect } from "next/navigation";
import { getSiteData } from "@/lib/fetchers";
import { fontMapper } from "@/styles/fonts";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import EventsAppLayout from "@/components/site-layouts/events-app";

export async function generateMetadata({
  params,
}: {
  params: { domain: string };
}): Promise<Metadata | null> {
  const domain = params.domain.replace("%3A", ":");
  const data = await getSiteData(domain);
  if (!data) {
    return null;
  }
  const { name, title, description, image, logo } = data as {
    name: string;
    title?: string;
    description: string;
    image: string;
    logo: string;
  };

  return {
    title: title || name,
    description,
    openGraph: {
      title: title || name,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: title || name,
      description,
      images: [image],
      creator: "@vercel",
    },
    icons: [logo],
    metadataBase: new URL(`https://${domain}`),
  };
}

export default async function SiteLayout({
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
    <div className={cn(fontMapper[data.font], "min-h-screen")}>
      <EventsAppLayout>{children}</EventsAppLayout>
    </div>
  );
}

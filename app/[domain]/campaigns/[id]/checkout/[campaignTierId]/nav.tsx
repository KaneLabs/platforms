"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";

export default function CampaignCheckoutNav() {
  const { subdomain, id, campaignTierId } = useParams() as { subdomain: string, id: string, campaignTierId: string };
  const segment = useSelectedLayoutSegment();

  const navItems = [
    {
      name: "Select Tier",
      href: `/campaigns/${id}/checkout/tiers/`,
      segment: "tiers",
      disabled: false
    },
    {
      name: "Questions",
      href: `/campaigns/${id}/checkout/${campaignTierId}/form`,
      segment: "form",
      disabled: true
    },
    {
      name: "Summary",
      href: `/campaigns/${id}/checkout/${campaignTierId}/fund`,
      segment: "fund",
      disabled: true
    },
  ];

  return (
    <div className="flex space-x-4 border-b border-gray-200 pb-4 pt-4 dark:border-gray-700">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "rounded-md px-2 py-1 text-lg font-medium transition-colors active:bg-gray-200 dark:active:bg-gray-600",
            item.disabled 
              ? "pointer-events-none cursor-not-allowed"
              : "",
            segment === item.segment
              ? "text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}

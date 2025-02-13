"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CampaignSettingsNav() {
  const { subdomain, id } = useParams() as { subdomain: string, id: string };

  const navItems = [
    {
      name: "Select Tier",
      href: `/campaigns/${id}/checkout/tiers/`,
      segment: "tiers",
      disabled: false
    },
    {
      name: "Questions",
      href: `/`,
      segment: "form",
      disabled: true
    },
    {
      name: "Summary",
      href: `/`,
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
            "tiers" === item.segment
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

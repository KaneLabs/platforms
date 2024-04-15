"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CampaignSettingsNav() {
  const { subdomain, id, editType, segment } = useParams() as { subdomain: string, id: string, segment: string, editType: string };

  const navItems = [
    {
      name: "Basic",
      href: `/city/${subdomain}/campaigns/${id}/settings/basic/${editType}`,
      segment: "basic",
      disabled: true
    },
    {
      name: "Settings",
      href: `/city/${subdomain}/campaigns/${id}/settings/details/${editType}`,
      segment: "details",
      disabled: true
    },
    {
      name: "Tiers",
      href: `/city/${subdomain}/campaigns/${id}/settings/tiers/${editType}`,
      segment: "tiers",
      disabled: true
    },
  ];

  return (
    <div className="flex space-x-4 border-b border-gray-200 pb-4 pt-2 dark:border-gray-700">
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

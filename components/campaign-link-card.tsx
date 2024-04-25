"use client";

import React from "react";
import { CampaignPageLink } from "@prisma/client";
import { Edit, Link2, Trash2 } from "lucide-react";

export default function CampaignLinkCard({
  link,
  isPublic,
  onClickEdit,
  onClickDelete,
}: {
  link: CampaignPageLink;
  isPublic?: boolean;
  onClickEdit?: () => void;
  onClickDelete?: () => void;
}) {
  return (
    <div
      className={`dark:bg-gray-800 my-4 flex flex-col space-y-4 rounded-lg border bg-gray-100 ${isPublic ? "px-4 py-4" : "px-8 py-6"} transition ease-in-out`}
    >
      <div className="relative">
        <div className="flex flex-row flex-wrap items-start justify-between gap-[20px]">
          <div className={`flex flex-row text-lg font-semibold items-center ${isPublic ? "justify-between w-full" : "gap-2"}`}>
            {link.title}
            <Link2
              className="text-gray-600"
              width={18}
            />
          </div>
          {!isPublic && <div className="flex items-center">
            {onClickEdit && (
              <Edit
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onClickEdit();
                }}
                width={18}
              />
            )}
            {onClickDelete && (
              <Trash2
                className="ml-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onClickDelete();
                }}
                width={18}
              />
            )}
          </div>}
        </div>
        {link.description && (
          <div className="mt-2 flex flex-col space-y-4 text-sm">
            {link.description}
          </div>
        )}
      </div>
    </div>
  );
}

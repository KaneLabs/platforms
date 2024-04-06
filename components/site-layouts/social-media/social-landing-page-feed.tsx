import { Campaign, Event, Organization, Post } from "@prisma/client";
import prisma from "@/lib/prisma";
import PostCard from "../../post-card";
import EventCard from "../../event-card";
import CampaignCard from "../../campaign-card";

function mergeAndSortByDate(events: Event[], docs: Post[], campaigns: Campaign[]) {
  // Merge the two arrays
  const merged = [...events, ...docs, ...campaigns];

  // Sort the merged array by the createdAt property
  const sorted = merged.sort((a, b) => {
    // Ascending order
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return sorted;
}

export default async function SocialLandingPageFeed({
  sitedata,
  params,
}: {
  sitedata: Organization;
  params: { domain: string };
}) {
  const [events, docs, campaigns] = await Promise.all([
    prisma.event.findMany({
      where: {
        organizationId: sitedata.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 3,
    }),
    prisma.post.findMany({
      where: {
        organizationId: sitedata.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 3,
    }),
    prisma.campaign.findMany({
      where: {
        organizationId: sitedata.id,
        deployed: true
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 3
    }),
  ]);

  // Usage
  const feed = mergeAndSortByDate(events, docs, campaigns);

  if (feed.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-20">
      <h4 className="mx-5 mb-3 mt-3 font-bold tracking-tight text-gray-750 dark:text-gray-400 md:my-5 md:text-lg">
        {"Latest"}
      </h4>
      <div className="grid grid-cols-1 gap-2 px-5 md:grid-cols-2 xl:grid-cols-3">
        {feed.map((feedData) => {
          if ("deployed" in feedData) {
            // Handle Campaign
            return (
              <CampaignCard
                key={feedData.id}
                campaign={feedData}
                name={feedData.name}
                organization={sitedata}
                isPublic={true}
              />
            );
          } else if ("content" in feedData) {
            // Handle Post
            return (
              <PostCard
                key={feedData.id}
                data={Object.assign(feedData, { organization: sitedata })}
              />
            );
          } else if ("startingAt" in feedData) {
            // Handle Event
            return (
              <EventCard
                key={feedData.id}
                href={"/" + feedData.path}
                event={Object.assign(feedData, { organization: sitedata })}
              />
            );
          }
        })}
      </div>
    </div>
  );
}

"use client";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { PageViewsData, getCityPageViews } from "@/lib/tinybird";
import KPICardKeyAction from "./kpi-card-key-action";
import { Organization } from "@prisma/client";
import { useEffect, useState } from "react";

export default function PageViewsCardKPI({ org }: { org: Organization }) {
  const [pageViews, setPageViews] = useState<PageViewsData[] | undefined>();

  useEffect(() => {
    setInterval(() => {
      getCityPageViews(org.subdomain as string).then((viewCount) => {
        setPageViews(viewCount);
      });
    }, 5000);
  }, [org.subdomain]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Page Views</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="text-muted-foreground h-4 w-4"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </CardHeader>
      <CardContent>
        <h5 className="text-3xl font-bold">
          {pageViews ? pageViews.reduce((a, v) => v["count()"] + a, 0) : 0}
        </h5>

        <KPICardKeyAction
          title="Build awareness"
          links={[
            {
              href: `/city/${org.subdomain}/docs`,
              display: `Publish your vision`,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

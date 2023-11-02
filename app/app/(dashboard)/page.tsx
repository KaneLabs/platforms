import { Suspense } from "react";
import Organizations from "@/components/organizations";
import OverviewStats from "@/components/overview-stats";
import Posts from "@/components/posts";
import Link from "next/link";
import PlacholderCard from "@/components/placeholder-card";
// import Globe from '@/components/globe'

export default function Overview() {
  return (
    <div className="flex max-w-screen-3xl flex-col space-y-12 p-8">
      <div className="grid grid-flow-col">
        <div className="flex flex-col space-y-6 col-span-1">
          <h1 className="font-serif text-3xl font-light dark:text-white">
            Overview
          </h1>
          <OverviewStats />
        </div>

      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-light text-3xl dark:text-white">
            My Cities
          </h1>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PlacholderCard key={i} />
              ))}
            </div>
          }
        >
          <Organizations limit={4} />
        </Suspense>
      </div>

      <div className="flex flex-col space-y-6">
        <h1 className="font-serif font-light text-3xl dark:text-white">
          Recent Posts
        </h1>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlacholderCard key={i} />
              ))}
            </div>
          }
        >
          <Posts limit={8} />
        </Suspense>
      </div>
    </div>
  );
}

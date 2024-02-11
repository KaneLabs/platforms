"use client";
import Link from "next/link";
import EventListItemImage from "./event-list-item-image";
import { EventFeedEvent, uniqueHosts } from "./event-list";
import { HostedByInline } from "./event-page";
import {
  EventListItemDate,
  EventListItemTime,
} from "./event-list-item-datetime";

export default function EventListItem({
  event,
  href,
  showAnalytics = false,
}: {
  event: EventFeedEvent;
  href?: string;
  showAnalytics?: boolean;
}) {
  if (!event.startingAt) {
    return null;
  }
  const hosts = uniqueHosts(event);
  return (
    <div className="w-full">
      <EventListItemDate startingAt={event.startingAt} />
      <Link
        href={
          href || `/city/${event.organization.subdomain}/events/${event.path}`
        }
      >
        <div className="relative flex  rounded-2xl border border-gray-200 shadow-md  transition-all hover:shadow-xl md:flex-row dark:border-gray-700 dark:hover:border-white">
          <div className="flex flex-1 flex-col text-wrap border-gray-200  py-3 pl-3 dark:border-gray-700">
            <EventListItemTime startingAt={event.startingAt} />
            <h3 className="text-md mb-2 font-medium tracking-wide text-gray-800 md:text-lg dark:text-gray-200">
              {event.name}
            </h3>

            <HostedByInline
              users={Object.values(hosts).map((eventHost) => eventHost)}
            />
          </div>

          <div className="p-3">
            <EventListItemImage
              alt={event.name ?? "Card thumbnail"}
              src={
                event.image
                  ? event.image
                  : event.organization.image
                  ? event.organization.image
                  : "/placeholder.png"
              }
            />
          </div>
        </div>
      </Link>
    </div>
  );
}

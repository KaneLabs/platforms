import { placeholderBlurhash } from "@/lib/utils";
import {
  Event,
  EventPlace,
  Organization,
  Place,
  Role,
  TicketTier,
  User,
  UserRole,
} from "@prisma/client";
import { useMemo } from "react";
import { getTwoLetterPlaceholder } from "@/lib/profile";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { RegistrationCardItems } from "./registration-card-items";
import { MapPin } from "lucide-react";
import BannerImage from "./site-layouts/social-media/banner-image";
import HeaderMainTitle from "./site-layouts/social-media/header-main-title";
import HeaderMainDescription from "./site-layouts/social-media/header-main-description";
import { LineGradient } from "./line-gradient";
import { Button } from "./ui/button";
import { Session } from "next-auth";
import { format } from "date-fns";
import { EventHost } from "./event-list";
import EventSubEvents from "./event-sub-events";
import EventPageTimeDisplay from "./event-page-time-display";

function CalendarView({ startingAt }: { startingAt: Date }) {
  return (
    <div className="flex h-12 w-12 flex-col overflow-hidden rounded-xl border border-gray-300 md:h-12 md:w-12 dark:border-gray-700">
      <div className="flex items-center justify-center bg-gray-300 py-[1px] text-center text-xs font-semibold md:px-4 md:text-sm dark:bg-gray-700 dark:text-gray-100">
        {format(startingAt, "MMM")}
      </div>
      <div className="md:text-md text-md flex flex-1 items-center justify-center px-2 text-center font-bold md:px-4">
        {format(startingAt, "d")}
      </div>
    </div>
  );
}

type LocationDisplayProps = {
  place: Place;
};

function LocationDisplay({ place }: LocationDisplayProps) {
  const content = (
    <div className="my-0">
      <div className="space-x-2">
        <span className="text-md font-semibold tracking-tight text-gray-900 lg:text-lg dark:text-gray-100">
          {place.name}
        </span>
        {place.googlePlaceId ? <span>↗</span> : null}
      </div>
      <div className="flex flex-col">
        <div className="lg:text-md text-sm font-medium text-gray-750 dark:text-gray-250">
          {place.address1}
        </div>
        {place.address2 && (
          <div className="lg:text-md text-sm font-medium text-gray-750 dark:text-gray-250">
            {place.address2}
          </div>
        )}
      </div>
    </div>
  );
  if (place?.googlePlaceId) {
    const href = `https://www.google.com/maps/search/?api=1&query=${place.address1}&query_place_id=${place.googlePlaceId}`;

    return (
      <a href={href} target="_blank" rel="nofollow noopener">
        {content}
      </a>
    );
  }

  return content;
}

type RolesAndUsers = {
  user: User;
  role: Role;
} & UserRole;

export function HostUser({ user }: { user: User }) {
  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        {user?.image ? <AvatarImage src={user.image} /> : null}
        <AvatarFallback>{getTwoLetterPlaceholder(user)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-md font-semibold leading-none">{user.name}</p>
      </div>
    </div>
  );
}

export function HostsCard({
  hostUsers,
  userIsHost,
  settingsUrl,
}: {
  hostUsers: RolesAndUsers[];
  userIsHost?: boolean;
  settingsUrl?: string;
}) {
  return (
    <div>
      <CardHeader>
        <CardTitle>Hosted by</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {hostUsers.map((hostUser) => (
          <HostUser key={hostUser.id} user={hostUser.user} />
        ))}
      </CardContent>
      {userIsHost && settingsUrl ? (
        <CardFooter className="flex items-center justify-between">
          <span className="mr-2">You are a host</span>
          <Button asChild>
            <Link href={settingsUrl}>Event Settings</Link>
          </Button>
        </CardFooter>
      ) : null}
      <LineGradient />
    </div>
  );
}

export function HostedByInline({ users }: { users: EventHost[] }) {
  return (
    <div className={"md:text-md flex items-center text-sm font-medium"}>
      <div className="flex -space-x-2">
        {users.map((hostUser) => {
          if (hostUser.image) {
            return (
              <Avatar
                className={
                  "h-8 w-8 border border-gray-500 md:h-9 md:w-9 dark:border-gray-400"
                }
                key={hostUser.id}
              >
                <AvatarImage src={hostUser.image} />
              </Avatar>
            );
          }
          return null;
        })}
      </div>
      <span className="ml-2 mr-1 md:ml-2">By </span>
      <div className="flex flex-wrap space-x-1">
        {users.map((hostUser, index) => (
          <span key={hostUser.id}>
            {hostUser.name}
            {index < users.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AboutCard({ event }: { event: Event }) {
  console.log("event.description", event.description);
  return (
    <div>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <HeaderMainDescription>
          {event?.description ? event.description : undefined}
        </HeaderMainDescription>
      </CardContent>
    </div>
  );
}

type RegistrationCardProps = {
  ticketTiers: (TicketTier & { role: Role; _count: { tickets: number } })[];
  event: Event & { organization: Organization };
};

export function RegistrationCard({
  ticketTiers,
  event,
}: RegistrationCardProps) {
  if (!ticketTiers || !(ticketTiers.length > 0)) {
    return null;
  }
  const TitleCopy = (() => {

    if (!ticketTiers || !(ticketTiers.length > 0)) {
      return "Registration options are not yet public";
    }

    return "Registration Options";
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{TitleCopy}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ticketTiers.map((ticketTier) => (
          <RegistrationCardItems
            key={ticketTier.id}
            ticketTier={ticketTier}
            event={event}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function isUserHost(
  userId: string,
  hostUsers: RolesAndUsers[],
): boolean {
  console.log("userId: ", userId, hostUsers);
  return hostUsers.some((hostUser) => hostUser.user.id === userId);
}

type EventAndContext = Event & {
  organization: Organization;
  eventPlaces: (EventPlace & { place: Place })[];
};

export default function EventPage({
  event,
  rolesAndUsers,
  ticketTiers,
  userSession,
}: {
  event: EventAndContext;
  rolesAndUsers: RolesAndUsers[];
  ticketTiers: (TicketTier & { role: Role; _count: { tickets: number } })[];
  userSession?: Session;
}) {

  const hostUsers = useMemo(
    () => rolesAndUsers.filter((ru) => ru.role.name === "Host"),
    [rolesAndUsers],
  );

  const userIsHost = userSession
    ? isUserHost(userSession.user.id, hostUsers)
    : false;

  return (
    <>
      <div className="h-14 w-full" />
      <div className="relative flex w-full  max-w-5xl flex-col items-center  md:space-y-6 md:px-8">
        <BannerImage
          alt={event.name ?? "Event thumbnail"}
          src={event.image ?? "/placeholder.png"}
          blurDataURL={event.imageBlurhash ?? placeholderBlurhash}
        />
        <div className="w-full">
          <div className="flex flex-col items-start">
            <div className="my-2 px-4 md:px-6">
              <HeaderMainTitle>{event.name}</HeaderMainTitle>
              <HostedByInline users={hostUsers.map(({ user }) => user)} />
            </div>

            <div className="flex w-full flex-col space-y-6 p-4 md:my-0 md:flex-row md:space-y-0 md:px-6 md:pb-4">
              {event.startingAt && event.endingAt && (
                <div className="flex flex-1 space-x-4">
                  <CalendarView startingAt={event.startingAt} />
                  <EventPageTimeDisplay
                    startingAt={event.startingAt}
                    endingAt={event.endingAt}
                  />
                </div>
              )}
              {event.eventPlaces.length > 0 ? (
                <div className="flex flex-1 space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 md:h-12 md:w-12 dark:border-gray-700">
                    <MapPin className="stroke-gray-800 dark:stroke-gray-200" />
                  </div>
                  <LocationDisplay
                    key={
                      event.eventPlaces[event.eventPlaces.length - 1].place.id
                    }
                    place={
                      event.eventPlaces[event.eventPlaces.length - 1].place
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mx-auto grid w-full grid-cols-1 md:gap-6 lg:grid-cols-3">
          <div className="col-span-1 mx-auto flex w-full flex-col lg:col-span-2">
            <AboutCard event={event} />
            <EventSubEvents
              event={event}
              org={event.organization}
              places={event.eventPlaces.map(({ place }) => place)}
              userIsHost={userIsHost}
            />
          </div>
          <div className="col-span-1 space-y-6">
            <HostsCard
              hostUsers={hostUsers}
              userIsHost={userIsHost}
              settingsUrl={`/${event.path}/settings`}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function EventPageOrganization({ org }: { org: Organization }) {
  return (
    <div className="mt-2 flex items-center space-x-3">
      <Avatar className="h-5 w-5">
        {org?.logo ? <AvatarImage src={org.logo} /> : null}
      </Avatar>
      <h3 className="font-medium uppercase">{org.name}</h3>
    </div>
  );
}

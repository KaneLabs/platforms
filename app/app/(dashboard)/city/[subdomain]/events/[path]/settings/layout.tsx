import { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EventSettingsNav from "./nav";
import { getUserEventRoles, userHasOrgRole } from "@/lib/actions";

export default async function EventSettingsLayout({
  params,
  children,
}: {
  params: { subdomain: string, path: string };
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const event = await prisma.event.findFirst({
    where: {
      path: params.path,
    },
    include: {
      organization: true
    }
  });

  console.log('Event Settings', event)

  if (!event) {
    notFound();
  }

  const userEventRoles = await getUserEventRoles(session.user.id, event.id);

  const isHost = userEventRoles.findIndex(eventRole => eventRole.role.name === 'Host') > -1;


  if (!isHost) {
    notFound();
  }
  if (!event) {
    notFound();
  }

  const url = `${event.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${event.path}`;


  return (
    <>
      <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
        <h1 className="font-cal text-xl font-bold dark:text-white sm:text-3xl">
          Settings for {event.name}
        </h1>
        <a
          href={
            process.env.NEXT_PUBLIC_VERCEL_ENV
              ? `https://${url}`
              : `http://${event.organization.subdomain}.localhost:3000/${event.path}`
          }
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-brand-gray100 px-2 py-1 text-sm font-medium text-brand-gray600 transition-colors hover:bg-brand-gray200 dark:bg-brand-gray800 dark:text-brand-gray400 dark:hover:bg-brand-gray700"
        >
          {url} ↗
        </a>
      </div>
      <EventSettingsNav />
      {children}
    </>
  );
}

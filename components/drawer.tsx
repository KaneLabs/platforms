"use client";

import {
  ArrowLeft,
  BarChart3,
  Edit3,
  Ticket,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings,
  Users,
  Users2,
  ClipboardSignature,
  BedSingle,
  Home,
  Building,
  Building2,
  FileSymlink,
  CircleDollarSign,
} from "lucide-react";

import { Drama } from "./icons/drama";

import {
  useParams,
  usePathname,
  useSelectedLayoutSegments,
} from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  getOrganizationFromPostId,
  getUsersOrganizations,
} from "@/lib/actions";
import DrawerPaper from "./drawer-paper";
import DrawerLink from "./drawer-link";
import { useSession } from "next-auth/react";
import { Organization, Role } from "@prisma/client";
import CitySwitcher from "./city-switcher";
import { SessionData } from "@/lib/auth";

export type UsersUniqueOrgsWithRolesRecord = Record<
  string,
  {
    organization: Organization;
    roles: Role[];
  }
>;

export default function Drawer({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const { subdomain, path, formId } = useParams() as {
    subdomain?: string;
    path?: string;
    formId?: string;
  };

  const [organizationSubdomain, setOrganizationSubdomain] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (segments[0] === "post" && subdomain) {
      getOrganizationFromPostId(subdomain).then((subdomain) => {
        setOrganizationSubdomain(subdomain);
      });
    }
  }, [segments, subdomain]);

  const { data: session } = useSession();

  const [usersOrgs, setUsersOrgs] =
    useState<UsersUniqueOrgsWithRolesRecord | null>(null);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as SessionData["user"];
      if (user?.id) {
        getUsersOrganizations(user.id).then((userOrgs) => {
          setUsersOrgs(userOrgs);
        });
      }
    }
  }, [session?.user]);

  const tabs = useMemo(() => {
    // Event drawer
    if (segments?.[2] === "events" && subdomain && path) {
      return [
        {
          name:
            "Back to " + subdomain.charAt(0).toUpperCase() + subdomain.slice(1),
          href: `/city/${subdomain}`,
          icon: <ArrowLeft width={18} />,
        },
        {
          name: "Overview ",
          href: `/city/${subdomain}/events/${path}`,
          icon: <LayoutDashboard width={18} />,
        },
        {
          name: "Event Roles",
          href: `/city/${subdomain}/events/${path}/roles`,
          icon: <Drama className="w-[18px]" />,
        },
        {
          name: "Event Tickets",
          href: `/city/${subdomain}/events/${path}/tickets`,
          icon: <Ticket width={18} />,
        },
        {
          name: "Event Page",
          href: `/city/${subdomain}/events/${path}/preview`,
          icon: <FileSymlink width={18} />,
        },
        {
          name: "Settings",
          href: `/city/${subdomain}/events/${segments[3]}/settings`,
          isActive: segments.includes("settings"),
          icon: <Settings width={18} />,
        },
      ];
    }
    // City Drawer
    if (segments[0] === "city" && subdomain) {
      return [
        {
          name: "Overview",
          href: "/city/" + subdomain,
          isActive: segments.length === 2,
          icon: <LayoutDashboard width={18} />,
        },
        {
          name: "Campaigns",
          href: `/city/${subdomain}/campaigns`,
          isActive: segments.includes("campaigns"),
          icon: <CircleDollarSign width={18} />,
        },
        {
          name: "People",
          href: `/city/${subdomain}/people`,
          isActive: segments.includes("people"),
          icon: <Users2 width={18} />,
        },
        {
          name: "Roles",
          href: `/city/${subdomain}/roles`,
          icon: <Drama className="w-[18px]" />,
        },
        {
          name: "Events",
          href: `/city/${subdomain}/events`,
          isActive: segments.includes("events"),
          icon: <Ticket width={18} />,
        },
        {
          name: "Places",
          href: `/city/${subdomain}/places`,
          isActive: segments.includes("places"),
          icon: <Building2 width={18} />,
        },
        {
          name: "Forms",
          href: `/city/${subdomain}/forms`,
          isActive: segments.includes("forms"),
          icon: <ClipboardSignature width={18} />,
        },
        {
          name: "Docs",
          href: `/city/${subdomain}/docs`,
          isActive: segments.includes("docs"),
          icon: <Newspaper width={18} />,
        },
        {
          name: "Settings",
          href: `/city/${subdomain}/settings`,
          isActive: segments.includes("settings") && segments.length <= 3,
          icon: <Settings width={18} />,
        },
      ];
    } else if (segments[0] === "post" && subdomain) {
      return [
        {
          name: "Back to All Posts",
          href: organizationSubdomain
            ? `/city/${organizationSubdomain}`
            : "/cities",
          icon: <ArrowLeft width={18} />,
        },
        {
          name: "Editor",
          href: `/docs/${subdomain}`,
          isActive: segments.length === 2,
          icon: <Edit3 width={18} />,
        },
        {
          name: "Settings",
          href: `/docs/${subdomain}/settings`,
          isActive: segments.includes("settings"),
          icon: <Settings width={18} />,
        },
      ];
    }
    return [
      {
        name: "Overview",
        href: "/",
        isActive: segments.length === 0,
        icon: <LayoutDashboard width={18} />,
      },
    ];
  }, [segments, subdomain, path, organizationSubdomain]);

  const [showSidebar, setShowSidebar] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // hide sidebar on path change
    setShowSidebar(false);
  }, [pathname]);

  // completely hide
  if (formId) {
    return null;
  }

  return (
    <>
      <button
        className={`fixed z-20 ${
          // left align for Editor, right align for other pages
          segments[0] === "post" && segments.length === 2 && !showSidebar
            ? "left-5 top-5"
            : "right-5 top-7"
        } sm:hidden`}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <Menu width={20} />
      </button>
      <DrawerPaper showSidebar={showSidebar}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <CitySwitcher usersOrgs={usersOrgs} />

            {tabs.map(({ name, href, isActive, icon }) => (
              <DrawerLink
                key={name}
                name={name}
                href={href}
                icon={icon}
                isActive={isActive ? true : false}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
          {children}
        </div>
      </DrawerPaper>
    </>
  );
}

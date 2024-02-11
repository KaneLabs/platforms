import LoginButton from "@/components/auth-modal/login-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSession } from "@/lib/auth";
import { getTwoLetterPlaceholder, getUsername } from "@/lib/profile";
import UserNavLogout from "./user-nav-logout";
import Link from "next/link";

export default async function UserNav() {
  const session = await getSession();
  if (!session) {
    return <Link href="/login" className="p-1 md:p-5">Sign In</Link>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 p-0 rounded-full">
          <Avatar className="bg-gray-600 h-8 w-8 rounded-full">
            {session?.user?.image ? (
              <AvatarImage
                src={session?.user?.image}
                alt={`@${getUsername(session.user)}`}
              />
            ) : null}
            <AvatarFallback>
              {getTwoLetterPlaceholder(session.user)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <UserNavLogout />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

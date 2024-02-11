import Image from "next/image";
import Link from "next/link";
import UserNav from "./user-nav";

export default async function SiteNav({
  params,
}: {
  params: { domain: string };
}) {

  return (
    <>
      <nav className="ease fixed left-0 right-0 top-0 z-10 flex h-16  bg-gray-100/50 backdrop-blur-xl transition-all duration-150 dark:border-b-0 dark:border-gray-700 dark:bg-gray-900/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-2.5">
          <div />
          <div className="flex">
          </div>
          <div className="absolute right-5 md:right-8 flex justify-center items-center">
            <UserNav />
          </div>
        </div>
      </nav>
      <div className="h-16 w-full"></div>
    </>
  );
}

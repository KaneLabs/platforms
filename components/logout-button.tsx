"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-lg p-1.5 text-gray-700 transition-all duration-150 ease-in-out hover:bg-gray-50/90 active:bg-gray-50/20 dark:text-white dark:hover:bg-gray-700 dark:active:bg-gray-800"
    >
      <LogOut width={18} />
    </button>
  );
}

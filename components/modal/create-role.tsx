"use client";

import { toast } from "sonner";
import { createEventRole, createOrgRole } from "@/lib/actions";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "./provider";
import { useState } from "react";
import { Role } from "@prisma/client";
import FormButton from "./form-button";
import { track } from "@/lib/analytics";

export default function CreateRoleModal() {
  const router = useRouter();
  const modal = useModal();
  const { subdomain, path } = useParams() as {
    subdomain: string;
    path?: string;
  };

  const [data, setData] = useState({
    name: "",
    description: "",
  });

  return (
    <form
      action={async (data: FormData) => {
        if (path) {
          createEventRole(data, { params: { subdomain, path } }, null).then(
            (res: Role | { error: string }) => {
              if ("error" in res && res.error) {
                toast.error(res.error);
              } else {
                toast.success(`Successfully created role!`);
                const role = res as Role;
                modal?.hide();
                router.refresh();
              }
            },
          );
        } else {
          createOrgRole(data, { params: { subdomain } }, null).then(
            (res: Role | { error: string }) => {
              if ("error" in res && res.error) {
                toast.error(res.error);
              } else {
                const role = res as Role;
                toast.success(`Successfully created role!`);

                modal?.hide();

                router.refresh();
              }
            },
          );
        }
      }}
      className="w-full rounded-md bg-gray-50/50 backdrop-blur-xl  dark:bg-gray-900/50 md:max-w-md md:border md:border-gray-200 md:shadow dark:md:border-gray-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <div>
          <h2 className="font-serif text-2xl dark:text-gray-100">
            Create a new role
          </h2>
          <p className=" dark:text-gray-100">
            Roles grant people access rights to a city.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Role Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="Speaker"
            autoFocus
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            maxLength={32}
            required
            className="w-full rounded-md border border-gray-700 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-700 dark:focus:ring-gray-100"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Description
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            maxLength={140}
            rows={3}
            className="w-full rounded-md border border-gray-700 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-700 focus:border-gray-900  focus:outline-none focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-700 dark:focus:ring-gray-100"
          />
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-gray-700 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 md:px-10">
        <FormButton text={"Create Role"} />
      </div>
    </form>
  );
}

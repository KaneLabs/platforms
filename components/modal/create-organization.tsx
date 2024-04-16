"use client";

import { toast } from "sonner";
import { createOrganization } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "./provider";
import va from "@vercel/analytics";
import { useEffect, useState } from "react";
import { Organization } from "@prisma/client";
import PrimaryButton from "../buttons/primary-button";
import FormButton from "./form-button";
import { track } from "@/lib/analytics";

export default function CreateOrganizationModal() {
  const router = useRouter();
  const modal = useModal();

  const [data, setData] = useState({
    name: "",
    subdomain: "",
    description: "",
  });

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      subdomain: prev.name
        .toLowerCase()
        .trim()
        .replace(/[\W_]+/g, "-"),
    }));
  }, [data.name]);

  return (
    <form
      action={async (data: FormData) =>
        createOrganization(data).then(
          (res: Organization | { error: string }) => {
            if ("error" in res && res.error) {
              toast.error(res.error);
            } else {
              const { imageBlurhash, createdAt, updatedAt, ...rest } =
                res as Organization;

              const { id, subdomain, name } = res as Organization;
              router.refresh();
              router.push(`/city/${subdomain}`);
              modal?.hide();
              toast.success(`Successfully created ${name}!`);
            }
          },
        )
      }
      className="w-full rounded-md bg-gray-200/50 backdrop-blur-xl  dark:bg-gray-900/50 md:max-w-md md:border md:border-gray-400 md:shadow dark:md:border-gray-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-serif text-2xl text-gray-750 dark:text-gray-100">
          Create a new organization
        </h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Organization Name
          </label>
          <input
            name="name"
            type="text"
            autoFocus
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            maxLength={32}
            required
            className="w-full rounded-md border border-gray-700 bg-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-700 dark:focus:ring-gray-100"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="subdomain"
            className="text-sm font-medium text-gray-700 dark:text-gray-400"
          >
            Subdomain
          </label>
          <div className="flex w-full max-w-md">
            <input
              name="subdomain"
              type="text"
              value={data.subdomain}
              onChange={(e) => setData({ ...data, subdomain: e.target.value })}
              autoCapitalize="off"
              pattern="[a-zA-Z0-9\-]+" // only allow lowercase letters, numbers, and dashes
              maxLength={32}
              required
              className="w-full rounded-l-lg border border-gray-700 bg-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-700 focus:border-gray-900 focus:outline-none focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-700 dark:focus:ring-gray-100"
            />
            <div className="flex items-center rounded-r-lg border border-l-0 border-gray-700 bg-gray-800 px-3 text-sm font-medium text-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
              .{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
            </div>
          </div>
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
            placeholder=""
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            maxLength={140}
            rows={3}
            className="w-full rounded-md border border-gray-700 bg-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-700 focus:border-gray-900  focus:outline-none focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-700 dark:focus:ring-gray-100"
          />
        </div>
        <div className="rounded-md text-sm font-medium text-gray-700 transition-colors">
          All your organization properties, campaigns and events will be collected on this page.
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-gray-700 bg-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800 md:px-10">
        <FormButton text={"Create Organization"} />
      </div>
    </form>
  );
}

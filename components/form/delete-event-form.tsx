"use client";

import LoadingDots from "@/components/icons/loading-dots";
import { cn, getSubdomainFromDomain } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { deleteEvent } from "@/lib/actions";

export default function DeleteEventForm({ eventName }: { eventName: string }) {
  const params = useParams() as { subdomain?: string, domain?: string, path: string };

  const subdomain = params.domain ? getSubdomainFromDomain( params.domain) : params.subdomain as string;
  const path = params.path;

  const router = useRouter();
  return (
    <form
      action={async (data: FormData) =>
        window.confirm("Are you sure you want to delete your event?") &&
        deleteEvent(data, { params: {subdomain, path} }, "delete")
          .then(async (res) => {
            if (res.error) {
              toast.error(res.error);
            } else {
              router.refresh();
              router.back();
              toast.success(`Successfully deleted event!`);
            }
          })
          .catch((err: Error) => toast.error(err.message))
      }
      className="rounded-lg border border-accent-red bg-gray-50 dark:bg-gray-900"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-gray-50">Delete Event</h2>
        <p className="text-sm text-gray-750 dark:text-gray-300">
          Deletes your event and everything associated with it. Type in <b>delete</b> to confirm.
        </p>

        <input
          name="confirm"
          type="text"
          required
          pattern={"delete"}
          placeholder={`delete`}
          className="w-full max-w-md rounded-md border border-gray-300 text-sm text-gray-900 placeholder-gray-600 focus:border-gray-500 focus:outline-none focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-50 dark:placeholder-gray-500"
        />
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
        <p className="text-center text-sm text-gray-750 dark:text-gray-300">
          This action is irreversible. Please proceed with caution.
        </p>
        <div className="w-32">
          <FormButton />
        </div>
      </div>
    </form>
  );
}

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
        pending
          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          : "border-accent-red bg-accent-red text-gray-50 hover:bg-gray-50 hover:text-accent-red dark:hover:bg-transparent",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Confirm Delete</p>}
    </button>
  );
}

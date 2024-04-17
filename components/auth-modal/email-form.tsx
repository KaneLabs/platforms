"use client";
import { FormHTMLAttributes, DetailedHTMLProps } from "react";
import LoadingDots from "@/components/icons/loading-dots";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import PrimaryButton from "../buttons/primary-button";
import { MailIcon } from "lucide-react";

interface EmailFormProps
  extends DetailedHTMLProps<
    FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  > {
  loading: boolean;
}

export default function EmailForm({ loading, ...props }: EmailFormProps) {
  return (
    <form
      {...props}
      className="mb-8 mt-4 flex w-full max-w-md flex-col rounded px-6 py-1"
    >
      <Input
        id="email"
        className="w-full rounded border border-gray-700 bg-transparent p-2 text-gray-800 transition-all duration-200 placeholder:text-gray-700 hover:border-gray-700/40 focus:border-gray-700/50 focus:border-gray-700/50 dark:border-gray-300 placeholder:dark:text-gray-400"
        placeholder="you@your.city"
        name="email"
        required
      />
      <PrimaryButton
        disabled={loading}
        loading={loading}
        type="submit"
        className="group mt-5"
      >
        {loading ? (
          <div>
            <LoadingDots color="rgb(242 237 229)" />
          </div>
        ) : (
          <div className="flex items-center">
            <MailIcon width={16} />
            <span className="mx-2">{"Send Magic Link"}</span>
          </div>
        )}
      </PrimaryButton>
    </form>
  );
}

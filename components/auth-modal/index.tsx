"use client";
import Siwe from "@/components/siwe";
import EmailForm from "./email-form";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import ConnectPassportButton from "../buttons/ConnectPassportButton";
import { LineGradient } from "../line-gradient";
import { VerificationStep } from "./code-verification";

const steps = ["email", "verify", "siwe"];
export default function AuthModal({
  callbackUrl,
  redirect = false,
}: {
  callbackUrl?: string;
  redirect?: boolean;
}) {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
 
  const [state, setState] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const nextStep = () => {
    setState((prev) => prev + 1);
  };

  const onEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // get email from form
    e.preventDefault();
    setLoading(true);
    const email = (e.target as HTMLFormElement).email.value;
    const response = await signIn("email", {
      email: email,
      callbackUrl,
      redirect,
    });
    if (response?.ok) {
      nextStep();
      setVerifiedEmail(email);
    }
  };

  if (steps[state] === "verify") {
    return (
      <div>
        <VerificationStep email={verifiedEmail} callbackUrl={callbackUrl} />
      </div>
    );
  }

  return (
    <div className="dark:border-gray-750 dark:bg-gray-900/80 mx-auto w-full max-w-[420px] rounded-md border  border-gray-200 bg-gray-50/80 p-2 py-6 shadow backdrop-blur-lg md:max-w-md md:border">
       {error && (
        <div className="mx-6 mt-4">
          <p className="text-xs md:text-sm text-red-500 dark:text-red-400">
            {error} failed. Please try again.
          </p>
        </div>
      )}
      <div className="mx-6">
        <h1 className="dark:text-gray-50 mb-3 mt-2 font-serif text-2xl font-light md:text-3xl">
          {steps[state] === "email" && "It's time to build new cities"}
        </h1>
        <p className="dark:text-gray-200 mt-3 text-sm font-medium text-gray-700">
          {steps[state] === "email" && "Enter your email to continue."}
        </p>
      </div>
      <div className="mx-auto mt-4 w-full">
        {steps[state] === "email" && (
          <EmailForm onSubmit={onEmailSubmit} loading={loading} />
        )}
      </div>
      {steps[state] === "email" && (
        <div className="relative flex w-full items-center px-6 py-0">
          <LineGradient />
          <div className="px-3">
            <span className=" dark:text-gray-400 font-mono text-xs font-semibold uppercase tracking-widest text-gray-700">
              {"OR"}
            </span>
          </div>
          <LineGradient />
        </div>
      )}
      <div>
        <div className="mx-6 mt-4">
          {steps[state] === "email" && (
            <p className="dark:text-gray-200 text-sm font-medium text-gray-700">
              {`Sign in with your Zero-Knowledge Passport.`}
            </p>
          )}
          <div className="mb-8 mt-6">
            {steps[state] === "email" && (
              <ConnectPassportButton
                className="w-full"
                callbackUrl={callbackUrl}
              >
                Sign in with ZuPass
              </ConnectPassportButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

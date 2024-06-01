import React, { KeyboardEvent, useCallback, useState, useRef } from "react";
import PrimaryButton from "../buttons/primary-button";
import { Input } from "../ui/input";
import LoadingDots from "../icons/loading-dots";
import { ShieldCheckIcon } from "lucide-react";

interface VerificationStepProps {
  email: string;
  callbackUrl?: string;
}

export const VerificationStep: React.FC<VerificationStepProps> = ({
  email,
  callbackUrl,
}) => {
  const [codeDigits, setCodeDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateCodeDigits = (index: number, value: string) => {
    const newCodeDigits = [...codeDigits];
    newCodeDigits[index] = value.slice(-1); // take only the latest character
    setCodeDigits(newCodeDigits);

    if (value) {
      const nextIndex = index + 1;
      if (nextIndex < inputRefs.current.length) {
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const onReady = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      const code = codeDigits.join("");
      window.location.href = `/api/auth/callback/email?email=${encodeURIComponent(
        email,
      )}&token=${code}${
        callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
      }`;
    },
    [callbackUrl, codeDigits, email],
  );

  // Handle key press for backspace navigation
  const handleBackspace = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !codeDigits[index]) {
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        inputRefs.current[prevIndex]?.focus();
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-md border border-gray-200 bg-gray-50/80 p-2 py-6 shadow backdrop-blur-lg">
      <div className="mx-6">
        <h2 className="mb-3 mt-2 font-serif text-2xl font-light md:text-3xl">
          Verify Email
        </h2>
        <p className="text-sm font-medium text-gray-700">
          Insert the pass code you received on your email.
        </p>
        <div className="mt-4">
          <form
            onSubmit={onReady}
            className="mb-8 mt-4 flex w-full max-w-md flex-col rounded py-1"
          >
            <div className="flex space-x-5">
              {codeDigits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)} // Assign ref to each input
                  name={`digit${index + 1}`}
                  type="text"
                  maxLength={1}
                  autoFocus={index === 0}
                  value={digit}
                  onChange={(e) => updateCodeDigits(index, e.target.value)}
                  onKeyDown={(e) => handleBackspace(index, e)}
                  className="dark:border-gray-600 dark:text-gray-200 h-20 w-20 rounded-lg border-2 border-gray-300 bg-transparent text-center text-4xl focus:outline-none"
                  pattern="\d*" // Ensure mobile keyboards default to number pad
                />
              ))}
            </div>
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
                  <ShieldCheckIcon width={16} />
                  <span className="mx-2">{"Verify"}</span>
                </div>
              )}
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
};

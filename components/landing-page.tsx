"use client";

import dynamic from "next/dynamic";
import { ChangeEvent, Suspense, useState } from "react";
import { createEmailSubscriber } from "@/lib/actions";
import { Button } from "./ui/button";
import PrimaryOutlineButton from "./buttons/primary-outline-button";
import { useModal } from "./modal/provider";
import Link from "next/link";
import JoinACityModal from "./modal/join-a-city";
import FoundACityModal from "./modal/found-a-city";
import LandingPageNav from "./landing-page-nav";
import OutlineButton from "./buttons/outline-button";
import LandingPageFooter from "./landing-page-footer";

const Globe = dynamic(() => import("./globe"), { ssr: false });
// const ThreeGlobe = dynamic(() => import("./three-globe/index"), { ssr: false });

const LandingPage = () => {
  // const [email, setEmail] = useState("");
  // const [submittedEmail, setSubmittedEmail] = useState(false);

  const modal = useModal();

  // const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setEmail(e.target.value);
  // };

  // const handleSubmit = () => {
  //   if (email.trim() !== "") {
  //     // createEmailSubscriber(email);
  //     createEmailSubscriber(email);
  //     setSubmittedEmail(true);
  //   }
  // };

  const openJoinACity = () => {
    modal?.show(<JoinACityModal />);
  };

  const openFoundACity = () => {
    modal?.show(<FoundACityModal />);
  };

  return (
    <>
      <LandingPageNav />

      <div className="min-w-screen flex min-h-screen flex-col bg-gray-900 pt-[6rem]">
        <div className="flex w-full flex-col items-center justify-center p-6 md:p-8 lg:p-10">
          <h1 className="text-center font-serif text-4xl  font-extralight leading-snug text-gray-200 md:text-5xl lg:text-6xl xl:text-6xl">
            <span>{"Launch, Fund, & Grow"}</span>
            <br />
            <span>Your Startup City</span>
          </h1>
          <p className="lg:text-md mt-4 max-w-xl text-center font-sans text-lg leading-normal text-gray-200 md:mt-6 md:text-xl lg:mt-8 lg:max-w-xl xl:max-w-2xl">
            Fora helps you crowdfund, collaborate, and attract great residents.
          </p>

          {/* <p className="lg:text-md mt-4 max-w-xl text-center font-sans text-lg leading-normal text-gray-200 md:mt-6 md:text-xl lg:mt-8 lg:max-w-xl xl:max-w-xl">
            Built by a network of startup city operators, investors, and
            citizens.
          </p> */}

          <div className="mb-6 mt-4">
            {/* <Link href={`${process.env.NEXTAUTH_URL}/login`}>
              <PrimaryOutlineButton>Start your city</PrimaryOutlineButton>
            </Link> */}
          </div>
          <div className="flex space-x-8">
            <OutlineButton onClick={()=> window.open("https://www.fora.city", "_blank")}>Join a city</OutlineButton>
            <PrimaryOutlineButton onClick={openFoundACity}>
              Found a city
            </PrimaryOutlineButton>
          </div>
          {/* <div>
            {submittedEmail ? (
              <p>Thanks!</p>
            ) : (
              <div className="flex items-center">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="mr-6 h-10 w-full rounded border border-gray-800 bg-transparent px-3 py-2 text-gray-200 transition-all duration-200 placeholder:text-gray-700 hover:border-brand-primary/40 focus:border-brand-primary/50 focus:ring-brand-primary/50 dark:border-gray-300 placeholder:dark:text-gray-600"
                  placeholder="Email"
                  name="email"
                  required
                />
                <button
                  type="submit"
                  className="group flex h-10 w-full items-center justify-center rounded border border-gray-300/30 p-2 px-4 font-semibold text-gray-200 transition-colors duration-200 hover:border-brand-primary/60 hover:text-brand-primary/60"
                  onClick={handleSubmit}
                >
                  Stay posted
                </button>
              </div>
            )}
          </div> */}
        </div>
        <div className="flex min-h-[900px] w-full flex-col items-center overflow-hidden">
          <Suspense>
            <>
              <Globe />
              {/* <ChevronDown className="mx-auto h-8 w-8 stroke-gray-200" /> */}
            </>
          </Suspense>
        </div>
        {/* <HowItWorks /> */}
      </div>
      <LandingPageFooter />
    </>
  );
};

export default LandingPage;

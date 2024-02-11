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

const LandingPage = () => {

  const modal = useModal();

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

          <div className="mb-6 mt-4">
          </div>
          <div className="flex space-x-8">
            <OutlineButton onClick={()=> window.open("https://www.fora.city", "_blank")}>Join a city</OutlineButton>
            <PrimaryOutlineButton onClick={openFoundACity}>
              Found a city
            </PrimaryOutlineButton>
          </div>
        </div>
        <div className="flex min-h-[900px] w-full flex-col items-center overflow-hidden">
          <Suspense>
            <>
              <Globe />
            </>
          </Suspense>
        </div>
      </div>
      <LandingPageFooter />
    </>
  );
};

export default LandingPage;

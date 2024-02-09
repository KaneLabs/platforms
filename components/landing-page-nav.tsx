"use client";
import Link from "next/link";
import styles from "./landing-page-nav.module.css";
import { useModal } from "./modal/provider";
import JoinACityModal from "./modal/join-a-city";
import FoundACityModal from "./modal/found-a-city";
import PrimaryOutlineButton from "./buttons/primary-outline-button";
import Marquee from "react-fast-marquee";

export default function LandingPageNav() {
  const modal = useModal();
  const openJoinACity = () => {
    modal?.show(<JoinACityModal />);
  };

  const openFoundACity = () => {
    modal?.show(<FoundACityModal />);
  };

  return (
    <div>
      <nav className="fixed left-0 right-0 top-10 z-550 mx-auto h-14 overflow-clip  border-b border-gray-500/10">
        <div className={`${styles["landing-page-nav-backdrop"]}`}>
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center  justify-between px-5">
            <Link
              href={"/"}
              className="font-serif text-xl font-light text-gray-300"
            >
              Fora
            </Link>

            <div className="flex">
              <button
                onClick={openJoinACity}
                className="px-2 mr-2 font-sans font-medium text-gray-300"
              >
                Join
              </button>
              <PrimaryOutlineButton
                onClick={openFoundACity}
              >
                Found a city
              </PrimaryOutlineButton>
            </div>
          </div>
        </div>
      </nav>
    <Link
      href={"https://explorer.gitcoin.co/?utm_source=grants.gitcoin.co&utm_medium=internal_link&utm_campaign=gg19&utm_content=independent-rounds#/round/10/0xd875fa07bedce182377ee54488f08f017cb163d4"}
      target="_blank"
      className="font-serif font-medium text-brand-primary-300"
    >
      <Marquee
        pauseOnHover={true}
        speed={100}
        className="px-2 mr-2"
      >
        Fora is on Gitcoin for our Zuzalu Q1-Tech Round!
      </Marquee>
    </Link>
    </div>
  );
}

"use client";
import { useZupassPopupSetup } from "@pcd/passport-interface";

export default function PassportPopup() {
  

  return <div>{useZupassPopupSetup()}</div>;
}

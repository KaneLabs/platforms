"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";
import { Button } from "./ui/button";

export default function CreateOrganizationButton({
  children,
}: {
  children: ReactNode;
}) {
  const modal = useModal();
  return (
    <Button
      onClick={() => modal?.show(children)}
    >
      Create New City
    </Button>
  );
}

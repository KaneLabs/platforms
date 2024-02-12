"use client";

import { toast } from "sonner";
import { updateEventPlaceTime } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { FormEvent, LabelHTMLAttributes, useEffect, useState } from "react";
import { Event, Organization, Place } from "@prisma/client";
import FormButton from "../modal/form-button";
import { DatePicker } from "../form-builder/date-picker";
import TimePicker from "../ui/time-picker";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { revalidatePath } from "next/cache";
import { Building2Icon, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { combineDateAndTime } from "../modal/create-event";

const FormLabel = (props: LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className="text-sm font-medium text-gray-700 dark:text-gray-400"
      {...props}
    />
  );
};

function getDefaultTime(date?: Date): string {
  if (!date) {
    date = new Date();
  }

  // Get the current time in milliseconds past the current day interval
  const currentTime = date.getTime();
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const timePastDayInterval = currentTime - startOfDay;

  return timePastDayInterval.toString();
}

export default function UpdateEventPlaceTimeForm({
  organization,
  places,
  event,
  parentEvent,
  redirectBaseUrl,
}: {
  organization: Organization;
  places: Place[];
  event: Event & { eventPlaces: { place: Place }[] };
  parentEvent?: Event;
  redirectBaseUrl?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  console.log("PlaceId: ", event?.eventPlaces?.[0]?.place?.id);

  const [data, setData] = useState<{
    startingAtDate?: Date;
    startingAtTime?: string;
    endingAtDate?: Date;
    endingAtTime?: string;
    placeId?: string;
  }>({
    startingAtDate: new Date(
      event?.startingAt ? event?.startingAt : new Date(),
    ),
    startingAtTime: getDefaultTime(
      event.startingAt ? event.startingAt : undefined,
    ),
    endingAtDate: new Date(event?.endingAt ? event?.endingAt : new Date()),
    endingAtTime: getDefaultTime(event.endingAt ? event.endingAt : undefined),
    placeId: event?.eventPlaces?.[0]?.place?.id ?? undefined,
  });

  const [addPlace, setAddPlace] = useState(false);

  const [placeData, setPlaceData] = useState<{
    name: string;
    address1: string;
    address2: string;
  }>({
    name: "",
    address1: "",
    address2: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const startingAt =
      data.startingAtDate && data.startingAtTime
        ? combineDateAndTime(data.startingAtDate, data.startingAtTime)
        : event.startingAt;

    const endingAt =
      data.endingAtDate && data.endingAtTime
        ? combineDateAndTime(data.endingAtDate, data.endingAtTime)
        : event.endingAt;

    const placeId = data.placeId;

    updateEventPlaceTime(
      {
        startingAt,
        endingAt,
        placeId,
      },
      {
        params: {
          subdomain: organization.subdomain as string,
          path: event.path,
        },
      },
      null,
    )
      .then((res: any) => {
        setLoading(false);
        if (res.error) {
          toast.error(res.error);
        } else {
          const { imageBlurhash, createdAt, updatedAt, ...org } = organization;
          toast.success(`Successfully updated Event!`);
          revalidatePath(`/`, "page");
          if (parentEvent) {
            revalidatePath(`/${parentEvent.path}`);
          }
          router.refresh();
          router.push(
            redirectBaseUrl
              ? `${redirectBaseUrl}${res.path}`
              : `/city/${organization.subdomain}/events/${res.path}`,
          );
        }
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">
          Location and Time
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-400">{""}</p>

        <div className="flex flex-col space-y-2">
          <FormLabel>Location</FormLabel>

          {addPlace ? (
            <Button
              variant={"ghost"}
              type="button"
              onClick={() => {
                setAddPlace(false);
              }}
            >
              <div className="flex items-center">
                <Building2Icon className="h-4 w-4 stroke-gray-800 dark:stroke-gray-300" />
                <span className="mx-2.5">{`Use Bookable Venue`}</span>
              </div>
            </Button>
          ) : (
            <>
              <Button
                variant={"ghost"}
                type="button"
                onClick={() => {
                  setAddPlace(true);
                }}
              >
                <div className="flex items-center">
                  <PlusCircle className="h-4 w-4 stroke-gray-800 dark:stroke-gray-300" />
                  <span className="mx-2.5">{`Add Private Venue`}</span>
                </div>
              </Button>
              <Select
                defaultValue={data.placeId}
                value={data.placeId}
                onValueChange={(value) => {
                  setData((prev) => ({ ...prev, placeId: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {places.map((place) => {
                    console.log("place.id: ", place.id);
                    return (
                      <SelectItem key={place.id} value={place.id}>
                        {place.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {addPlace ? (
          <>
            <div className="flex flex-col space-y-2">
              <FormLabel>Location Name</FormLabel>
              <Input
                name="location_name"
                type="text"
                value={placeData.name}
                onChange={(e) =>
                  setPlaceData({ ...placeData, name: e.target.value })
                }
                maxLength={64}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <FormLabel>Location Address</FormLabel>
              <Input
                name="location_address1"
                type="text"
                value={placeData.address1}
                onChange={(e) =>
                  setPlaceData({ ...placeData, address1: e.target.value })
                }
                maxLength={64}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <FormLabel>Location Address 2</FormLabel>
              <Input
                name="location_address2"
                type="text"
                placeholder="Room, unit, number, etc."
                value={placeData.address2}
                onChange={(e) =>
                  setPlaceData({ ...placeData, address2: e.target.value })
                }
                maxLength={32}
                required
              />
            </div>
            <Separator />
          </>
        ) : (
          <Separator />
        )}

        <div className="flex flex-col space-y-2">
          <FormLabel>Starts At</FormLabel>
          <div className="flex">
            <DatePicker
              date={data.startingAtDate}
              onSelect={(date) => {
                setData((prev) => ({ ...prev, startingAtDate: date }));
              }}
            />
            <TimePicker
              value={data.startingAtTime}
              onValueChange={(value) => {
                setData((prev) => ({ ...prev, startingAtTime: value }));
              }}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <FormLabel>Ends At</FormLabel>
          <div className="flex">
            <DatePicker
              date={data.endingAtDate}
              onSelect={(date) => {
                setData((prev) => ({ ...prev, endingAtDate: date }));
              }}
            />
            <TimePicker
              value={data.endingAtTime}
              onValueChange={(value) => {
                setData((prev) => ({ ...prev, endingAtTime: value }));
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-end rounded-b-lg border-t border-gray-200 bg-gray-50 px-4 py-3 md:w-auto md:px-10 dark:border-gray-700 dark:bg-gray-800">
        <FormButton
          loading={loading}
          text={"SAVE"}
          className="w-full md:w-auto"
        />
      </div>
    </form>
  );
}

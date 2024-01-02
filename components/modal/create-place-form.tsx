"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "../ui/input";
import { toast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "./provider";
import { CreatePlaceSchema } from "@/lib/schema";
import { createPlace } from "@/lib/actions";
import { Feature, Point, Polygon } from "geojson";
import { useFormStatus } from "react-dom";
import PrimaryButton from "../buttons/primary-button";
import { GeocodeInput } from "../geocode-input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Link from "next/link";
import { capitalize } from "lodash";
import FormTitle from "../form-title";

export default function CreatePlaceModal({
  geoJSON,
  lng,
  lat,
}: {
  geoJSON?: Feature<Polygon> | Feature<Point>;
  lng?: number;
  lat?: number;
}) {
  const form = useForm<z.infer<typeof CreatePlaceSchema>>({
    resolver: zodResolver(CreatePlaceSchema),
    defaultValues: {
      type: "VENUE",
    },
  });
  // const { pending } = useFormStatus();
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const modal = useModal();
  const { subdomain, path } = useParams() as {
    subdomain: string;
    path: string;
  };
  const [selected, setSelected] = useState<any>();

  async function onSubmit(data: z.infer<typeof CreatePlaceSchema>) {
    console.log("on Submit with selected: ", selected);
    try {
      setLoading(true);
      const result = await createPlace(
        data,
        { params: { subdomain: subdomain as string } },
        null,
      );
      console.log("result");

      router.refresh();
      toast({
        title: "Successfully created a new Place",
      });
      modal?.hide();
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setLoading(false);
    }
  }

  function onSelected(selected: any) {
    setSelected(selected);
    console.log("selected: ", selected);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6 rounded-md bg-gray-200/80 px-12 py-6 backdrop-blur-lg  dark:bg-gray-900/80 md:max-w-md md:border md:border-gray-200 md:shadow dark:md:border-gray-700"
      >
        <FormTitle>Add a Place</FormTitle>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Address</FormLabel>
          <GeocodeInput onSelected={onSelected} />
        </div>

        <FormField
          control={form.control}
          name="address2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address 2</FormLabel>
              <Input {...field} placeholder="number, unit, room, etc." />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent defaultValue={"VENUE"}>
                  {["VENUE"].map((v) => {
                    return (
                      <SelectItem key={v} value={v}>
                        {capitalize(v)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <PrimaryButton loading={loading} type="submit">
          Submit
        </PrimaryButton>
      </form>
    </Form>
  );
}

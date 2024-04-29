"use client";

import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createManualCampaignApplication } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "./provider";
import { Campaign, CampaignTier } from "@prisma/client";
import { CreateApplicationSchema } from "@/lib/schema";

export default function AddApplicationModal({
  campaign,
  campaignTiers,
}: {
  campaign: Campaign;
  campaignTiers: CampaignTier[];
}) {
  const form = useForm<z.infer<typeof CreateApplicationSchema>>({
    resolver: zodResolver(CreateApplicationSchema),
    defaultValues: {
      campaignId: campaign.id,
    },
  });
  const modal = useModal();
  const router = useRouter();
  const { subdomain } = useParams() as {
    subdomain: string;
  };

  async function onSubmit(data: z.infer<typeof CreateApplicationSchema>) {
    try {
      await createManualCampaignApplication(
        data,
        { params: { subdomain } },
        null,
      );

      toast.success("The application has been added.");
    } catch (error: any) {
      toast.error(error.message || "Please try again later 🤕");
    }

    modal?.hide();
    window.location.reload();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-4 rounded-md bg-gray-50/80 p-8 backdrop-blur-lg md:max-w-md md:border md:border-gray-300 md:shadow"
      >
        <FormField
          control={form.control}
          name="campaignTierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Tier</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {campaignTiers.map((tier) => {
                    return (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contributionAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contribution Amount</FormLabel>
              <Input {...field} type="text" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionHash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Hash</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="walletAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wallet Address</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Add Application</Button>
      </form>
    </Form>
  );
}

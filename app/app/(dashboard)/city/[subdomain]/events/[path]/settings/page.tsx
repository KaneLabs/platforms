import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Form from "@/components/form";
import {
  updateEvent,
} from "@/lib/actions";
import DeleteEventForm from "@/components/form/delete-event-form";
import { DatePicker } from "@/components/form-builder/date-picker";
import TimePicker from "@/components/ui/time-picker";
import UpdateEventForm from "@/components/form/update-event-placetime-form";
import NotFoundPost from "../not-found";
import UpdateEventPlaceTimeForm from "@/components/form/update-event-placetime-form";

export default async function EventSettings({
  params,
}: {
  params: { path: string; subdomain: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const [event] = await prisma.$transaction([
    prisma.event.findFirst({
      where: {
        organization: {
          subdomain: params.subdomain,
        },
        path: params.path,
      },
      include: {
        organization: {
          include: {
            places: true,
          },
        },
        eventPlaces: {
          include: {
            place: true,
          },
        },
      },
    }),
  ]);

  if (!event) {
    return NotFoundPost();
  }

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Preview Image"
        description="The preview image for your event. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 1200x600."
        inputAttrs={{
          name: "image",
          type: "file",
          defaultValue: event?.image!,
        }}
        handleSubmit={updateEvent}
      />
      <Form
        title="Name"
        description="The name of the event"
        helpText="Please use 64 characters maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: event?.name!,
          placeholder: event?.name || "Your Event",
          maxLength: 64,
        }}
        handleSubmit={updateEvent}
      />
      <Form
        title="Description"
        description="Your description of the event."
        helpText="When you share a link to the event, your description will be the body text of the preview."
        inputAttrs={{
          name: "description",
          type: "text",
          defaultValue: event?.description!,
          placeholder: event?.description || "Describe your event.",
        }}
        handleSubmit={updateEvent}
      />

      <UpdateEventPlaceTimeForm
        event={event}
        organization={event?.organization}
        places={event?.organization.places}
      />

      {event && <DeleteEventForm eventName={event?.name} />}
    </div>
  );
}

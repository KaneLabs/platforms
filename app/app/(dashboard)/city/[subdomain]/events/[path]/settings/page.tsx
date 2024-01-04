import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Form from "@/components/form";
import {
  // updatePostMetadata,
  // getUserEventRoles,
  updateEvent,
} from "@/lib/actions";
import DeleteEventForm from "@/components/form/delete-event-form";
// import DeletePostForm from "@/components/form/delete-post-form";

export default async function EventSettings({
  params,
}: {
  params: { path: string; subdomain: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  console.log("Path: ", params.path);
  console.log("Subdomain: ", params.subdomain);

  const data = await prisma.event.findFirst({
    where: {
      organization: {
        subdomain: params.subdomain,
      },
      path: params.path,
    },
  });

  console.log("data: ", data);

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Preview Image"
        description="The preview image for your event. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 1200x600."
        inputAttrs={{
          name: "image",
          type: "file",
          defaultValue: data?.image!,
        }}
        handleSubmit={updateEvent}
      />
      <Form
        title="Name"
        description="The name of the event"
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: data?.name!,
          placeholder: data?.name || "Your Event",
          maxLength: 32,
        }}
        handleSubmit={updateEvent}
      />
      <Form
        title="Description"
        description="Your description of the event."
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "description",
          type: "text",
          defaultValue: data?.description!,
          placeholder: data?.description || "Describe your event.",
        }}
        handleSubmit={updateEvent}
      />
      {data && <DeleteEventForm eventName={data?.name} />}
    </div>
  );
}

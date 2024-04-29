import {
  Tailwind,
  Html,
  Head,
  Preview,
  Body,
  Container,
  Img,
  Text,
  Section,
  Hr,
  Link,
} from "@react-email/components";
import { render } from "@react-email/render";
import { brand } from "@/lib/constants";
import { Resend } from "resend";
import EmailFooter from "../email-footer";
import { ApplicationStatus } from "@prisma/client";
import { getApplicationStatusText } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY as string);

type ApplicationStatusEmailProps = {
  email: string;
  status: ApplicationStatus;
  campaignName: string;
  organizerName: string | null;
  detailsLink: string;
};

export const sendApplicationStatusEmail = (props: ApplicationStatusEmailProps) => {
  return resend.emails.send({
    from: "Fora <no-reply@mail.fora.co>",
    to: [props.email],
    subject: `Application Status Update for ${props.campaignName}`,
    html: render(<ApplicationStatusEmail {...props}/>, {
      pretty: true,
    }),
  });
};

export const getApplicationStatusBrandColor = (status: Partial<ApplicationStatus>) => {
  const colors: any = {
    [ApplicationStatus.ACCEPTED]: "bg-brand-green", 
    [ApplicationStatus.REJECTED]: "bg-brand-red", 
    [ApplicationStatus.PENDING]: "bg-brand-orange",
  };
  return status && colors[status] ? colors[status] : "";
}

export const ApplicationStatusEmail = ({
  status,
  campaignName,
  organizerName,
  detailsLink,
}: ApplicationStatusEmailProps) => {
  let statusText = '';

  switch (status) {
    case ApplicationStatus.ACCEPTED:
      statusText = 'Congratulations! Your application has been accepted.';
      break;
    case ApplicationStatus.REJECTED:
      statusText = 'We regret to inform you that your application has been declined.';
      break;
    default:
      statusText = 'Your application is under review.';
      break;
  }

  return (
    <Html>
      <Head />
      <Preview>{statusText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand,
                gray: brand.gray,
              },
            },
          },
        }}
      >
        <Body className={"font-sans"}>
          <Container className="mx-auto flex justify-center rounded bg-gray-100 px-16 pb-12 pt-10">
            <Img
              src={`https://fora.co/fora-logo.png`}
              width="80"
              height="80"
              alt="Fora Logo"
              className={"rounded-full"}
            />
            <Text className="font-serif text-2xl font-bold text-gray-800">
              Application Status
            </Text>

            <Section>
              <Text className="text-md font-light text-gray-800">
                {statusText}
              </Text>
              <Text className="text-sm font-light text-gray-800">
                <ul className="text-sm font-light mt-2 mb-4">
                    <li>Campaign: <span className="font-medium">{campaignName}</span></li>
                    <li className="py-2">Status: <span className={`font-medium rounded-full px-2 py-1 ${getApplicationStatusBrandColor(status)} text-gray-200`}>{getApplicationStatusText(status)}</span></li>
                    {organizerName && <li>Organizer: <span className="font-medium">{organizerName}</span></li>}
                </ul>
              </Text>
              <Text className="text-md font-light text-gray-800">
                You can check the full details of your application by clicking the link below.
              </Text>
            </Section>
            <Section className="py-5">
              <Link
                href={detailsLink}
                className="h-10 cursor-pointer rounded-full bg-brand-blue px-6 py-3 font-semibold text-gray-200"
              >
                View Details
              </Link>
            </Section>
            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
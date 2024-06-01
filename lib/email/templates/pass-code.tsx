import {
  Tailwind,
  Button,
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
import { Organization } from "@prisma/client";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY as string);

type PasscodeEmailProps = {
  org?: Organization;
  email: string;
  token: string;
};

function getPasscodeSubjectLine(org?: Organization): string {
  return "Sign in to " + (org?.name ? org?.name : "Fora");
}

export const sendPasscodeEmail = (props: PasscodeEmailProps) => {
  return resend.emails.send({
    from: "Fora <no-reply@mail.fora.co>",
    to: [props.email],
    subject: getPasscodeSubjectLine(props.org),
    html: render(<PasscodeEmail {...props} />, {
      pretty: true,
    }),
  });
};

export const PasscodeEmail = ({ org, token }: PasscodeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{getPasscodeSubjectLine(org)}</Preview>
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
        <Body className={"w-full font-sans bg-gray-100"}>
          <Container className="max-w-lg mx-auto rounded bg-white shadow-sm px-8 pb-8 pt-12">
            <Img
              src={org?.logo ? org.logo : `https://app.fora.city/fora-logo.png`}
              width="80"
              height="80"
              alt="Fora Logo"
              className={"mx-auto"}
            />
            <Text className="text-center text-2xl font-semibold text-gray-800 py-4">
              Welcome to {org?.name || "Fora"}
            </Text>
            <Text className="my-6 text-center text-lg font-light text-gray-600">
              Use the 4-digit authentication code below to sign in:
            </Text>
            <Text className="text-center font-bold text-3xl py-4">
              {token}
            </Text>
            <Text className="text-center text-md font-light">
              If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
            </Text>
            <Hr className="my-10 border-t border-gray-200" />
            <Text className="text-center text-md font-light mt-4">
              {org?.name || "Fora Cities, Inc."}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

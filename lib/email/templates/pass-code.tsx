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
        <Body className={"w-full font-sans"}>
          <Container className="rounded bg-gray-100 px-16 pb-12 pt-10">
            <Img
              src={org?.logo ? org.logo : `https://fora.co/fora-logo.png`}
              width="40"
              height="40"
              alt="Fora Logo"
              className={"rounded-full"}
            />
            <Text className="font-serif text-xl font-bold text-gray-800 py-3">
              {getPasscodeSubjectLine(org)}
            </Text>
            <Text className="text-sm font-light text-gray-800">
              <ul className="text-sm font-light mt-2 mb-4">
                  <li>Authentication code: <span className="font-medium">{token}</span></li>
              </ul>
            </Text>
            <Hr className="my-5 border-gray-600" />
            <Text className={"text-md text-gray-700"}>
              {org?.name || "Fora Cities, Inc."}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

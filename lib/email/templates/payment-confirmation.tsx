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
import { Resend } from "resend";
import EmailFooter from "../email-footer";
import { truncateMiddle, getEtherscanUrl } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY as string);

type PaymentConfirmationEmailProps = {
  id: string;
  chainId: bigint;
  campaign: string;
  date: string;
  amount: string;
  contributionLink: string;
  email: string;
};

export const sendPaymentConfirmationEmail = (props: PaymentConfirmationEmailProps) => {
  return resend.emails.send({
    from: "Fora <no-reply@mail.fora.co>",
    to: [props.email],
    subject: "Payment Confirmation for " + props.campaign,
    html: render(<PaymentConfirmationEmail {...props}/>, {
      pretty: true,
    }),
  });
};

export const PaymentConfirmationEmail = ({
  id,
  chainId,
  date,
  amount,
  contributionLink,
  campaign
}: PaymentConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your contribution is complete</Preview>
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
              Payment Complete
            </Text>

            <Section>
              <Text className="text-md font-light text-gray-800">
                Thank you for your contribution to {campaign}. Here are your payment details:
              </Text>
              <Text className="text-sm font-light text-gray-800">
                <ul className="text-sm font-light mt-2 mb-4">
                    <li>Amount: <span className="font-medium">{amount}</span></li>
                    <li>Date: <span className="font-medium">{date}</span></li>
                    <li>Transaction:&nbsp; 
                      <Link
                        className="font-medium"
                        href={`${getEtherscanUrl(chainId)}/tx/${id}`}
                      >
                        {truncateMiddle(id, 12)}
                      </Link>
                    </li>
                </ul>
              </Text>
              <Text className="text-md font-light text-gray-800">
                As a reminder, you can withdraw your contribution at any time before the Campaign meets its target. Check the status of your contribution by clicking below.
              </Text>
            </Section>
            <Section className="py-5">
              <Link
                href={contributionLink}
                className="h-10 cursor-pointer rounded-full bg-brand-blue px-6 py-3 font-semibold text-gray-200"
              >
                View Contribution
              </Link>
            </Section>
            <EmailFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

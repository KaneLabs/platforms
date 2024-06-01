import { SendVerificationRequestParams } from "next-auth/providers/email";
import { sendPasscodeEmail } from "../email/templates/pass-code";

export function generateAuthtoken(): string {
  const randomNumber: number = Math.floor(Math.random() * 10000);
  const authToken: string = randomNumber.toString().padStart(4, '0');
  return authToken;
}

export async function sendVerificationRequestPasscode({
  identifier: email,
  token
}: SendVerificationRequestParams) {
  await sendPasscodeEmail({
    token,
    email,
  });
}
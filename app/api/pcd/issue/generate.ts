import { EdDSATicketPCDPackage } from "@pcd/eddsa-ticket-pcd";
import { EmailPCD, EmailPCDPackage } from "@pcd/email-pcd";
import { PCDCollection } from "@pcd/pcd-collection";
import { ArgumentTypeName, PCDPackage, SerializedPCD } from "@pcd/pcd-types";
import { Identity } from "@semaphore-protocol/identity";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";
import {
  SemaphoreSignaturePCD,
  SemaphoreSignaturePCDPackage,
} from "@pcd/semaphore-signature-pcd";
import { ISSUANCE_STRING } from "@pcd/passport-interface";
import path from "path";

let pcdPackages: Promise<PCDPackage[]> | undefined;

export async function getPackages(): Promise<PCDPackage[]> {
  if (pcdPackages !== undefined) {
    return pcdPackages;
  }

  pcdPackages = loadPackages();
  return pcdPackages;
}

export async function genIdentity() {}

export async function genPassport() {
  const identity = new Identity();
  const identityPCD = await SemaphoreIdentityPCDPackage.prove({ identity });

  const passport = new PCDCollection(await getPackages(), [identityPCD]);

  return { identity, identityPCD, passport };

  await savePCDs(passport);
}

const COLLECTION_KEY = "pcd_collection";

export async function savePCDs(pcds: PCDCollection): Promise<void> {
  const serialized = await pcds.serializeCollection();
}

async function loadPackages(): Promise<PCDPackage[]> {

  await SemaphoreSignaturePCDPackage.init?.({
    wasmFilePath: path.resolve(__dirname, "../feeds/artifacts/16.wasm"),
    zkeyFilePath: path.resolve(__dirname, "../feeds/artifacts/16.zkey"),
  });

  await EdDSATicketPCDPackage.init?.({
    makeEncodedVerifyLink,
  });

  return [
    SemaphoreIdentityPCDPackage,
    SemaphoreSignaturePCDPackage,
    EdDSATicketPCDPackage,
    EmailPCDPackage,
  ];
}
export function makeEncodedVerifyLink(encodedPCD: string): string {
  const link = `${window.location.origin}/#/verify?pcd=${encodeURIComponent(
    encodedPCD,
  )}`;
  return link;
}

/**
 * Issues email PCDs based on the user's verified email address.
 * Currently we only verify a single email address, but could provide
 * multiple PCDs if it were possible to verify secondary emails.
 */
export async function issueEmailPCDs({
  email,
  identityCommitment,
  privateKey,
}: {
  email: string;
  identityCommitment: string;
  privateKey: string;
}): Promise<EmailPCD> {
  const stableId = "attested-email-" + email;

  return EmailPCDPackage.prove({
    privateKey: {
      value: privateKey,
      argumentType: ArgumentTypeName.String,
    },
    id: {
      value: stableId,
      argumentType: ArgumentTypeName.String,
    },
    emailAddress: {
      value: email,
      argumentType: ArgumentTypeName.String,
    },
    semaphoreId: {
      value: identityCommitment,
      argumentType: ArgumentTypeName.String,
    },
  });
}

export async function genSignedPCDIdentity(
  identity: Identity,
): Promise<SerializedPCD<SemaphoreSignaturePCD>> {
    return await SemaphoreSignaturePCDPackage.serialize(
      await SemaphoreSignaturePCDPackage.prove({
        identity: {
          argumentType: ArgumentTypeName.PCD,
          value: await SemaphoreIdentityPCDPackage.serialize(
            await SemaphoreIdentityPCDPackage.prove({
              identity,
            }),
          ),
        },
        signedMessage: {
          argumentType: ArgumentTypeName.String,
          value: ISSUANCE_STRING,
        },
      }),
    );

}

export function loadCheckinCredential(
  key: string,
): SerializedPCD<SemaphoreSignaturePCD> | undefined {
  try {
    const serializedPCD = JSON.parse(
      window.localStorage[`checkin_credential_${key}`],
    );
    if (serializedPCD) {
      return serializedPCD;
    }
  } catch (e) {
    // Do nothing
  }
  return undefined;
}

export function saveCheckinCredential(
  key: string,
  serializedPCD: SerializedPCD<SemaphoreSignaturePCD>,
): void {
  window.localStorage[`checkin_credential_${key}`] =
    JSON.stringify(serializedPCD);
}

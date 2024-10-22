import { buildPath } from "../utils/buildPath.ts";
import { concatCookie } from "../utils/concatCookie.ts";
import { createCookie } from "../utils/createCookie.ts";
import { createRequestOptions } from "../utils/createRequestOptions.ts";
import { getEmailMetadata } from "./getEmailMetadata.ts";

export type deleteEmailResult =
  | {
    type: "success";
    data: string;
  }
  | {
    type: "error";
    data: string;
  };

export async function deleteEmail(
  sessionHash: string,
  csrfToken: string,
  email: string,
  cookies?: string,
): Promise<deleteEmailResult> {
  const emailMetadata = await getEmailMetadata(sessionHash, csrfToken, cookies);
  let emailHash;

  if (emailMetadata.type === "error") {
    return {
      type: "error",
      data: emailMetadata.data,
    };
  }

  for (const metadata of emailMetadata.data) {
    if (metadata.email === email) {
      emailHash = metadata.hash;
      break;
    }
  }

  if (!emailHash) {
    return {
      type: "error",
      data: "Email not found",
    };
  }

  const response = await fetch(
    buildPath(
      `/index._addrlist.php?action=delAddrList&nopost=1&num_list=${emailHash}%2C&_=${Date.now()}`,
    ),
    createRequestOptions(
      {},
      {
        cookie: concatCookie(createCookie(csrfToken, sessionHash), cookies),
      },
    ),
  );

  if (response.status !== 200) {
    return {
      type: "error",
      data: response.statusText,
    };
  }

  const text = await response.text();

  if (!text.includes("OK")) {
    return {
      type: "error",
      data: text,
    };
  }

  return {
    type: "success",
    data: text,
  };
}

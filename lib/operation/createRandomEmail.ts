import { buildPath } from "../utils/buildPath.ts";
import { concatCookie } from "../utils/concatCookie.ts";
import { createCookie } from "../utils/createCookie.ts";
import { createRequestOptions } from "../utils/createRequestOptions.ts";

export type createRandomEmailResult =
  | {
    type: "success";
    data: string;
  }
  | {
    type: "error";
    data: string;
  };

export async function createRandomEmail(
  sessionHash: string,
  csrfToken: string,
  csrfSubToken: string,
  cookies?: string,
): Promise<createRandomEmailResult> {
  const response = await fetch(
    buildPath(
      `/index.php?action=addMailAddrByAuto&nopost=1&by_system=1&csrf_token_check=${csrfToken}&csrf_subtoken_check=${csrfSubToken}&recaptcha_token=&_=${Date.now()}`,
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

  if (!text.startsWith("OK:")) {
    return {
      type: "error",
      data: text,
    };
  }

  return {
    type: "success",
    data: text.slice(3),
  };
}

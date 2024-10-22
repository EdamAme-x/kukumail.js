import { JSDOM } from "jsdom";
import { buildPath } from "../utils/buildPath.ts";
import { concatCookie } from "../utils/concatCookie.ts";
import { createCookie } from "../utils/createCookie.ts";
import { createRequestOptions } from "../utils/createRequestOptions.ts";
import { cleanString } from "../utils/cleanString.ts";

export type getSendedMailsResult =
  | {
    type: "success";
    data: {
      subject: string;
      date: string;
      from: string;
      to: string;
      id: string;
    }[];
  }
  | {
    type: "error";
    data: string;
  };

export async function getSendedMails(
  sessionHash: string,
  csrfToken: string,
  cookies?: string,
): Promise<getSendedMailsResult> {
  const response = await fetch(
    buildPath(
      `/send._ajax.php?&&nopost=1&_=${Date.now()}`,
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

  const html = await response.text();

  const doc = new JSDOM(html).window.document;

  const data = Array.from(
    doc.querySelectorAll("div > [id^='area_mail_'].horizontal"),
    // deno-lint-ignore no-explicit-any
  ).map((element: any) => {
    const subject = element.querySelector("a b > span")?.innerHTML.trim();
    if (!subject) return null;
    const container = cleanString(
      element.querySelector("a div[style] > div[class]")?.innerHTML.trim(),
    );
    if (!container) return null;
    const splittedContainer = container.split(" | ");
    const date = splittedContainer[0];
    if (!date) return null;
    const from = splittedContainer[1];
    if (!from) return null;
    const to = splittedContainer[2];
    if (!to) return null;
    const id = element.getAttribute("id")?.replace("area_mail_", "");
    if (!id) return null;
    return {
      subject,
      date,
      from,
      to,
      id,
    };
  }).filter((element) => !!element);

  return {
    type: "success",
    data: data,
  };
}

import { JSDOM } from "jsdom";
import { buildPath } from "../utils/buildPath.ts";
import { concatCookie } from "../utils/concatCookie.ts";
import { createCookie } from "../utils/createCookie.ts";
import { createRequestOptions } from "../utils/createRequestOptions.ts";
import { cleanString } from "../utils/cleanString.ts";

export type getReceivedMailsResult =
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

export async function getReceivedMails(
  sessionHash: string,
  csrfToken: string,
  csrfSubtoken: string,
  cookies?: string,
): Promise<getReceivedMailsResult> {
  const response = await fetch(
    buildPath(
      `/recv._ajax.php?&&nopost=1&csrf_token_check=${csrfToken}&csrf_subtoken_check=${csrfSubtoken}&_=${Date.now()}`,
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

  const data = Array.from(doc.querySelectorAll("div > [style].horizontal")).map(
    // deno-lint-ignore no-explicit-any
    (element: any) => {
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
      const id = element.querySelector("a")?.getAttribute("id")?.replace(
        "link_maildata_",
        "",
      );
      if (!id) return null;
      return {
        subject,
        date,
        from,
        to,
        id,
      };
    },
  ).filter((element) => !!element);

  return {
    type: "success",
    data: data,
  };
}

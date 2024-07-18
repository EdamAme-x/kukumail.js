import { JSDOM } from 'jsdom';
import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";

type createShareLinkResult =
    | {
            type: "success";
            data: string;
      }
    | {
            type: "error";
            data: string;
      };

export async function createShareLink(sessionHash: string, csrfToken: string, csrfSubToken: string, type: "send" | "recv", id: string, cookies?: string): Promise<createShareLinkResult> {
    const response = await fetch(
        buildPath(type === "recv" ? `/recv._ajax.php?action=shareMail&nopost=1&&num=${id}&csrf_token_check=${csrfToken}&csrf_subtoken_check=${csrfSubToken}&_=${Date.now()}` : `/send._ajax.php?action=shareMail&nopost=1&&num=${id}&_=${Date.now()}`),
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

    const doc = new JSDOM(html);

    const dom = doc.window.document;

    const data = dom.querySelector("input[type][value]")?.getAttribute("value");

    if (!data) {
        return {
            type: "error",
            data: "Unknown error",
        };
    }

    return {
        type: "success",
        data,
    };
}
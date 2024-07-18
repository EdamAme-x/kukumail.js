import { JSDOM } from 'jsdom';
import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";
import { createShareLink } from "./createShareLink";

type getMailContentResult = {
    type: "success";
    data: {
        subject: string;
        content: string;
    };
} | {
    type: "error";
    data: string;
};

export async function getMailContent(sessionHash: string, csrfToken: string, csrfSubToken: string, type: "recv" | "send", id: string,  cookies?: string): Promise<getMailContentResult> {
    const shareLink = await createShareLink(sessionHash, csrfToken, csrfSubToken, type, id, cookies);

    if (shareLink.type === "error") {
        return {
            type: "error",
            data: shareLink.data,
        };
    }

    const response = await fetch(
        shareLink.data,
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

    const title = dom.querySelector("#area-header > div:nth-child(3) > div > div")?.innerHTML.trim();

    if (!title) {
        return {
            type: "error",
            data: "Unknown error",
        };
    }

    const content = dom.querySelector("#area-data > div")?.innerHTML;

    if (!content) {
        return {
            type: "error",
            data: "Unknown error",
        };
    }

    return {
        type: "success",
        data: {
            subject: title,
            content,
        },
    };
}
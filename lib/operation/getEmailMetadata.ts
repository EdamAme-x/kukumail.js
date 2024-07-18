import { JSDOM } from "jsdom";
import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";

type getEmailMetadataResult =
	| {
			type: "success";
			data: {
				email: string;
				hash: string;
				limit?: number;
			}[];
	  }
	| {
			type: "error";
			data: string;
	  };

export async function getEmailMetadata(
	sessionHash: string,
	csrfToken: string,
	cookies?: string,
): Promise<getEmailMetadataResult> {
	const response = await fetch(
		buildPath(`/index._addrlist.php?&t=${Date.now()}&nopost=1&_=${Date.now() - 1000}`),
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

	const data = Array.from(dom.querySelectorAll("div .vcenter"))
		.map((element) => {
			const email = element.querySelector("a > div > span:nth-child(2)")?.innerHTML.trim();
			if (!email) return null;
			const hash = element
				.querySelector("a > div > span:nth-child(2)")
				?.getAttribute("id")
				?.replace("area_mailaddr_", "");
			if (!hash) return null;
			let limit: string | number | undefined = element.querySelector("a")?.innerHTML.trim();

			if (limit?.includes("残り ")) {
				limit = limit.split("残り ")[1].split(" 日")[0].trim();
				if (!limit) return null;
				limit = Number(limit);
			} else {
				limit = undefined;
			}

			return {
				email,
				hash,
				limit,
			};
		})
		.filter((data) => !!data);

	return {
		type: "success",
		data,
	};
}

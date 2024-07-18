import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";
import { JSDOM } from "jsdom";

type attributeTypes = "NEW" | "JP";

type getAvailableDomainsResult =
	| {
			type: "success";
			data: {
				domain: string;
				attributes: attributeTypes[];
			}[];
	  }
	| {
			type: "error";
			data: string;
	  };

export async function getAvailableDomains(
	sessionHash: string,
	csrfToken: string,
	cookies?: string,
): Promise<getAvailableDomainsResult> {
	const response = await fetch(
		buildPath("/ja.php"),
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

	dom.querySelectorAll("#input_manualmaildomain_list [id^='input'] > div");

	const data = Array.from(dom.querySelectorAll("#input_manualmaildomain_list [id^='input'] > div"))
		.map((element) => {
			const domain = element.querySelector("b")?.innerHTML.trim();
			if (!domain) return null;
			const splittedDomain = domain.split("");
			if (splittedDomain[0] === "@") splittedDomain.shift();
			if (splittedDomain.length < 4) return null;

			const attributes: attributeTypes[] = [];
			element.querySelectorAll("span").forEach((span) => {
				if (span.innerHTML.includes("NEW")) {
					attributes.push("NEW");
				} else if (span.innerHTML.includes("日本")) {
					attributes.push("JP");
				}
			});

			return {
				domain: splittedDomain.join(""),
				attributes,
			};
		})
		.filter((data) => !!data);

	return {
		type: "success",
		data,
	};
}

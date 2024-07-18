import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";

const IP_REGEX = /&ip=(.+)&nopost=/;

type getServerSideIPResult =
	| {
			type: "success";
			data: string;
	  }
	| {
			type: "error";
			data: string;
	  };

export async function getServerSideIP(
	sessionHash: string,
	csrfToken: string,
	cookies?: string,
): Promise<getServerSideIPResult> {
	const response = await fetch(
		buildPath("/"),
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

	const match = text.match(IP_REGEX);

	if (!match) {
		return {
			type: "error",
			data: "Failed to extract IP",
		};
	}

	return {
		type: "success",
		data: match[1],
	};
}

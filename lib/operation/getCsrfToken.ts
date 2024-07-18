import { concatCookie } from "../utils/concatCookie";
import { buildPath } from "../utils/buildPath";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";

const CSRF_TOKEN_REGEX = /\&csrf_token_check=([a-z0-9])+\&csrf_subtoken_check=([a-z0-9])+/;

type CsrfTokenResult =
	| {
			type: "success";
			data: {
				csrf_token: string;
				csrf_subtoken: string;
			};
	  }
	| {
			type: "error";
			data: string;
	  };

export async function getCsrfToken(sessionHash: string, csrfToken: string, cookies?: string): Promise<CsrfTokenResult> {
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

	const result = extractCsrfToken(await response.text());

	if (!result) {
		return {
			type: "error",
			data: "Failed to extract CSRF token",
		};
	}

	return {
		type: "success",
		data: {
			csrf_token: result[0],
			csrf_subtoken: result[1],
		},
	};
}

function extractCsrfToken(html: string): [string, string] | null {
	const match = html.match(CSRF_TOKEN_REGEX);
	if (!match) {
		return null;
	}

	const splitted = match[0].split("=");

	return [splitted[1].split("&")[0], splitted[2]];
}

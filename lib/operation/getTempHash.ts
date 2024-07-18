import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";

const TEMP_HASH_REGEX = /&sendtemp_hash=([a-z0-9]+)&csrf_token_check/;

type getTempHashResult =
	| {
			type: "success";
			data: string;
	  }
	| {
			type: "error";
			data: string;
	  };

export async function getTempHash(
	sessionHash: string,
	csrfToken: string,
	cookies?: string,
): Promise<getTempHashResult> {
	const response = await fetch(
		buildPath("/new.php"),
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

	const match = text.match(TEMP_HASH_REGEX);

	if (!match) {
		return {
			type: "error",
			data: "Failed to extract temp hash",
		};
	}

	return {
		type: "success",
		data: match[1],
	};
}

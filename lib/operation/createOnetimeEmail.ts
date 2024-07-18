import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";

type createOnetimeEmailResult =
	| {
			type: "success";
			data: {
				email: string;
				limitDate: string;
			};
	  }
	| {
			type: "error";
			data: string;
	  };

export async function createOnetimeEmail(
	sessionHash: string,
	csrfToken: string,
	csrfSubToken: string,
	cookies?: string,
): Promise<createOnetimeEmailResult> {
	const response = await fetch(
		buildPath(
			`/index.php?action=addMailAddrByOnetime&nopost=1&by_system=1&csrf_token_check=${csrfToken}&csrf_subtoken_check=${csrfSubToken}&recaptcha_token=&_=${Date.now()}`,
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
		data: {
			email: text.slice(3).split(",")[0],
			limitDate: text.slice(3).split(",")[2],
		},
	};
}

import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";

type createEmailResult =
	| {
			type: "success";
			data: string;
	  }
	| {
			type: "error";
			data: string;
	  };

export async function createEmail(
	sessionHash: string,
	csrfToken: string,
	email: string,
	cookies?: string,
): Promise<createEmailResult> {
	const response = await fetch(
		buildPath(
			`/index.php?action=addMailAddrByManual&nopost=1&by_system=1&t=${Date.now()}&csrf_token_check=${csrfToken}&newdomain=${email.split("@")[1]}&newuser=${email.split("@")[0]}&recaptcha_token=&_=${Date.now() - 1000}`,
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
		data: text.slice(3),
	};
}

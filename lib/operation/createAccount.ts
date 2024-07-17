import { buildPath } from "../utils/buildPath";
import { createRequestOptions } from "../utils/createRequestOptions";

type CreateAccountResult =
	| {
			type: "success";
			data: {
				session_hash: string;
				csrf_token: string;
			};
	  }
	| {
			type: "error";
			data: string;
	  };

export async function createAccount(): Promise<CreateAccountResult> {
	const response = await fetch(buildPath("/ja.php"), createRequestOptions({}));

	if (response.status !== 200) {
		return {
			type: "error",
			data: response.statusText,
		};
	}

	const setCookie = response.headers.get("set-cookie");
	if (!setCookie) {
		return {
			type: "error",
			data: "Failed to extract session hash",
		};
	}

	let cookies = "";

	if (Array.isArray(setCookie)) {
		cookies = setCookie.join("; ");
	} else {
		cookies = setCookie;
	}

	const sessionHash = cookies.split("; ").find((cookie) => cookie.includes("cookie_sessionhash="));
	const csrfToken = cookies.split("; ").find((cookie) => cookie.includes("cookie_csrf_token="));

	if (!sessionHash || !csrfToken) {
		return {
			type: "error",
			data: "Failed to extract session hash",
		};
	}

	return {
		type: "success",
		data: {
			session_hash: sessionHash.split("cookie_sessionhash=")[1].trim(),
			csrf_token: csrfToken.split("cookie_csrf_token=")[1].trim(),
		},
	};
}

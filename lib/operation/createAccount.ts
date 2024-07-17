import { buildPath } from "../utils/buildPath";
import { createRequestOptions } from "../utils/createRequestOptions";

type CreateAccountResult =
	| {
			type: "success";
			data: {
				session_hash: string;
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

	const sessionHash = setCookie.split("; ").find((cookie) => cookie.startsWith("cookie_sessionhash="));

	if (!sessionHash) {
		return {
			type: "error",
			data: "Failed to extract session hash",
		};
	}

	return {
		type: "success",
		data: {
			session_hash: sessionHash.split("=")[1].trim(),
		},
	};
}

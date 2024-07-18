import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";
import { getServerSideIP } from "./getServerSideIP";

type isAlreayExistResult =
	| {
			type: "success";
			data: boolean;
	  }
	| {
			type: "error";
			data: string;
	  };

export async function isAlreadyExist(
	sessionHash: string,
	csrfToken: string,
	csrfSubToken: string,
	email: string,
	cookies?: string,
): Promise<isAlreayExistResult> {
	const serverSideIP = await getServerSideIP(sessionHash, csrfToken, cookies);

	if (serverSideIP.type === "error") {
		return {
			type: "error",
			data: serverSideIP.data,
		};
	}

	const response = await fetch(
		buildPath(
			`/index.php?action=checkNewMailUser&ip=${serverSideIP}&nopost=1&csrf_token_check=${csrfToken}&csrf_subtoken_check=${csrfSubToken}&newdomain=${email.split("@")[1]}&newuser=${email.split("@")[0]}&_=${Date.now()}`,
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

	if (!text.startsWith("OK") && !text.startsWith("OFFER")) {
		return {
			type: "error",
			data: text,
		};
	}

	return {
		type: "success",
		data: text !== "OK",
	};
}

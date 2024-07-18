import { buildPath } from "../utils/buildPath";
import { concatCookie } from "../utils/concatCookie";
import { createCookie } from "../utils/createCookie";
import { createRequestOptions } from "../utils/createRequestOptions";

type getEmailsResult =
	| {
			type: "success";
			data: {
				emails: {
					email: string;
					username: string;
					domain: string;
					email_with_alias: string;
					password: string;
					registration_date: string;
				}[];
			};
	  }
	| {
			type: "error";
			data: string;
	  };

export async function getEmails(sessionHash: string, csrfToken: string, cookies?: string): Promise<getEmailsResult> {
	const response = await fetch(
		buildPath("/datagen.php?action=getAddrList"),
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

	const csv = await response.text();

	const parsedCSV = csv
		.split("\n")
		.map((row) => row.split(","))
		.map((row) => {
			if (row.length !== 6) {
				return null;
			}
			return {
				email: removeEscapeQuote(row[0]),
				username: removeEscapeQuote(row[1]),
				domain: removeEscapeQuote(row[2]),
				email_with_alias: removeEscapeQuote(row[3]),
				password: removeEscapeQuote(row[4]),
				registration_date: removeEscapeQuote(row[5]),
			};
		});

	parsedCSV.shift();

	return {
		type: "success",
		data: {
			emails: parsedCSV.filter((row) => !!row),
		},
	};
}

function removeEscapeQuote(str: string): string {
	return str.replace(/^\"/g, "").replace(/\"$/g, "");
}

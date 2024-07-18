export function concatCookie(...cookies: (string | undefined)[]): string {
	return cookies
		.map((cookie) => {
			if (!cookie) {
				return "";
			}

			if (cookie.trim().endsWith(";")) {
				return cookie;
			}

			return `${cookie}; `;
		})
		.join("");
}

export function createCookie(csrfToken?: string, sessionHash?: string): string {
	let csrfTokenCookie = "";
	if (csrfToken || sessionHash) {
		csrfTokenCookie = createCsrfTokenCookie(csrfToken, sessionHash);
	}
	return (
		`cookie_failedSlot=; cookie_timezone=Asia%2FTokyo; cookie_gendomainorder=send4.uk; cookie_keepalive_insert=1; cookie_last_page_addrlist=0; ` +
		csrfTokenCookie
	);
}

export function createCsrfTokenCookie(csrfToken?: string, sessionHash?: string): string {
	return (
		(csrfToken ? `cookie_csrf_token=${csrfToken}; ` : "") +
		(sessionHash ? `cookie_sessionhash=${sessionHash}; ` : "")
	);
}

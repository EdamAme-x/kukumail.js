import { createAccount } from "../lib/operation/createAccount";

export class Kukumail {
	initlized = false;
	sessionHash?: string;
	csrfToken?: string;
	cfClearance?: string;

	constructor(sessionHash?: string, csrfToken?: string, cfClearance?: string) {
		if (sessionHash && csrfToken) {
			this.initlized = true;
			this.sessionHash = sessionHash;
			this.csrfToken = csrfToken;

			if (cfClearance) {
				this.cfClearance = cfClearance;
			}
		}
	}

	buildBaseCookie() {
		return `cf_clearance=${this.cfClearance}; `;
	}

	async createAccount() {
		if (this.initlized) {
			throw new Error("Kukumail is already initialized");
		}

		const result = await createAccount();

		if (result.type === "error") {
			throw new Error(result.data);
		}

		this.initlized = true;
		this.sessionHash = result.data.session_hash;
		this.csrfToken = result.data.csrf_token;
	}

	guardNonInitlized() {
		if (!this.initlized) {
			throw new Error("Kukumail is not initialized, call createAccount() first");
		}
	}
}

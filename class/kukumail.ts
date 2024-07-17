import { createAccount } from "../lib/operation/createAccount";
import { getCsrfToken } from "../lib/utils/getCsrfToken";

export class Kukumail {
	initlized = false;
	sessionHash?: string;
	csrfToken?: string;
	csrfSubToken?: string;
	cfClearance?: string;

	constructor(sessionHash?: string, csrfToken?: string, cfClearance?: string) {
		if (sessionHash && csrfToken) {
			this.initlized = true;
			this.sessionHash = sessionHash;
			this.csrfToken = csrfToken;

			if (cfClearance) {
				this.cfClearance = cfClearance;
			}
			this.updateCsrfToken();
		}

		setInterval(async () => {
			await this.updateCsrfToken();
		}, 24 * 60 * 60 * 1000);
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
		await this.updateCsrfToken();

		return this;
	}

	async updateCsrfToken() {
		this.guardNonInitlized();
		const result = await getCsrfToken(this.sessionHash as string, this.csrfToken as string, this.buildBaseCookie());

		if (result.type === "error") {
			throw new Error(result.data);
		}else {
			this.csrfToken = result.data.csrf_token;
			this.csrfSubToken = result.data.csrf_subtoken;
		}

		return this;
	}

	guardNonInitlized() {
		if (!this.initlized) {
			throw new Error("Kukumail is not initialized, call createAccount() first");
		}
	}

	async waitForInitlized() {
		while (!this.initlized || !this.csrfSubToken) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		return this;
	}
}

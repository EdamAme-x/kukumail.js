import { createAccount } from "../lib/operation/createAccount";
import { getEmails } from "../lib/operation/getEmails";
import { getCsrfToken } from "../lib/operation/getCsrfToken";
import { getAvailableDomains } from "../lib/operation/getAvailableDomains";
import { createRandomEmail } from "../lib/operation/createRandomEmail";
import { getEmailMetadata } from "../lib/operation/getEmailMetadata";
import { deleteEmail } from "../lib/operation/deleteEmail";

export class Kukumail {
	initlized = false;
	sessionHash?: string;
	csrfToken?: string;
	csrfSubToken?: string;
	cfClearance?: string;

	constructor({
		sessionHash,
		csrfToken,
		cfClearance,
	}: {
		sessionHash?: string;
		csrfToken?: string;
		cfClearance?: string;
	}) {
		if (sessionHash) {
			this.initlized = true;
			this.sessionHash = sessionHash;
			if (csrfToken) {
				this.csrfToken = csrfToken;
			}

			if (cfClearance) {
				this.cfClearance = cfClearance;
			}
			this.updateCsrfToken();
		}
	}

	buildBaseCookie() {
		if (!this.cfClearance) {
			return;
		}
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
		} else {
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

	async waitForInitlized(timeout: number = 60, checkInterval: number = 1000) {
		if (this.initlized) {
			return this;
		}

		let count = 0;

		while (!this.initlized) {
			await new Promise((resolve) => setTimeout(resolve, checkInterval));
			count++;
			if (count > timeout) {
				throw new Error("Waiting for initlized timed out");
			}
		}

		return this;
	}

	async getEmails() {
		this.guardNonInitlized();
		return await getEmails(this.sessionHash as string, this.csrfToken as string, this.buildBaseCookie());
	}

	async getEmailMetaData() {
		this.guardNonInitlized();
		return await getEmailMetadata(this.sessionHash as string, this.csrfToken as string, this.buildBaseCookie());
	}

	async getAvailableDomains() {
		this.guardNonInitlized();
		return await getAvailableDomains(this.sessionHash as string, this.csrfToken as string, this.buildBaseCookie());
	}

	async createRandomEmail() {
		this.guardNonInitlized();
		return await createRandomEmail(
			this.sessionHash as string,
			this.csrfToken as string,
			this.csrfSubToken as string,
			this.buildBaseCookie(),
		);
	}

	async deleteEmail(email: string) {
		this.guardNonInitlized();
		return await deleteEmail(this.sessionHash as string, this.csrfToken as string, email, this.buildBaseCookie());
	}
}

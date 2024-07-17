import { createAccount } from "../lib/operation/createAccount";

export class Kukumail {
	initlized = false;
	sessionHash?: string;
    csrfToken?: string;

	constructor(sessionHash?: string) {
		if (sessionHash) {
			this.initlized = true;
			this.sessionHash = sessionHash;
		}
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
			throw new Error("Kukumail is not initialized");
		}
	}
}

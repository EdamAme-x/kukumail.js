import { createAccount } from "../lib/operation/createAccount";

export class Kukumail {
	initlized = false;
	sessionHash?: string;

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
	}

	guardNonInitlized() {
		if (!this.initlized) {
			throw new Error("Kukumail is not initialized");
		}
	}
}

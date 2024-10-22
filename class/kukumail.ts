/**
 * This module contains class to use Kukumail.
 * @module
 */
import { createAccount } from "../lib/operation/createAccount.ts";
import { getEmails, type getEmailsResult } from "../lib/operation/getEmails.ts";
import { getCsrfToken } from "../lib/operation/getCsrfToken.ts";
import { getAvailableDomains, type getAvailableDomainsResult } from "../lib/operation/getAvailableDomains.ts";
import { createRandomEmail, type createRandomEmailResult } from "../lib/operation/createRandomEmail.ts";
import { getEmailMetadata, type getEmailMetadataResult } from "../lib/operation/getEmailMetadata.ts";
import { deleteEmail, type deleteEmailResult } from "../lib/operation/deleteEmail.ts";
import { isAlreadyExist, type isAlreayExistResult } from "../lib/operation/isAlreayExist.ts";
import { createEmail, type createEmailResult } from "../lib/operation/createEmail.ts";
import { createOnetimeEmail, type createOnetimeEmailResult } from "../lib/operation/createOnetimeEmail.ts";
import { sendMail, type sendEmailResult } from "../lib/operation/sendMail.ts";
import { getSendedMails, type getSendedMailsResult } from "../lib/operation/getSendedMails.ts";
import { getReceivedMails, type getReceivedMailsResult } from "../lib/operation/getReceivedMails.ts";
import { createShareLink, type createShareLinkResult } from "../lib/operation/createShareLink.ts";
import { getMailContent, type getMailContentResult } from "../lib/operation/getMailContent.ts";

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
      this.sessionHash = sessionHash;
      if (csrfToken) {
        this.csrfToken = csrfToken;
      }

      if (cfClearance) {
        this.cfClearance = cfClearance;
      }

      if (this.sessionHash && this.csrfToken) {
        this.initlized = true;
      }
    }
  }

  buildBaseCookie(): string | undefined {
    if (!this.cfClearance) {
      return;
    }
    return `cf_clearance=${this.cfClearance}; `;
  }

  async createAccount(): Promise<this> {
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
    await this.updateCsrfToken(true);

    return this;
  }

  async updateCsrfToken(bypass?: boolean): Promise<this> {
    if (bypass) {
      this.guardNonInitlized();
    }
    const result = await getCsrfToken(
      this.sessionHash as string,
      this.csrfToken as string,
      this.buildBaseCookie(),
    );

    if (result.type === "error") {
      throw new Error(result.data);
    } else {
      this.csrfToken = result.data.csrf_token;
      this.csrfSubToken = result.data.csrf_subtoken;

      if (this.sessionHash && this.csrfToken && this.csrfSubToken) {
        this.initlized = true;
      }
    }

    return this;
  }

  async initlize(): Promise<this> {
    if (this.initlized) {
      return this;
    }
    await this.updateCsrfToken();
    await this.waitForInitlized();

    return this;
  }

  guardNonInitlized() {
    if (!this.initlized) {
      throw new Error(
        "Kukumail is not initialized, call createAccount() first",
      );
    } else {
      if (!this.csrfToken || !this.csrfSubToken) {
        throw new Error(
          "Kukumail is not initialized, call updateCsrfToken() first",
        );
      }
    }
  }

  async waitForInitlized(timeout: number = 60, checkInterval: number = 1000): Promise<void | this> {
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

  async getEmails(): Promise<getEmailsResult> {
    this.guardNonInitlized();
    return await getEmails(
      this.sessionHash as string,
      this.csrfToken as string,
      this.buildBaseCookie(),
    );
  }

  async getEmailMetaData(): Promise<getEmailMetadataResult> {
    this.guardNonInitlized();
    return await getEmailMetadata(
      this.sessionHash as string,
      this.csrfToken as string,
      this.buildBaseCookie(),
    );
  }

  async getAvailableDomains(): Promise<getAvailableDomainsResult> {
    this.guardNonInitlized();
    return await getAvailableDomains(
      this.sessionHash as string,
      this.csrfToken as string,
      this.buildBaseCookie(),
    );
  }

  async createRandomEmail(): Promise<createRandomEmailResult> {
    this.guardNonInitlized();
    return await createRandomEmail(
      this.sessionHash as string,
      this.csrfToken as string,
      this.csrfSubToken as string,
      this.buildBaseCookie(),
    );
  }

  async createOnetimeEmail(): Promise<createOnetimeEmailResult> {
    this.guardNonInitlized();
    return await createOnetimeEmail(
      this.sessionHash as string,
      this.csrfToken as string,
      this.csrfSubToken as string,
      this.buildBaseCookie(),
    );
  }

  async createEmail(email: string): Promise<createEmailResult> {
    this.guardNonInitlized();
    return await createEmail(
      this.sessionHash as string,
      this.csrfToken as string,
      email,
      this.buildBaseCookie(),
    );
  }

  async deleteEmail(email: string): Promise<deleteEmailResult> {
    this.guardNonInitlized();
    return await deleteEmail(
      this.sessionHash as string,
      this.csrfToken as string,
      email,
      this.buildBaseCookie(),
    );
  }

  async isAlreadyExist(email: string): Promise<isAlreayExistResult> {
    this.guardNonInitlized();
    return await isAlreadyExist(
      this.sessionHash as string,
      this.csrfToken as string,
      this.csrfSubToken as string,
      email,
      this.buildBaseCookie(),
    );
  }

  async sendMail(
    email: string,
    targetEmail: string,
    subject: string,
    message: string,
  ): Promise<sendEmailResult> {
    this.guardNonInitlized();
    return await sendMail(
      this.sessionHash as string,
      this.csrfToken as string,
      email,
      targetEmail,
      subject,
      message,
      this.buildBaseCookie(),
    );
  }

  async getSendedMails(): Promise<getSendedMailsResult> {
    this.guardNonInitlized();
    return await getSendedMails(
      this.sessionHash as string,
      this.csrfToken as string,
      this.buildBaseCookie(),
    );
  }

  async getReceivedMails(): Promise<getReceivedMailsResult>{
    this.guardNonInitlized();
    return await getReceivedMails(
      this.sessionHash as string,
      this.csrfToken as string,
      this.csrfSubToken as string,
      this.buildBaseCookie(),
    );
  }

  async createShareLink(type: "recv" | "send", id: string): Promise<createShareLinkResult> {
    this.guardNonInitlized();
    return await createShareLink(
      this.sessionHash as string,
      this.csrfToken as string,
      this.csrfSubToken as string,
      type,
      id,
      this.buildBaseCookie(),
    );
  }

  async getMailContent(type: "recv" | "send", id: string): Promise<getMailContentResult> {
    this.guardNonInitlized();
    return await getMailContent(
      this.sessionHash as string,
      this.csrfToken as string,
      this.csrfSubToken as string,
      type,
      id,
      this.buildBaseCookie(),
    );
  }
}

import { buildPath } from "../utils/buildPath.ts";
import { concatCookie } from "../utils/concatCookie.ts";
import { createCookie } from "../utils/createCookie.ts";
import { createRequestOptions } from "../utils/createRequestOptions.ts";
import { getTempHash } from "./getTempHash.ts";

export type sendEmailResult =
  | {
    type: "success";
    data: {
      result: string;
      msg: string;
    };
  }
  | {
    type: "error";
    data: string;
  };

export async function sendMail(
  sessionHash: string,
  csrfToken: string,
  email: string,
  targetEmail: string,
  subject: string,
  message: string,
  cookies?: string,
): Promise<sendEmailResult> {
  const tempHash = await getTempHash(sessionHash, csrfToken, cookies);

  if (tempHash.type === "error") {
    return {
      type: "error",
      data: tempHash.data,
    };
  }

  const response = await fetch(
    buildPath(`/new.php`),
    createRequestOptions(
      {
        method: "POST",
        body:
          `action=sendMail&ajax=1&csrf_token_check=${csrfToken}&sendmail_replymode=&sendmail_replynum=&sendtemp_hash=${tempHash.data}&sendmail_from=${
            encodeURIComponent(email)
          }&sendmail_to=${encodeURIComponent(targetEmail)}&sendmail_subject=${
            encodeURIComponent(subject)
          }&sendmail_content=${
            encodeURIComponent(message)
          }&sendmail_content_add=&file_hash=cef86209145d3d7cf4fafb71c38ebd7a&g-recaptcha-response=03AFcWeA5svg2fS2t7GQjIBc-JJIyipBay268zQ-gZZHz79UyA193Y0Aj2MsF1sdHD-4mk5Ab5F_wiOoKmeD74x3Nq3rvjt7yWAZs-4cZJj3RT4Y9BPT288DIQy-W4R3xrSmc6_zQ-zv2K69DuEbyVj7RferK6DEMUb2haCjzGh31Voa-kzJx7ZQFdOOdcxnzByAJTTk54aXLZ-W9OmiVvyDxQJmEN_m3RBIQIxsoTsOFtbKpr03AFpQiY_YjlMqnLzwsJ_2WZasTo3G4Ua37I9tEGdGeuTQRAabWZkOcHpFtqmf92K5Dd_cheILQtlZ4PdjSuY11GH9dB333FCso-j1RB60pCJUWzwXey1mC2-SsGoz84lcr8p6A2kQEgpuC0CNIuLvWzTjlsN1-LAPqGZTWBRHjL4IW7DbOCGjJI8mkSzAX-hjNB8tKk1E4kd6TiRnRsMsF_IidFu7ph_372aq63hjJQeDNMOuQxMVGSiE95dlEl8uBF0-TMXuNpmfnsVdGee2tK5wJKU9PGixKkbY29opFBIVagTR2XbWp7EXx-Kyib42iaZpqPfmgHM0tlxyE_xNUlT6yS6LrkcGAhKcXpb_cu9p4owjKVazP9WuMAGeHELxOVnVM7VPZKY9H8hYZbuSWW_jScQkvLlZucWnx5suSp2IemftuBOlWvpUXa6_iKBZPc3iQ0lJIG3k6jTn3GXzJh6lZekPi3fJZfMo1Ny26tJxCqCaKUKWS_8BuJpR5_XNbP_3cnmfhuytJGyO3qWfYwEv02ub8Bhv69SSHgN9vrf_xjVdJzwcZ8j4WmbxCBJ-zFJP7qJP8tYxry6PBzHYCKFxVCB87TK0waAV0Mw0kpeEhbSV8vCYUi_hRlhGW1Qmq0YsEord1w3YR2QoFx3w6BrdisyZuWC14MxZfEoJez9QESyA&g-recaptcha-response-v3=03AFcWeA5_ZmxTqeC12cHSVQt9FnJrQujPtjBjMynd8AuEZDhgvEQ5O-Ko8U1zw6pRMi86QSmtPFP6IWtKbOiOhgBTRw0XeOkXQ1SF7H8LtrI3VixBHLAlng9JsOEMZJPlK7ArJmFeAww6eWKfCI62u8giYJ0iN3y49qeeqIfO_g-Dc6phbHvvidkD2-_U-o3FdjxhdzCZ7bor_oOpj4MbxucgX3etb_uCIPiCB6cgrWMg9jhEVXVF5MVY9bSNE0lOiu2PvWm3y2AUFxPKLKa8NtmOzlVOFhQVvK6DrF_A5x80sa8aPH27bjq6_C56cTtoke9umXaUkFZ2MYs9Xgrkwe6kWd-KUaXOWUpGd8Y8mTRWl2mYKCOH1-3klvXxCWskZthGiXDYpL77puWqY6_t53okf49k0BERKntKWMOKEfXN5qXl-nzxeLmQrnbnAKrDqBLYz46Z3FaUzfCsmYXidxYppgq7t87IQ5SHh5KDr8ROHjrpdOiqhkh4cICHVxp7-grcuKfFjwThWU7zOqgN_bOtWQ6i3jp8L7R2mpSE1e-69ysyeRfQFiX0Yp1KVAByYHTYdGHTGIHCmDUcTuXYILdIldmWBObTznNgxqwsDTEqBGeA-eJZyIqnBe1LtdjAuMGFZ1MrNZnp2Glm15TsC1Gxk3wxai1fIy8O25ff_jLzDQe7mW7YbLP4LpQTEJXwVq4JcWiE3VXl5z8Q--lMU5XmCGJckIw_7PVs2wfuzjgyRQRS33CkJwzE_MgFENsiEwokMMMDpsLPwAguj0Ib86m600858OJibaH3YOUxx6i-VrKBY7dhvTfkauvnmf4Y1R0062tpZl15GCLEjkVF-yfgTT4RoyFVDlOjQpXtZWoKvOympKfTzIVJj2f3eRHBjY_734m3hzKh`,
      },
      {
        cookie: concatCookie(createCookie(csrfToken, sessionHash), cookies),
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    ),
  );

  if (response.status !== 200) {
    return {
      type: "error",
      data: response.statusText,
    };
  }

  const json = await response.json();

  if (json.result !== "OK") {
    return {
      type: "error",
      data: json,
    };
  }

  return {
    type: "success",
    data: json,
  };
}

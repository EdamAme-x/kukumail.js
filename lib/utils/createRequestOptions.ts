export function createRequestOptions(
  overrideOptions?: RequestInit,
  overrideHeaders?: HeadersInit,
): RequestInit {
  const options = {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language":
        "ja-JP,ja;q=0.9,ar-SS;q=0.8,ar;q=0.7,en-US;q=0.6,en;q=0.5,ko-KR;q=0.4,ko;q=0.3",
      "cache-control": "no-cache",
      pragma: "no-cache",
      priority: "u=0, i",
      "sec-ch-ua":
        '"Not/A)Brand";v="8", "Chromium";v="100", "Google Chrome";v="100"',
      "sec-ch-ua-arch": '"x86"',
      "sec-ch-ua-bitness": '"64"',
      "sec-ch-ua-full-version": '"100.0.0.0"',
      "sec-ch-ua-full-version-list":
        '"Not/A)Brand";v="8.0.0.0", "Chromium";v="100.0.0.0", "Google Chrome";v="100.0.0.0"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": '""',
      "sec-ch-ua-platform": '"Windows"',
      "sec-ch-ua-platform-version": '"14.0.0"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      cookie:
        "cookie_failedSlot=; cookie_timezone=Asia%2FTokyo; cookie_gendomainorder=send4.uk; cookie_keepalive_insert=1; cookie_last_page_addrlist=0; ",
      ...overrideHeaders,
    },
    body: null,
    method: "GET",
    ...overrideOptions,
  };

  return options;
}

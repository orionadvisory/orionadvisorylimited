export type ParsedCookie = {
  name: string;
  value: string;
  options: {
    path?: string;
    domain?: string;
    expires?: Date;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
  };
};

/**
 * Parse one Set-Cookie header from the API so a Next server action can re-issue it to
 * the browser with identical attributes. The API stays the single source of truth for
 * cookie name, domain, lifetime and flags.
 */
export function parseSetCookie(header: string): ParsedCookie | null {
  const [pair, ...attrs] = header.split(";").map((s) => s.trim());
  const eq = pair?.indexOf("=") ?? -1;
  if (!pair || eq <= 0) return null;

  const cookie: ParsedCookie = {
    name: pair.slice(0, eq),
    value: decodeURIComponent(pair.slice(eq + 1)),
    options: {},
  };

  for (const attr of attrs) {
    const i = attr.indexOf("=");
    const key = (i === -1 ? attr : attr.slice(0, i)).toLowerCase();
    const val = i === -1 ? "" : attr.slice(i + 1);
    switch (key) {
      case "path":
        cookie.options.path = val;
        break;
      case "domain":
        cookie.options.domain = val;
        break;
      case "expires": {
        const d = new Date(val);
        if (!Number.isNaN(d.getTime())) cookie.options.expires = d;
        break;
      }
      case "max-age": {
        const n = Number(val);
        if (Number.isFinite(n)) cookie.options.maxAge = n;
        break;
      }
      case "httponly":
        cookie.options.httpOnly = true;
        break;
      case "secure":
        cookie.options.secure = true;
        break;
      case "samesite": {
        const s = val.toLowerCase();
        if (s === "lax" || s === "strict" || s === "none") cookie.options.sameSite = s;
        break;
      }
    }
  }
  return cookie;
}

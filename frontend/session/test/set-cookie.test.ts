import { describe, expect, it } from "vitest";
import { parseSetCookie } from "../src/set-cookie";

describe("parseSetCookie", () => {
  it("parses the session cookie exactly as the API (hono) emits it", () => {
    const parsed = parseSetCookie(
      "orion_session=abc_DEF-123; Max-Age=2592000; Domain=.orion.africa; Path=/; Expires=Thu, 24 Dec 2026 12:00:00 GMT; HttpOnly; Secure; SameSite=Lax",
    );
    expect(parsed).toEqual({
      name: "orion_session",
      value: "abc_DEF-123",
      options: {
        maxAge: 2592000,
        domain: ".orion.africa",
        path: "/",
        expires: new Date("2026-12-24T12:00:00Z"),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      },
    });
  });

  it("parses a clearing cookie", () => {
    expect(parseSetCookie("orion_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax")).toMatchObject({
      name: "orion_session",
      value: "",
      options: { maxAge: 0, path: "/" },
    });
  });

  it("rejects garbage", () => {
    expect(parseSetCookie("")).toBeNull();
    expect(parseSetCookie("=value")).toBeNull();
    expect(parseSetCookie("novalue")).toBeNull();
  });
});

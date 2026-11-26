import { describe, expect, it } from "vitest";
import { isProgressOnly } from "../src/modules/founder/repo/compliance";
import { assertCanManageMember, can, inScope, scopeForRole } from "../src/modules/founder/permissions";

const E1 = "55555555-5555-4555-8555-555555555555";

describe("workspace role permissions", () => {
  it("only owners and administrators manage members and entities", () => {
    for (const role of ["owner", "administrator"] as const) {
      expect(can(role, "members:manage")).toBe(true);
      expect(can(role, "entity:manage")).toBe(true);
    }
    for (const role of ["compliance_manager", "contributor", "reviewer", "viewer", "external_adviser"] as const) {
      expect(can(role, "members:manage")).toBe(false);
      expect(can(role, "entity:manage")).toBe(false);
    }
  });

  it("viewers can read but not change obligations", () => {
    expect(can("viewer", "obligation:read")).toBe(true);
    expect(can("viewer", "obligation:progress")).toBe(false);
    expect(can("viewer", "obligation:manage")).toBe(false);
  });

  it("contributors progress obligations; compliance managers also manage them", () => {
    expect(can("contributor", "obligation:progress")).toBe(true);
    expect(can("contributor", "obligation:manage")).toBe(false);
    expect(can("compliance_manager", "obligation:manage")).toBe(true);
  });
});

describe("entity scope", () => {
  it("null scope covers every entity; a list covers only its entities", () => {
    expect(inScope(null, E1)).toBe(true);
    expect(inScope([E1], E1)).toBe(true);
    expect(inScope([], E1)).toBe(false);
  });

  it("owners and administrators always get the full workspace", () => {
    expect(scopeForRole("administrator", [E1])).toBeNull();
  });

  it("external advisers must be limited to at least one entity", () => {
    expect(() => scopeForRole("external_adviser", null)).toThrow(/at least one/);
    expect(() => scopeForRole("external_adviser", [])).toThrow(/at least one/);
    expect(scopeForRole("external_adviser", [E1, E1])).toEqual([E1]);
  });

  it("other roles may be full or selected", () => {
    expect(scopeForRole("viewer", undefined)).toBeNull();
    expect(scopeForRole("viewer", [E1])).toEqual([E1]);
  });

  it("rejects an empty selection for every scoped role", () => {
    expect(() => scopeForRole("viewer", [])).toThrow(/at least one entity/);
    expect(() => scopeForRole("compliance_manager", [])).toThrow(/at least one entity/);
  });
});

describe("member management rules", () => {
  it("administrators cannot grant, change or remove owners", () => {
    expect(() => assertCanManageMember("administrator", "viewer", "owner")).toThrow(/Only an owner/);
    expect(() => assertCanManageMember("administrator", "owner")).toThrow(/Only an owner/);
    expect(() => assertCanManageMember("administrator", "viewer", "contributor")).not.toThrow();
  });

  it("owners can manage anyone; non-managers cannot manage at all", () => {
    expect(() => assertCanManageMember("owner", "owner", "administrator")).not.toThrow();
    expect(() => assertCanManageMember("compliance_manager", "viewer", "contributor")).toThrow(/does not allow/);
  });
});

describe("obligation update permission", () => {
  it("treats a status-only change as progress", () => {
    expect(isProgressOnly({ status: "in_progress" })).toBe(true);
    expect(isProgressOnly({ status: "completed" })).toBe(true);
  });

  it("requires manage for ruling out, re-dating or re-explaining", () => {
    expect(isProgressOnly({ status: "not_applicable" })).toBe(false);
    expect(isProgressOnly({ dueAt: "2027-03-31T12:00:00.000Z" })).toBe(false);
    expect(isProgressOnly({ status: "completed", explanation: "x" })).toBe(false);
  });
});

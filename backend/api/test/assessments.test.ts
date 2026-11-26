import type { PublishedAssessment } from "@orion/contracts";
import { describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers";

const published: PublishedAssessment = {
  template: { id: "11111111-1111-4111-8111-111111111111", name: "Legal Health Check", description: null },
  sections: [
    { id: "22222222-2222-4222-8222-222222222222", title: "Corporate", description: "Entity basics", orderIndex: 0 },
  ],
  questions: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      sectionId: "22222222-2222-4222-8222-222222222222",
      questionKey: "incorporated",
      prompt: "Is the company incorporated?",
      description: null,
      inputType: "boolean",
      options: null,
      domain: "corporate",
      required: true,
      weight: 3,
      orderIndex: 0,
    },
  ],
};

describe("GET /v1/assessments/published", () => {
  it("returns the published template with sections and questions", async () => {
    const res = await makeApp({ assessments: { getPublished: async () => published } }).request(
      "/v1/assessments/published",
    );
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ data: published });
  });

  it("404s when nothing is published", async () => {
    const res = await makeApp({ assessments: { getPublished: async () => null } }).request(
      "/v1/assessments/published",
    );
    expect(res.status).toBe(404);
    expect((await json(res)).error.code).toBe("not_found");
  });
});

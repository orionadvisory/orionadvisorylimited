import "server-only";
import type { Partner } from "@orion/contracts";
import { api, ApiRequestError, PUBLIC_API_URL } from "./client";

export type PartnerWithLogo = Partner & { logoUrl: string };

/** Partner organisations for the landing-page marquee, with absolute logo URLs. */
export async function listPartners(): Promise<PartnerWithLogo[]> {
  const res = await api.v1.partners.$get();
  if (!res.ok) throw new ApiRequestError("GET /v1/partners", res.status);
  const { data } = await res.json();
  return data.map((p) => ({ ...p, logoUrl: `${PUBLIC_API_URL}${p.logoPath}` }));
}

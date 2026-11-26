import { miscRepo } from "./misc";
import { templatesRepo } from "./templates";
import { usersRepo } from "./users";

/** Drizzle-backed admin operations. Every mutation writes an `admin_*` audit entry. */
export const adminRepo = { ...usersRepo, ...templatesRepo, ...miscRepo };

export type AdminRepo = typeof adminRepo;

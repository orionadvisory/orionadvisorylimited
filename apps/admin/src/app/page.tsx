import { redirect } from "next/navigation";

// The admin app serves everything under /admin — send the root there.
export default function AdminRoot() {
  redirect("/admin");
}

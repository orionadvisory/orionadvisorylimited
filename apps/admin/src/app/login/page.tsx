import type { Metadata } from "next";
import AdminLoginForm from "@/components/auth/admin-login-form";

export const metadata: Metadata = {
  title: "Sign in — Orion Admin",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-12">
      <AdminLoginForm />
    </div>
  );
}

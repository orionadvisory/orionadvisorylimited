import { Logo } from "@orion/ui/components/ui/logo";
import { ConfirmEmailCard } from "@/components/auth/email-verification/confirm-email-card";

export const metadata = { title: "Confirm your email · ORION" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-canvas px-4 py-12">
      <Logo size={36} />
      <ConfirmEmailCard token={typeof token === "string" && token ? token : null} />
    </main>
  );
}

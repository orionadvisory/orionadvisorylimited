"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@orion/ui/components/ui/button";
import { Logo } from "@orion/ui/components/ui/logo";
import { logIn } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await logIn(formData);
    },
    undefined
  );

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
        <span className="grid place-items-center rounded-xl bg-[#1f2933] p-2 shadow-sm">
          <Logo size={26} />
        </span>
        <span className="text-lg font-semibold text-gray-900">Orion</span>
      </Link>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Sign in to Orion</h1>
          <p className="text-sm text-gray-500 mt-1">Your legal platform for startups</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
              placeholder="you@startup.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full" size="md">
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-indigo-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

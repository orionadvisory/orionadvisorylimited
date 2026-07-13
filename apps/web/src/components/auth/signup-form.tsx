"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@orion/ui/components/ui/button";
import { Logo } from "@orion/ui/components/ui/logo";
import { signUp } from "@/app/actions/auth";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await signUp(formData);
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
          <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start your legal journey with Orion</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
              placeholder="Alex Johnson"
            />
          </div>
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
              minLength={8}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
              placeholder="Min 8 characters"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full" size="md">
            {pending ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          By signing up, you agree to our{" "}
          <span className="text-gray-600 underline cursor-pointer">Terms</span> and{" "}
          <span className="text-gray-600 underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

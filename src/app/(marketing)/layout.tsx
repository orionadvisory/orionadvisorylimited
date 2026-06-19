import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu } from "lucide-react";
import "./marketing.css";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-page min-h-screen">
      <header className="relative z-50 border-b-2 border-[#17211b] bg-[#fffaf0]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2.5 font-black">
            <span className="grid size-10 rotate-[-3deg] place-items-center rounded-xl border-2 border-[#17211b] bg-[#ffd84d] shadow-[3px_3px_0_#17211b]">
              <Image src="/images/logo/icon.svg" alt="" width={24} height={24} />
            </span>
            <span className="text-xl">Orion</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <Link href="/health-check" className="text-sm font-bold hover:underline">Health check</Link>
            <Link href="/pricing" className="text-sm font-bold hover:underline">Packages</Link>
            <Link href="/login" className="text-sm font-bold hover:underline">Sign in</Link>
            <Link href="/signup" className="sticker-shadow-sm inline-flex items-center gap-2 rounded-full border-2 border-[#17211b] bg-[#ff6b4a] px-5 py-2.5 text-sm font-black text-white transition-transform duration-150 hover:-translate-y-0.5">
              Get started <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <details className="relative md:hidden">
            <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-xl border-2 border-[#17211b] bg-white shadow-[3px_3px_0_#17211b] [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" aria-hidden="true" />
              <span className="sr-only">Open navigation menu</span>
            </summary>
            <div className="absolute right-0 top-14 flex w-64 flex-col gap-1 rounded-2xl border-2 border-[#17211b] bg-white p-3 shadow-[5px_5px_0_#17211b]">
              <Link href="/health-check" className="rounded-xl px-4 py-3 font-bold hover:bg-[#fff3c4]">Health check</Link>
              <Link href="/pricing" className="rounded-xl px-4 py-3 font-bold hover:bg-[#fff3c4]">Packages</Link>
              <Link href="/login" className="rounded-xl px-4 py-3 font-bold hover:bg-[#fff3c4]">Sign in</Link>
              <Link href="/signup" className="mt-1 rounded-xl border-2 border-[#17211b] bg-[#ff6b4a] px-4 py-3 text-center font-black text-white">Get started</Link>
            </div>
          </details>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t-2 border-[#17211b] bg-[#17211b] px-4 py-10 text-[#fffaf0] sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black">
              <span className="grid size-9 place-items-center rounded-lg bg-[#ffd84d] text-[#17211b]">O</span> Orion
            </Link>
            <p className="mt-3 max-w-sm text-sm text-[#fffaf0]/70 text-pretty">Legal clarity for founders building ambitious things.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
            <Link href="/health-check" className="hover:underline">Health check</Link>
            <Link href="/pricing" className="hover:underline">Packages</Link>
            <Link href="/login" className="hover:underline">Sign in</Link>
          </div>
          <p className="text-xs text-[#fffaf0]/60">© 2026 Orion · UK · US · Nigeria</p>
        </div>
      </footer>
    </div>
  );
}

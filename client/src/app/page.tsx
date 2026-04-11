"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const features = [
  "Secure signup and login with JWT authentication",
  "Protected dashboard for logged-in users only",
  "Create, edit, and delete your own events",
  "Upload one cover image plus multiple gallery or brochure files",
  "Validation for required fields, file type restrictions, and size limits",
];

export default function Home() {
  const { continueAsGuest, isAuthenticated, isGuest, isHydrated, user } = useAuth();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_60%)] px-6 py-16 text-white">
      <section className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Mini Event Management App</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            A simple event platform where users can manage events and upload event media.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            This project includes public and protected sections, event CRUD flows, file uploads,
            validation, and token-based authentication as required by the assignment.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {isHydrated && (isAuthenticated || isGuest) ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-cyan-400 px-6 py-3 text-center font-medium text-slate-950 transition hover:bg-cyan-300"
                >
                  Go to dashboard
                </Link>
                <span className="rounded-full border border-white/15 px-6 py-3 text-center text-sm text-slate-300">
                  Signed in as {user?.name}
                </span>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="rounded-full bg-cyan-400 px-6 py-3 text-center font-medium text-slate-950 transition hover:bg-cyan-300"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/20 px-6 py-3 text-center font-medium text-white transition hover:bg-white/10"
                >
                  Log in
                </Link>
                <button
                  type="button"
                  onClick={continueAsGuest}
                  className="rounded-full border border-cyan-300/30 px-6 py-3 text-center font-medium text-cyan-100 transition hover:bg-white/10"
                >
                  Continue as guest
                </button>
                <Link
                  href="/admin-login"
                  className="rounded-full border border-amber-300/30 px-6 py-3 text-center font-medium text-amber-100 transition hover:bg-white/10"
                >
                  Admin login
                </Link>
              </>
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-cyan-400/20 bg-slate-900/70 p-8 shadow-xl">
          <h2 className="text-2xl font-semibold">What this app includes</h2>
          <div className="mt-6 space-y-4">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-6 text-slate-200">{feature}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

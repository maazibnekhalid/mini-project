import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <section className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-12">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Mini Event Management App</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Plan, create, and manage your events from one simple dashboard.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Sign up, log in, create events with optional image uploads, and keep your own event list organized.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
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
        </div>
      </section>
    </main>
  );
}

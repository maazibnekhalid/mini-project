"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { login } from "@/services/auth";
import { type LoginFormValues, loginSchema } from "@/utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const { continueAsGuest, isAuthenticated, isHydrated, setSession } = useAuth();
  const { notify } = useNotifications();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values);
      setSession(response.data.user, response.data.token);
      notify("Logged in successfully.", "success");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Unable to log in."
          : "Unable to log in.";
      notify(message, "error");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Log in to manage your events.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
            />
            {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
            />
            {errors.password ? (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-slate-900">
            Sign up
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              continueAsGuest();
              notify("Continuing as guest.", "info");
              router.push("/dashboard");
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Continue as guest
          </button>
          <Link
            href="/admin-login"
            className="w-full rounded-2xl border border-amber-200 px-4 py-3 text-center font-medium text-amber-700 transition hover:bg-amber-50"
          >
            Admin login
          </Link>
        </div>
      </section>
    </main>
  );
}

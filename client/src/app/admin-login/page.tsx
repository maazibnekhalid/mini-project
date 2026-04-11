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

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, isHydrated, setSession } = useAuth();
  const { notify } = useNotifications();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@mini-event-app.local",
      password: "Admin12345!",
    },
  });

  useEffect(() => {
    if (isHydrated && isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, isHydrated, router]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values);

      if (response.data.user.role !== "admin") {
        notify("This account is not an admin account.", "error");
        return;
      }

      setSession(response.data.user, response.data.token);
      notify("Admin login successful.", "success");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Unable to log in as admin."
          : "Unable to log in as admin.";
      notify(message, "error");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Admin login</h1>
        <p className="mt-2 text-sm text-slate-600">Use the seeded admin account to view all users and events.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <input
              type="email"
              placeholder="Admin email"
              {...register("email")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
            />
            {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
          </div>
          <div>
            <input
              type="password"
              placeholder="Admin password"
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
            {isSubmitting ? "Signing in..." : "Sign in as admin"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Back to{" "}
          <Link href="/login" className="font-medium text-slate-900">
            user login
          </Link>
        </p>
      </section>
    </main>
  );
}

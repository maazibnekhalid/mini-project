"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { signup } from "@/services/auth";
import { type SignupFormValues, signupSchema } from "@/utils/validation";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, setSession } = useAuth();
  const { notify } = useNotifications();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isHydrated, router]);

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const response = await signup(values);
      setSession(response.data.user, response.data.token);
      notify("Account created successfully.", "success");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Unable to sign up."
          : "Unable to sign up.";
      notify(message, "error");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Start building your event list.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full name"
              {...register("name")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
            />
            {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
          </div>

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
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-900">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

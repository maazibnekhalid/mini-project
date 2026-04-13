"use client"; // Ensures this component runs on the client side (needed for hooks like useState, useEffect)

import { zodResolver } from "@hookform/resolvers/zod"; // Connects Zod validation schema with React Hook Form
import { AxiosError } from "axios"; // Used to properly handle API errors
import Link from "next/link"; // Next.js routing component
import { useRouter } from "next/navigation"; // For programmatic navigation
import { useEffect } from "react";
import { useForm } from "react-hook-form"; // Form handling library

// Custom hooks for global state
import { useAuth } from "@/hooks/useAuth"; // Handles authentication state
import { useNotifications } from "@/hooks/useNotifications"; // Handles toast/notifications

// API service
import { login } from "@/services/auth";

// Types + validation schema
import { type LoginFormValues, loginSchema } from "@/utils/validation";

export default function AdminLoginPage() {
  const router = useRouter();

  // Auth context: check if user is admin, if state is ready, and function to store session
  const { isAdmin, isHydrated, setSession } = useAuth();

  // Notification system (toast messages)
  const { notify } = useNotifications();

  // React Hook Form setup
  const {
    register, // connects inputs to form state
    handleSubmit, // handles form submission
    formState: { errors, isSubmitting }, // validation errors + loading state
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), // attach Zod validation schema
    defaultValues: {
      email: "admin@mini-event-app.local", // pre-filled admin credentials (for testing/demo)
      password: "Admin12345!",
    },
  });

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isHydrated && isAdmin) {
      router.replace("/dashboard"); // prevent access to login page
    }
  }, [isAdmin, isHydrated, router]);

  // Form submit handler
  const onSubmit = async (values: LoginFormValues) => {
    try {
      // Call backend login API
      const response = await login(values);

      // Check if logged-in user is actually an admin
      if (response.data.user.role !== "admin") {
        notify("This account is not an admin account.", "error");
        return;
      }

      // Save session (user + token) in global auth context
      setSession(response.data.user, response.data.token);

      // Success notification
      notify("Admin login successful.", "success");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      // Handle API errors gracefully
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
        
        {/* Page Heading */}
        <h1 className="text-3xl font-semibold text-slate-900">Admin login</h1>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600">
          Use the seeded admin account to view all users and events.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          
          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Admin email"
              {...register("email")} // bind to form
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
            />
            {/* Validation Error */}
            {errors.email ? (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder="Admin password"
              {...register("password")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
            />
            {/* Validation Error */}
            {errors.password ? (
              <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting} // disable during API call
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Signing in..." : "Sign in as admin"}
          </button>
        </form>

        {/* Navigation Link */}
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
"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createEvent, deleteEvent, getEvents, type EventItem } from "@/services/event";
import { useAuthStore } from "@/store/authStore";

type FormState = {
  title: string;
  description: string;
  date: string;
  location: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  date: "",
  location: "",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [form, setForm] = useState<FormState>(initialForm);
  const [image, setImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    const loadEvents = async () => {
      try {
        const response = await getEvents(token);
        setEvents(response.data);
      } catch (err) {
        const message =
          err instanceof AxiosError
            ? err.response?.data?.message || "Unable to load events."
            : "Unable to load events.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvents();
  }, [router, token]);

  const handleChange =
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      router.replace("/login");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("date", form.date);
    formData.append("location", form.location);

    if (image) {
      formData.append("image", image);
    }

    gallery.forEach((file) => formData.append("gallery", file));

    try {
      const response = await createEvent(formData, token);
      setEvents((current) => [...current, response.data].sort((a, b) => a.date.localeCompare(b.date)));
      setForm(initialForm);
      setImage(null);
      setGallery([]);
      setMessage("Event created successfully.");
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Unable to create event."
          : "Unable to create event.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteEvent(id, token);
      setEvents((current) => current.filter((eventItem) => eventItem._id !== id));
      setMessage("Event deleted.");
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Unable to delete event."
          : "Unable to delete event.";
      setError(message);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-8 text-white sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold">Hello, {user?.name || "User"}</h1>
            <p className="mt-2 text-sm text-slate-300">Create and manage your upcoming events.</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium transition hover:bg-white/10"
          >
            Log out
          </button>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleCreate} className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Create event</h2>
            <div className="mt-6 grid gap-4">
              <input
                type="text"
                placeholder="Event title"
                value={form.title}
                onChange={handleChange("title")}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={handleChange("description")}
                className="min-h-32 rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
              <input
                type="datetime-local"
                value={form.date}
                onChange={handleChange("date")}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={handleChange("location")}
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                required
              />
              <label className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
                Cover image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImage(event.target.files?.[0] || null)}
                  className="mt-2 block w-full text-sm"
                />
              </label>
              <label className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
                Gallery images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => setGallery(Array.from(event.target.files || []))}
                  className="mt-2 block w-full text-sm"
                />
              </label>
            </div>

            {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Saving..." : "Save event"}
            </button>
          </form>

          <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Your events</h2>
            {isLoading ? <p className="mt-6 text-slate-500">Loading events...</p> : null}
            {!isLoading && events.length === 0 ? (
              <p className="mt-6 text-slate-500">No events yet. Create your first one from the form.</p>
            ) : null}
            <div className="mt-6 space-y-4">
              {events.map((eventItem) => (
                <article key={eventItem._id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{eventItem.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{eventItem.location}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(eventItem._id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{eventItem.description}</p>
                  <p className="mt-3 text-sm text-slate-500">{new Date(eventItem.date).toLocaleString()}</p>
                  {eventItem.imageUrl ? (
                    <a
                      href={`http://localhost:5000/${eventItem.imageUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-cyan-700"
                    >
                      View uploaded image
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

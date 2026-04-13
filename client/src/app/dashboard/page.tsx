"use client";

import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EventForm } from "@/components/events/EventForm";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { getAdminOverview, type AdminEventItem } from "@/services/admin";
import { createEvent, deleteEvent, getEvents, updateEvent, type EventItem } from "@/services/event";
import { getUploadUrl } from "@/utils/files";
import type { EventFormValues } from "@/utils/validation";
import type { AuthUser } from "@/services/auth";

const imageFilePattern = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

export default function DashboardPage() {
  const router = useRouter();
  const { clearSession, isAdmin, isAuthenticated, isGuest, isHydrated, token, user } = useAuth();
  const { notify } = useNotifications();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [adminUsers, setAdminUsers] = useState<AuthUser[]>([]);
  const [adminEvents, setAdminEvents] = useState<AdminEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [activePanel, setActivePanel] = useState<"form" | "events" | "overview">("form");

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.replace("/");
      return;
    }

    const loadDashboardData = async () => {
      try {
        // Custom Requirement: Admin dashboard
        // Admin sees all users and all events instead of personal event CRUD.
        if (isAdmin && token) {
          const response = await getAdminOverview(token);
          setAdminUsers(response.data.users);
          setAdminEvents(response.data.events);
          setActivePanel("overview");
          return;
        }

        // PDF Requirement: Protected user dashboard
        // Normal signed-in users only see the events they created.
        if (isAuthenticated && token) {
          const response = await getEvents(token);
          setEvents(response.data);
          return;
        }
      } catch (error) {
        const message =
          error instanceof AxiosError
            ? error.response?.data?.message || "Unable to load dashboard data."
            : "Unable to load dashboard data.";
        notify(message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, [isAdmin, isAuthenticated, isHydrated, notify, router, token, user]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  const toFormData = (values: EventFormValues) => {
    // PDF Requirement: File uploads with cover image + gallery/documents
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("date", values.date);
    formData.append("location", values.location);

    values.image.forEach((file) => formData.append("image", file));
    values.gallery.forEach((file) => formData.append("gallery", file));

    return formData;
  };

  const handleSaveEvent = async (values: EventFormValues) => {
    if (!token || isGuest || isAdmin) {
      return;
    }

    //  Event CRUD for authenticated users
    setIsSaving(true);

    try {
      const formData = toFormData(values);

      if (editingEvent) {
        const response = await updateEvent(editingEvent._id, formData, token);
        setEvents((current) =>
          current.map((eventItem) => (eventItem._id === editingEvent._id ? response.data : eventItem))
        );
        notify("Event updated successfully.", "success");
        setEditingEvent(null);
        setActivePanel("events");
      } else {
        const response = await createEvent(formData, token);
        setEvents((current) => [...current, response.data]);
        notify("Event created successfully.", "success");
        setActivePanel("events");
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Unable to save event."
          : "Unable to save event.";
      notify(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      return;
    }

    // PDF Requirement: Event delete action
    try {
      await deleteEvent(id, token);
      setEvents((current) => current.filter((eventItem) => eventItem._id !== id));
      if (editingEvent?._id === id) {
        setEditingEvent(null);
      }
      notify("Event deleted.", "success");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Unable to delete event."
          : "Unable to delete event.";
      notify(message, "error");
    }
  };

  const handleLogout = () => {
    clearSession();
    notify("You have been logged out.", "info");
    router.push("/");
  };

  const isImageFile = (filePath?: string) => {
    if (!filePath) {
      return false;
    }

    return imageFilePattern.test(filePath);
  };

  if (!isHydrated) {
    return <main className="min-h-screen bg-slate-100 px-4 py-8" />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2e8f0_0%,#f8fafc_30%,#f8fafc_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-8 text-white sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold">Hello, {user?.name || "User"}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {isAdmin
                ? "Review all users and the events they have created."
                : isGuest
                  ? "Explore the platform as a guest. Register to create and manage events."
                  : "Create, edit, and manage the events you own."}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium transition hover:bg-white/10"
          >
            Log out
          </button>
        </header>

        {isAuthenticated && !isAdmin ? (
          <section className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActivePanel("form")}
              className={`rounded-full px-5 py-3 text-sm font-medium transition ${
                activePanel === "form"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {editingEvent ? "Edit Event Window" : "Add Event Window"}
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("events")}
              className={`rounded-full px-5 py-3 text-sm font-medium transition ${
                activePanel === "events"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              My Events Window
            </button>
          </section>
        ) : null}

        {isGuest ? (
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm font-medium">Guest Preview</p>
            </div>
            <div className="space-y-6 p-8">
              <h2 className="text-3xl font-semibold text-slate-900">You are browsing as a guest</h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Guests can view the app experience, but only registered users can add, edit, or manage events.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  "Create and manage your own events after sign up",
                  "Upload cover images and gallery files",
                  "Edit and delete events from your private dashboard",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Register now
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Login
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {isAdmin ? (
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm font-medium">Admin Overview</p>
            </div>
            <div className="space-y-8 p-6 sm:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Total users</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{adminUsers.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Total events</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{adminEvents.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Admin account</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{user?.email}</p>
                </div>
              </div>

              <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
                <section>
                  <h2 className="text-2xl font-semibold text-slate-900">Users</h2>
                  <div className="mt-4 space-y-3">
                    {adminUsers.map((adminUser) => (
                      <article key={adminUser._id} className="rounded-2xl border border-slate-200 p-4">
                        <p className="font-medium text-slate-900">{adminUser.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{adminUser.email || "Guest session"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{adminUser.role}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-slate-900">All events</h2>
                  <div className="mt-4 space-y-4">
                    {adminEvents.map((eventItem) => (
                      <article key={eventItem._id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{eventItem.title}</h3>
                            <p className="mt-1 text-sm text-slate-600">{eventItem.location}</p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <p>{eventItem.createdBy?.name || "Unknown user"}</p>
                            <p>{eventItem.createdBy?.email || ""}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-700">{eventItem.description}</p>
                        <p className="mt-3 text-sm text-slate-500">{new Date(eventItem.date).toLocaleString()}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </section>
        ) : null}

        {isAuthenticated && !isAdmin ? (
        <section className="grid gap-8">
          <section className={`${activePanel === "form" ? "block" : "hidden"}`}>
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <p className="text-sm font-medium">
                  {editingEvent ? "Edit Event" : "Add Event"}
                </p>
              </div>
              <div className="bg-white">
                <EventForm
                  initialEvent={editingEvent}
                  isSubmitting={isSaving}
                  onCancel={() => setEditingEvent(null)}
                  onSubmit={handleSaveEvent}
                />
              </div>
            </div>
          </section>

          <section className={`${activePanel === "events" ? "block" : "hidden"}`}>
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <p className="text-sm font-medium">My Events</p>
              </div>
              <section className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-slate-900">Your events</h2>
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                    {sortedEvents.length} total
                  </span>
                </div>
                {isLoading ? <p className="mt-6 text-slate-500">Loading events...</p> : null}
                {!isLoading && sortedEvents.length === 0 ? (
                  <p className="mt-6 text-slate-500">No events yet. Create your first one from the form.</p>
                ) : null}
                <div className="mt-6 space-y-4">
                  {sortedEvents.map((eventItem) => (
                    <article key={eventItem._id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{eventItem.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">{eventItem.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEvent(eventItem);
                              setActivePanel("form");
                            }}
                            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(eventItem._id)}
                            className="rounded-full border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{eventItem.description}</p>
                      <p className="mt-3 text-sm text-slate-500">{new Date(eventItem.date).toLocaleString()}</p>
                      <div className="mt-4 space-y-4">
                        {eventItem.imageUrl ? (
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="relative h-48 w-full">
                              <Image
                                src={getUploadUrl(eventItem.imageUrl)}
                                alt={`${eventItem.title} cover`}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                              <p className="text-sm font-medium text-slate-800">Cover image</p>
                              <a
                                href={getUploadUrl(eventItem.imageUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-medium text-cyan-700"
                              >
                                Open
                              </a>
                            </div>
                          </div>
                        ) : null}
                        {eventItem.gallery?.length ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {eventItem.gallery.map((filePath, index) => {
                              const fileUrl = getUploadUrl(filePath);

                              if (isImageFile(filePath)) {
                                return (
                                  <div
                                    key={`${eventItem._id}-${filePath}-${index}`}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                                  >
                                    <div className="relative h-40 w-full">
                                      <Image
                                        src={fileUrl}
                                        alt={`${eventItem.title} media ${index + 1}`}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                      <p className="text-sm font-medium text-slate-800">
                                        Gallery image {index + 1}
                                      </p>
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium text-cyan-700"
                                      >
                                        Open
                                      </a>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <a
                                  key={`${eventItem._id}-${filePath}-${index}`}
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                  View file {index + 1}
                                </a>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </section>
        ) : null}
      </div>
    </main>
  );
}

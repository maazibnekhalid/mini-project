"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { EventItem } from "@/services/event";
import { type EventFormInput, type EventFormValues, eventSchema } from "@/utils/validation";

type EventFormProps = {
  initialEvent?: EventItem | null;
  isSubmitting: boolean;
  onCancel?: () => void;
  onSubmit: (values: EventFormValues) => Promise<void>;
};

export function EventForm({ initialEvent, isSubmitting, onCancel, onSubmit }: EventFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormInput, undefined, EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialEvent?.title || "",
      description: initialEvent?.description || "",
      date: initialEvent?.date ? new Date(initialEvent.date).toISOString().slice(0, 16) : "",
      location: initialEvent?.location || "",
    },
  });

  useEffect(() => {
    reset({
      title: initialEvent?.title || "",
      description: initialEvent?.description || "",
      date: initialEvent?.date ? new Date(initialEvent.date).toISOString().slice(0, 16) : "",
      location: initialEvent?.location || "",
      image: undefined,
      gallery: undefined,
    });
  }, [initialEvent, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {initialEvent ? "Edit event" : "Create event"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {initialEvent
              ? "Update the event details and save your changes."
              : "Fill out the details below to create a new event."}
          </p>
        </div>
        {initialEvent && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4">
        <div>
          <input
            type="text"
            placeholder="Event title"
            {...register("title")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
          />
          {errors.title ? <p className="mt-2 text-sm text-red-600">{errors.title.message}</p> : null}
        </div>

        <div>
          <textarea
            placeholder="Description"
            {...register("description")}
            className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
          />
          {errors.description ? (
            <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
          ) : null}
        </div>

        <div>
          <input
            type="datetime-local"
            {...register("date")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
          />
          {errors.date ? <p className="mt-2 text-sm text-red-600">{errors.date.message}</p> : null}
        </div>

        <div>
          <input
            type="text"
            placeholder="Location"
            {...register("location")}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
          />
          {errors.location ? (
            <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>
          ) : null}
        </div>

        <div>
          <label className="block rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
            Cover image
            <input type="file" accept="image/*" {...register("image")} className="mt-2 block w-full text-sm" />
          </label>
          {initialEvent?.imageUrl ? (
            <p className="mt-2 text-xs text-slate-500">Leave blank to keep the current cover image.</p>
          ) : null}
          {errors.image ? <p className="mt-2 text-sm text-red-600">{errors.image.message as string}</p> : null}
        </div>

        <div>
          <label className="block rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
            Gallery files
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              multiple
              {...register("gallery")}
              className="mt-2 block w-full text-sm"
            />
          </label>
          {initialEvent?.gallery?.length ? (
            <p className="mt-2 text-xs text-slate-500">Leave blank to keep the current gallery files.</p>
          ) : null}
          {errors.gallery ? (
            <p className="mt-2 text-sm text-red-600">{errors.gallery.message as string}</p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Saving..." : initialEvent ? "Update event" : "Save event"}
      </button>
    </form>
  );
}

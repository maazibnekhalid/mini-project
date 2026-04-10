import api from "./api";

export type EventItem = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  gallery?: string[];
  createdBy: string;
};

export const createEvent = (data: FormData, token: string) =>
  api.post("/events", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getEvents = (token: string) =>
  api.get<EventItem[]>("/events", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteEvent = (id: string, token: string) =>
  api.delete(`/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

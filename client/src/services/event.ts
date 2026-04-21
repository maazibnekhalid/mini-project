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
  api.post<EventItem>("/events", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getEvents = (token?: string | null) =>
  api.get<EventItem[]>("/events", token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);

export const deleteEvent = (id: string, token: string) =>
  api.delete(`/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateEvent = (id: string, data: FormData, token: string) =>
  api.put<EventItem>(`/events/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

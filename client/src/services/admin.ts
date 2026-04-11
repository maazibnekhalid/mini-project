import api from "./api";
import type { AuthUser } from "./auth";
import type { EventItem } from "./event";

export type AdminEventItem = Omit<EventItem, "createdBy"> & {
  createdBy: AuthUser;
};

export type AdminOverviewResponse = {
  users: AuthUser[];
  events: AdminEventItem[];
};

export const getAdminOverview = (token: string) =>
  api.get<AdminOverviewResponse>("/admin/overview", {
    headers: { Authorization: `Bearer ${token}` },
  });

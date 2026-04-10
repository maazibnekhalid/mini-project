import api from "./api";

export type AuthPayload = {
  name?: string;
  email: string;
  password: string;
};

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export const signup = (data: AuthPayload) => api.post<AuthResponse>("/auth/signup", data);
export const login = (data: AuthPayload) => api.post<AuthResponse>("/auth/login", data);

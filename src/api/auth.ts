import { request } from "./client";

// Auth endpoints mirror the Go identity handler routes (cmd/api main.go).

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  status: "pending" | "active" | "deactivated";
  createdAt: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  async refresh(): Promise<LoginResponse> {
    return request<LoginResponse>("/api/v1/auth/refresh", { method: "POST" });
  },

  async logout(): Promise<void> {
    await request<void>("/api/v1/auth/logout", { method: "POST" });
  },

  async session(): Promise<AuthUser> {
    return request<AuthUser>("/api/v1/auth/session");
  },

  async forgotPassword(email: string): Promise<void> {
    await request<void>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await request<void>("/api/v1/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
    });
  },

  async acceptInvite(token: string, password: string): Promise<AuthUser> {
    return request<AuthUser>("/api/v1/auth/accept-invite", {
      method: "POST",
      body: { token, password },
    });
  },
};

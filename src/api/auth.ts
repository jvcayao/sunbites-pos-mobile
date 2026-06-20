import client from "./client";
import type { AuthUser, LoginResponse } from "@/types/auth";

export const authApi = {
  login: (email: string, password: string) =>
    client.post<LoginResponse>("/auth/login", { email, password }),

  logout: () => client.post("/auth/logout"),

  me: () => client.get<AuthUser>("/auth/user"),

  setBranch: (branchId: number, previousBranchId?: number) =>
    client.post("/auth/branch", {
      branch_id: branchId,
      previous_branch_id: previousBranchId,
    }),
};

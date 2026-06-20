export type UserRole = "admin" | "manager" | "supervisor" | "cashier";

export interface Branch {
  id: number;
  name: string;
  slug: string;
}

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  roles: UserRole[];
  branches: Branch[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

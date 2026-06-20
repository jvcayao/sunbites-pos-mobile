import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types/auth";

export const ROLE_PERMISSIONS = {
  dashboard: ["admin", "manager", "supervisor"] as UserRole[],
  pos: ["admin", "manager", "supervisor", "cashier"] as UserRole[],
  enrollment: ["admin", "manager"] as UserRole[],
  students: ["admin", "manager", "supervisor"] as UserRole[],
  reports: ["admin", "manager"] as UserRole[],
  references: ["admin", "manager", "supervisor"] as UserRole[],
  references_branches: ["admin"] as UserRole[],
  references_users: ["admin", "manager"] as UserRole[],
  reminders: ["admin", "manager", "supervisor"] as UserRole[],
  reminders_send: ["admin", "manager"] as UserRole[],
  announcements: ["admin", "manager", "supervisor"] as UserRole[],
  pre_registrations: ["admin", "manager", "supervisor"] as UserRole[],
  pre_registrations_action: ["admin", "manager"] as UserRole[],
} as const;

export function usePermission(key: keyof typeof ROLE_PERMISSIONS): boolean {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  return user.roles.some((role) =>
    (ROLE_PERMISSIONS[key] as readonly UserRole[]).includes(role),
  );
}

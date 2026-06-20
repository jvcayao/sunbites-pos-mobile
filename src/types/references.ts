import type { UserRole, Branch } from "./auth";
import type { SchoolMonth } from "./student";

// ── Inventory ─────────────────────────────────────────────────────────────────

export type InventoryStatus = "OK" | "LOW" | "OUT" | "OVER";
export type InventoryLogType = "restock" | "waste" | "manual" | "sale";

export interface InventoryItem {
  id: number;
  branch_id: number;
  name: string;
  quantity: number;
  unit: string;
  restock_threshold: number;
  overstock_threshold: number | null;
  cost_per_unit: number | null;
  is_archived: boolean;
  status: InventoryStatus;
}

export interface InventoryLog {
  id: number;
  inventory_item_id: number;
  order_id: number | null;
  adjusted_by: number;
  adjusted_by_name: string;
  type: InventoryLogType;
  quantity_change: number;
  stock_after: number;
  item_name_snapshot: string;
  reason: string;
  created_at: string;
}

/** @deprecated Use CreateInventoryDto */
export type InventoryItemCreate = CreateInventoryDto;

export interface CreateInventoryDto {
  name: string;
  unit: string;
  quantity: number;
  restock_threshold: number;
  overstock_threshold?: number;
  cost_per_unit?: number;
}

// ── Meal Planner ──────────────────────────────────────────────────────────────

export interface MealDay {
  day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  ulam: string;
  vegetables: string;
  fruit: string;
  soup: string;
  snacks: string;
}

export interface MealPlannerWeek {
  month: SchoolMonth;
  week_number: 1 | 2 | 3 | 4;
  visible_to_parents: boolean;
  days: MealDay[];
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface CreateUserDto {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
  roles: UserRole[];
  branch_ids: number[];
  phone?: string;
  position?: string;
  employment_type?: string;
  date_hired?: string;
  daily_rate?: number;
  birthday?: string;
  gender?: string;
  civil_status?: string;
  sss?: string;
  pagibig?: string;
  philhealth?: string;
  tin?: string;
}

export interface StaffUser {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  roles: UserRole[];
  branches: Branch[];
  birthday: string | null;
  gender: string | null;
  civil_status: string | null;
  phone: string | null;
  position: string | null;
  employment_type: string | null;
  date_hired: string | null;
  daily_rate: number | null;
  is_active: boolean;
}

// ── Branches ──────────────────────────────────────────────────────────────────

export interface BranchDetail extends Branch {
  gcash_number: string | null;
  address: string | null;
  is_active: boolean;
  stats?: { staff_count: number; student_count: number; orders_today: number };
}

// ── Subscription Config ───────────────────────────────────────────────────────

export interface BranchMonthlyAmount {
  id: number;
  branch_id: number;
  school_month: SchoolMonth;
  year: number;
  school_days: number;
  amount: number | null;
}

export interface SystemConfig {
  key: string;
  label: string;
  description: string | null;
  value: string;
  type: "integer" | "decimal" | "text";
}

// ── Parents ───────────────────────────────────────────────────────────────────

export interface Parent {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  activation_status: "active" | "pending";
  disabled_at: string | null;
  deleted_at: string | null;
  students: { id: number; full_name: string; grade_level: string }[];
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export type FeedbackCategory =
  | "food_quality"
  | "service"
  | "portion_size"
  | "cleanliness"
  | "general";

export interface FeedbackItem {
  id: number;
  category: FeedbackCategory;
  student_name: string;
  rating: number;
  message: string | null;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  is_read: boolean;
}

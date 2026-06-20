import type { OrderPaymentMethod } from "./order";
import type { UserRole } from "./auth";

export type StaffStatus =
  | "Working"
  | "Off"
  | "OnLeave"
  | "Emergency"
  | "OnBreak";

export interface DashboardOrder {
  id: number;
  receipt_number: string;
  created_at: string;
  student_name: string | null;
  item_count: number;
  payment_method: OrderPaymentMethod;
  total: number;
}

export interface StaffMember {
  id: number;
  full_name: string;
  roles: UserRole[];
  status: StaffStatus;
}

export interface TopItem {
  name: string;
  qty_sold: number;
}

export interface LowStockItem {
  id: number;
  name: string;
  quantity: number;
  status: "LOW" | "OUT";
}

export interface CreditAlert {
  id: number;
  full_name: string;
  grade_level: string;
  credit_balance: number;
}

export interface DashboardData {
  total_students: number;
  enrolled_count: number;
  meals_today: number;
  revenue_today: number;
  walkin_orders: number;
  wallet_orders: number;
  recent_orders: DashboardOrder[];
  staff_roster: StaffMember[];
  top_items: TopItem[];
  low_stock: LowStockItem[];
  credit_alerts: CreditAlert[];
}

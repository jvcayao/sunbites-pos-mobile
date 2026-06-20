import type { OrderPaymentMethod } from "./order";

// ── Shared ───────────────────────────────────────────────────────────────────

export interface ReportMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

// ── Sales ────────────────────────────────────────────────────────────────────

export interface SalesReportParams {
  page?: number;
  date_from?: string;
  date_to?: string;
  payment_method?: OrderPaymentMethod | "all";
  customer_type?: "registered" | "walkin" | "all";
}

export interface SalesReportItem {
  id: number;
  receipt_number: string;
  created_at: string;
  cashier_name: string;
  student_name: string | null;
  item_count: number;
  payment_method: OrderPaymentMethod;
  discount_amount: number;
  total: number;
}

export interface SalesSummary {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  total_discounts: number;
  net_revenue: number;
}

export interface SalesReportResponse {
  data: SalesReportItem[];
  summary: SalesSummary;
  meta: ReportMeta;
}

// ── Students ─────────────────────────────────────────────────────────────────

export interface StudentsReportParams {
  page?: number;
  enrollment_status?: string;
  grade_level?: string;
  student_type?: string;
}

export interface StudentsReportItem {
  id: number;
  student_number: string;
  full_name: string;
  grade_level: string;
  section: string | null;
  enrollment_status: string;
  wallet_balance: number;
  total_spent: number;
}

export interface StudentsSummary {
  total_enrolled: number;
  by_grade: Record<string, number>;
  by_status: Record<string, number>;
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface WalletReportParams {
  page?: number;
  date_from?: string;
  date_to?: string;
}

export interface WalletReportItem {
  id: number;
  full_name: string;
  grade_level: string;
  wallet_balance: number;
  total_credited: number;
  total_debited: number;
  last_transaction_at: string | null;
}

export interface WalletSummary {
  total_credits: number;
  total_debits: number;
  net_movement: number;
  below_threshold_count: number;
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export interface InventoryReportParams {
  status?: string;
  type?: string;
  item_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface InventoryReportItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  restock_threshold: number;
  overstock_threshold: number | null;
  cost_per_unit: number | null;
  status: string;
  updated_at: string;
}

export interface InventoryLogItem {
  id: number;
  created_at: string;
  item_name: string;
  type: string;
  quantity_change: number;
  quantity_after: number;
  notes: string | null;
  adjusted_by: string;
  order_id: number | null;
}

export interface InventorySummary {
  out_of_stock: number;
  below_threshold: number;
  overstock: number;
}

// ── Billing ───────────────────────────────────────────────────────────────────

export interface BillingReportParams {
  page?: number;
  year?: number;
  school_month?: string;
  payment_status?: string;
  grade_level?: string;
}

export interface BillingReportItem {
  id: number;
  student_number: string;
  full_name: string;
  grade_level: string;
  section: string | null;
  school_month: string;
  amount: number;
  status: string;
  paid_on: string | null;
  recorded_by: string | null;
}

export interface BillingSummary {
  total_subscribers: number;
  total_collected: number;
  total_outstanding: number;
  collection_rate: number;
}

// ── Credits ───────────────────────────────────────────────────────────────────

export interface CreditsReportParams {
  page?: number;
  date_from?: string;
  date_to?: string;
  type?: string;
  search?: string;
}

export interface CreditsReportItem {
  id: number;
  created_at: string;
  full_name: string;
  grade_level: string;
  type: string;
  amount: number;
  notes: string | null;
  staff_name: string;
}

export interface CreditsSummary {
  total_charged: number;
  total_settled: number;
  total_voided: number;
  net_outstanding: number;
}

// ── Activity ──────────────────────────────────────────────────────────────────

export interface ActivityReportParams {
  page?: number;
  date_from?: string;
  date_to?: string;
  category?: string;
  search?: string;
}

export interface ActivityItem {
  id: number;
  created_at: string;
  user_name: string;
  action: string;
  category: string;
  subject: string;
  properties: Record<string, unknown>;
}

// ── Daily Summary ─────────────────────────────────────────────────────────────

export interface DailySummaryData {
  date: string;
  total_orders: number;
  by_payment_method: { method: string; count: number; amount: number }[];
  by_cashier: { name: string; orders: number; amount: number }[];
  items_sold: { name: string; qty: number; revenue: number }[];
}

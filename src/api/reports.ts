import client from "./client";
import type {
  SalesReportParams,
  StudentsReportParams,
  WalletReportParams,
  InventoryReportParams,
  BillingReportParams,
  CreditsReportParams,
  ActivityReportParams,
} from "@/types/reports";

export const reportsApi = {
  sales: (params: SalesReportParams) =>
    client.get("/reports/sales", { params }),
  students: (params: StudentsReportParams) =>
    client.get("/reports/students", { params }),
  wallet: (params: WalletReportParams) =>
    client.get("/reports/wallet", { params }),
  inventory: (params: InventoryReportParams) =>
    client.get("/reports/inventory", { params }),
  billing: (params: BillingReportParams) =>
    client.get("/reports/billing", { params }),
  credits: (params: CreditsReportParams) =>
    client.get("/reports/credits", { params }),
  activity: (params: ActivityReportParams) =>
    client.get("/reports/activity", { params }),
  dailySummary: (date: string) =>
    client.get("/reports/daily-summary", { params: { date } }),
};

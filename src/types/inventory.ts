export type InventoryStatus = "OK" | "LOW" | "OUT" | "OVER";

export type InventoryLogType = "restock" | "waste" | "manual" | "sale";

export interface InventoryItem {
  id: number;
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
  type: InventoryLogType;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  notes: string | null;
  created_at: string;
}

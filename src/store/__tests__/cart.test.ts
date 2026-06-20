import { useCartStore } from "../cart";
import type { PosMenuItem } from "@/types/menu";

const makeItem = (overrides: Partial<PosMenuItem> = {}): PosMenuItem => ({
  id: 1,
  name: "Chicken Rice",
  price: 65,
  category: "meal",
  is_available: true,
  is_subscription_item: false,
  sort_order: 1,
  inventory_status: "OK",
  has_inventory_mapping: true,
  ...overrides,
});

const item1 = makeItem({ id: 1, name: "Chicken Rice", price: 65 });
const item2 = makeItem({
  id: 2,
  name: "Juice Box",
  price: 25,
  category: "drink",
});

beforeEach(() => {
  useCartStore.getState().clearCart();
});

// ── addItem ───────────────────────────────────────────────────────────────────

describe("useCartStore — addItem", () => {
  it("adds a new item with quantity 1", () => {
    useCartStore.getState().addItem(item1);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].menuItem.id).toBe(1);
    expect(items[0].quantity).toBe(1);
  });

  it("increments quantity when the same item is added twice", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item1);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("adds multiple different items independently", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
  });
});

// ── removeItem ────────────────────────────────────────────────────────────────

describe("useCartStore — removeItem", () => {
  it("removes an item by id", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().removeItem(item1.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("does not affect other items when removing one", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    useCartStore.getState().removeItem(item1.id);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].menuItem.id).toBe(item2.id);
  });

  it("is a no-op for a non-existent id", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().removeItem(999);
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

// ── updateQuantity ────────────────────────────────────────────────────────────

describe("useCartStore — updateQuantity", () => {
  it("updates the quantity of an existing item", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().updateQuantity(item1.id, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("removes the item when quantity is set to 0", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().updateQuantity(item1.id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes the item when quantity is set to a negative number", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().updateQuantity(item1.id, -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ── clearCart ─────────────────────────────────────────────────────────────────

describe("useCartStore — clearCart", () => {
  it("empties the cart and resets to initial state", () => {
    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);
    useCartStore.getState().setPaymentMethod("gcash");
    useCartStore.getState().setNotes("no onions");
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.student).toBeNull();
    expect(state.isWalkIn).toBe(false);
    expect(state.paymentMethod).toBe("cash");
    expect(state.notes).toBe("");
  });
});

// ── setStudent / setIsWalkIn ──────────────────────────────────────────────────

describe("useCartStore — student / walk-in", () => {
  it("sets the active student", () => {
    const student = {
      id: 1,
      full_name: "Maria Santos",
      student_number: "ANT-001",
      grade_level: "Grade 3",
      wallet_balance: 500,
      credit_balance: 0,
    };
    useCartStore.getState().setStudent(student);
    expect(useCartStore.getState().student?.id).toBe(1);
  });

  it("sets walk-in mode", () => {
    useCartStore.getState().setIsWalkIn(true);
    expect(useCartStore.getState().isWalkIn).toBe(true);
  });

  it("clears student and notes on clearCart", () => {
    const student = {
      id: 1,
      full_name: "Maria Santos",
      student_number: "ANT-001",
      grade_level: "Grade 3",
      wallet_balance: 500,
      credit_balance: 0,
    };
    useCartStore.getState().setStudent(student);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().student).toBeNull();
  });
});

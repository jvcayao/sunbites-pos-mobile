import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Divider, Text, TextInput } from "react-native-paper";
import { formatCurrency } from "@/lib/formatters";
import { usePermission } from "@/lib/permissions";
import { useCartStore } from "@/store/cart";
import { EmptyState } from "@/components/shared/EmptyState";
import { MonoText } from "@/components/shared/MonoText";
import { CartItemRow } from "./CartItemRow";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { CashInput } from "./CashInput";
import { DiscountInput } from "./DiscountInput";
import { CheckoutConfirmSheet } from "./CheckoutConfirmSheet";
import { palette } from "@/theme";
import type { OrderPaymentMethod } from "@/types/order";
import type { CheckoutPayload } from "@/types/pos";

interface CartPanelProps {
  onCheckout: (payload: CheckoutPayload) => void;
  loading?: boolean;
}

type DiscountType = "percent" | "fixed";

export function CartPanel({ onCheckout, loading = false }: CartPanelProps) {
  // Use Zustand selectors — never destructure the whole store
  const items = useCartStore((s) => s.items);
  const student = useCartStore((s) => s.student);
  const isWalkIn = useCartStore((s) => s.isWalkIn);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const notes = useCartStore((s) => s.notes);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const setNotes = useCartStore((s) => s.setNotes);

  // Only admin/manager can apply discounts per spec
  const isAdminOrManager = usePermission("enrollment");

  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [cashTendered, setCashTendered] = useState("");
  const [gcashRef, setGcashRef] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0),
    [items],
  );

  const computedDiscount = useMemo(() => {
    const amt = parseFloat(discountAmount || "0");
    return discountType === "percent" ? (subtotal * amt) / 100 : amt;
  }, [discountAmount, discountType, subtotal]);

  const total = Math.max(0, subtotal - computedDiscount);

  const canCheckout = useMemo(() => {
    if (items.length === 0) return false;
    if (paymentMethod === "cash") {
      return parseFloat(cashTendered || "0") >= total;
    }
    if (paymentMethod === "wallet" && student === null) return false;
    if (computedDiscount > 0 && discountReason.trim() === "") return false;
    return true;
  }, [
    items,
    paymentMethod,
    cashTendered,
    total,
    student,
    computedDiscount,
    discountReason,
  ]);

  const handleConfirm = (): void => {
    const payload: CheckoutPayload = {
      student_id: student?.id,
      payment_method: paymentMethod as OrderPaymentMethod,
      items: items.map((i) => ({
        pos_menu_item_id: i.menuItem.id,
        quantity: i.quantity,
      })),
      notes: notes || undefined,
      discount_amount: computedDiscount > 0 ? computedDiscount : undefined,
      discount_reason: computedDiscount > 0 ? discountReason : undefined,
      amount_tendered:
        paymentMethod === "cash" ? parseFloat(cashTendered) : undefined,
      reference_number:
        paymentMethod === "gcash" ? gcashRef || undefined : undefined,
    };
    onCheckout(payload);
    setShowConfirm(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text variant="titleMedium" style={styles.heading}>
        Order Summary
      </Text>
      <Divider />

      {/* Cart panel uses ScrollView + map because:
          - Cart items are always a small count (1–15 max)
          - Items + checkout form must scroll together as one unit
          - FlatList in a flex child gets squashed by the tall footer */}
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="Cart is empty"
            subtitle="Tap a menu item to add it"
          />
        ) : (
          <View style={styles.itemList}>
            {items.map((item) => (
              <CartItemRow
                key={item.menuItem.id}
                item={item}
                onIncrement={() => addItem(item.menuItem)}
                onDecrement={() =>
                  updateQuantity(item.menuItem.id, item.quantity - 1)
                }
                onRemove={() => removeItem(item.menuItem.id)}
              />
            ))}
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.footer}>
            <TextInput
              mode="outlined"
              label="Order notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              style={styles.notes}
              accessibilityLabel="Order notes"
            />

            {isAdminOrManager && (
              <DiscountInput
                type={discountType}
                amount={discountAmount}
                reason={discountReason}
                subtotal={subtotal}
                onTypeChange={setDiscountType}
                onAmountChange={setDiscountAmount}
                onReasonChange={setDiscountReason}
              />
            )}

            <Divider style={styles.divider} />
            {computedDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text variant="bodyMedium" style={styles.totalLabel}>
                  Subtotal
                </Text>
                <MonoText size="md">{formatCurrency(subtotal)}</MonoText>
              </View>
            )}
            {computedDiscount > 0 && (
              <View style={styles.totalRow}>
                <Text variant="bodyMedium" style={styles.discountLabel}>
                  Discount
                </Text>
                <MonoText size="md" color={palette.orange500}>
                  −{formatCurrency(computedDiscount)}
                </MonoText>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text variant="titleMedium" style={styles.totalBold}>
                Total
              </Text>
              <MonoText size="lg" weight="bold" color={palette.orange500}>
                {formatCurrency(total)}
              </MonoText>
            </View>

            <PaymentMethodSelector
              selected={paymentMethod as OrderPaymentMethod}
              onSelect={setPaymentMethod}
            />

            {paymentMethod === "cash" && (
              <CashInput
                total={total}
                tendered={cashTendered}
                onTenderedChange={setCashTendered}
              />
            )}
            {paymentMethod === "gcash" && (
              <TextInput
                mode="outlined"
                label="GCash Reference # (optional)"
                value={gcashRef}
                onChangeText={setGcashRef}
                style={styles.notes}
                accessibilityLabel="GCash reference number"
              />
            )}
            {paymentMethod === "wallet" && student !== null && (
              <View style={styles.walletRow}>
                <Text variant="bodySmall" style={styles.walletLabel}>
                  Balance
                </Text>
                <MonoText
                  size="md"
                  color={
                    student.wallet_balance >= total
                      ? palette.green500
                      : palette.red500
                  }
                >
                  {formatCurrency(student.wallet_balance)}
                </MonoText>
              </View>
            )}

            <Button
              mode="contained"
              onPress={() => setShowConfirm(true)}
              disabled={!canCheckout || loading}
              loading={loading}
              style={styles.confirmBtn}
              contentStyle={styles.confirmContent}
              accessibilityRole="button"
              accessibilityLabel="Confirm purchase"
            >
              Confirm Purchase
            </Button>
          </View>
        )}
      </ScrollView>

      <CheckoutConfirmSheet
        visible={showConfirm}
        student={student}
        isWalkIn={isWalkIn}
        items={items}
        subtotal={subtotal}
        discountAmount={computedDiscount}
        total={total}
        paymentMethod={paymentMethod as OrderPaymentMethod}
        amountTendered={
          paymentMethod === "cash" ? parseFloat(cashTendered) : undefined
        }
        loading={loading}
        onConfirm={handleConfirm}
        onDismiss={() => setShowConfirm(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  heading: { padding: 16, fontWeight: "700", color: palette.zinc950 },
  scroll: { flex: 1 },
  itemList: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  footer: { padding: 16, gap: 12 },
  notes: { backgroundColor: palette.white },
  divider: { marginVertical: 4 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { color: palette.zinc500 },
  discountLabel: { color: palette.orange500 },
  totalBold: { fontWeight: "700", color: palette.zinc950 },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  walletLabel: { color: palette.zinc500 },
  confirmBtn: { marginTop: 8 },
  confirmContent: { paddingVertical: 6 },
});

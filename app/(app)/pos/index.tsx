import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Appbar, FAB, SegmentedButtons, Text } from "react-native-paper";
import { useCartStore } from "@/store/cart";
import { usePermission } from "@/lib/permissions";
import { useLayout } from "@/hooks/useLayout";
import { useCheckout, usePosTransactions, useVoidOrder } from "@/hooks/usePos";
import { formatCurrency } from "@/lib/formatters";
import { getApiError } from "@/lib/errors";
import { useToast } from "@/components/shared/ErrorToast";
import { EmptyState } from "@/components/shared/EmptyState";
import { DatePresetPicker } from "@/components/shared/DatePresetPicker";
import { FilterChip, FilterChipRow } from "@/components/shared/FilterChip";
import { StudentSearchInput } from "@/components/pos/StudentSearchInput";
import { MenuGrid } from "@/components/pos/MenuGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { TransactionRow } from "@/components/pos/TransactionRow";
import { VoidOrderSheet } from "@/components/pos/VoidOrderSheet";
import { MenuMgmtTab } from "@/components/pos/MenuMgmtTab";
import { PosInventoryTab } from "@/components/pos/PosInventoryTab";
import { AppHeader } from "@/components/shared/AppHeader";
import { palette } from "@/theme";
import type { PosMenuItem } from "@/types/menu";
import type { PosStudent } from "@/types/student";
import type { Order } from "@/types/order";
import type { CheckoutPayload, TransactionParams } from "@/types/pos";
import type { DateRange } from "@/components/shared/DatePresetPicker";

type PosTab = "pos" | "transactions" | "menu_mgmt" | "inventory";

export default function PosScreen() {
  const { isTablet, isLandscape } = useLayout();
  const toast = useToast();

  const canMenuMgmt = usePermission("enrollment"); // admin/manager
  const canInventory = usePermission("references"); // admin/manager/supervisor

  const {
    items: cartItems,
    student,
    isWalkIn,
    addItem,
    setStudent,
    setIsWalkIn,
    clearCart,
  } = useCartStore();

  const [tab, setTab] = useState<PosTab>("pos");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showCartSheet, setShowCartSheet] = useState(false);

  // Transaction filters
  const [txDateRange, setTxDateRange] = useState<DateRange>({
    from: "",
    to: "",
  });
  const [txPayment, setTxPayment] = useState("all");
  const [txStatus, setTxStatus] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Order | null>(null);

  const txParams: Omit<TransactionParams, "page"> = {
    date_from: txDateRange.from || undefined,
    date_to: txDateRange.to || undefined,
    payment_method: txPayment as TransactionParams["payment_method"],
    status: txStatus as TransactionParams["status"],
  };
  const {
    data: txPages,
    refetch: refetchTx,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isRefetching: isRefetchingTx,
  } = usePosTransactions(txParams);
  const txOrders = txPages?.pages.flatMap((p) => p.data) ?? [];

  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();
  const { mutate: voidOrder, isPending: isVoiding } = useVoidOrder();

  const handleAddToCart = useCallback(
    (item: PosMenuItem) => {
      addItem(item);
    },
    [addItem],
  );

  const handleSelectStudent = useCallback(
    (s: PosStudent) => {
      setStudent(s);
      setIsWalkIn(false);
    },
    [setStudent, setIsWalkIn],
  );

  const handleSetWalkIn = useCallback(() => {
    setStudent(null);
    setIsWalkIn(true);
  }, [setStudent, setIsWalkIn]);

  const handleClearStudent = useCallback(() => {
    setStudent(null);
    setIsWalkIn(false);
  }, [setStudent, setIsWalkIn]);

  const handleCheckout = (payload: CheckoutPayload): void => {
    const receiptItems = cartItems.map((ci) => ({
      pos_menu_item_id: ci.menuItem.id,
      name: ci.menuItem.name,
      price: ci.menuItem.price,
      quantity: ci.quantity,
    }));
    checkout(payload, {
      onSuccess: (res) => {
        const order = res.data.order;
        setCompletedOrder({
          ...order,
          payment_method: order.payment_method ?? payload.payment_method,
          items: order.items?.length ? order.items : receiptItems,
        });
        clearCart();
      },
      onError: (err) => toast.error(getApiError(err)),
    });
  };

  const handleVoidOrder = (reason: string): void => {
    if (voidTarget === null) return;
    voidOrder(
      { id: voidTarget.id, reason },
      {
        onSuccess: () => {
          toast.success("Order voided");
          setVoidTarget(null);
        },
        onError: (err) => toast.error(getApiError(err)),
      },
    );
  };

  const tabButtons = [
    { value: "pos", label: "POS" },
    { value: "transactions", label: "Transactions" },
    ...(canMenuMgmt ? [{ value: "menu_mgmt", label: "Menu Mgmt" }] : []),
    ...(canInventory ? [{ value: "inventory", label: "Inventory" }] : []),
  ];

  const showSplitPane = isTablet || isLandscape;

  // POS main content (left side or full width on phone)
  const posContent =
    tab === "pos" ? (
      <View style={styles.posLeft}>
        <View style={styles.searchArea}>
          <StudentSearchInput
            selectedStudent={student}
            isWalkIn={isWalkIn}
            onSelectStudent={handleSelectStudent}
            onSetWalkIn={handleSetWalkIn}
            onClearStudent={handleClearStudent}
          />
        </View>
        <MenuGrid onItemPress={handleAddToCart} />
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <AppHeader title="Point of Sale" />

      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as PosTab)}
        buttons={tabButtons}
        style={styles.tabs}
      />

      {/* POS Tab */}
      {tab === "pos" &&
        (showSplitPane ? (
          // Tablet: side-by-side split pane
          <View style={styles.splitPane}>
            <View style={styles.splitLeft}>{posContent}</View>
            <View style={styles.splitRight}>
              <CartPanel onCheckout={handleCheckout} loading={isCheckingOut} />
            </View>
          </View>
        ) : (
          // Phone: full screen with floating cart button
          <View style={styles.phonePos}>
            {posContent}
            <FAB
              icon="cart"
              label={
                cartItems.length > 0
                  ? `View Cart (${cartItems.length}) · ${formatCurrency(cartItems.reduce((s, i) => s + i.menuItem.price * i.quantity, 0))}`
                  : "Cart (empty)"
              }
              onPress={() => setShowCartSheet(true)}
              style={styles.cartFab}
              accessibilityLabel={`View cart, ${cartItems.length} items`}
              accessibilityRole="button"
            />
            <Modal visible={showCartSheet} animationType="slide">
              <View style={styles.cartModal}>
                <Appbar.Header>
                  <Appbar.BackAction onPress={() => setShowCartSheet(false)} />
                  <Appbar.Content title="Cart" />
                </Appbar.Header>
                <CartPanel
                  onCheckout={(p) => {
                    handleCheckout(p);
                    setShowCartSheet(false);
                  }}
                  loading={isCheckingOut}
                />
              </View>
            </Modal>
          </View>
        ))}

      {/* Transactions Tab */}
      {tab === "transactions" && (
        <View style={styles.tabContent}>
          <FilterChipRow>
            <FilterChip
              label="Date"
              active={!!txDateRange.from}
              onPress={() => setShowDatePicker(true)}
            />
            {(["all", "cash", "gcash", "wallet", "subscription"] as const).map(
              (m) => (
                <FilterChip
                  key={m}
                  label={m === "all" ? "All Methods" : m}
                  active={txPayment === m}
                  onPress={() => setTxPayment(m)}
                />
              ),
            )}
          </FilterChipRow>
          <FilterChipRow>
            {(["all", "completed", "voided"] as const).map((s) => (
              <FilterChip
                key={s}
                label={s === "all" ? "All Status" : s}
                active={txStatus === s}
                onPress={() => setTxStatus(s)}
              />
            ))}
          </FilterChipRow>
          {txOrders.length === 0 ? (
            <EmptyState icon="receipt-outline" title="No transactions found" />
          ) : (
            <FlatList
              data={txOrders}
              keyExtractor={(o) => String(o.id)}
              renderItem={({ item }) => <TransactionRow order={item} />}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetchingTx}
                  onRefresh={refetchTx}
                  tintColor={palette.orange500}
                />
              }
              onEndReached={() => {
                if (hasNextPage) void fetchNextPage();
              }}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <Text style={styles.loadingMore}>Loading…</Text>
                ) : null
              }
            />
          )}
          <DatePresetPicker
            visible={showDatePicker}
            value={txDateRange}
            onConfirm={(range) => {
              setTxDateRange(range);
              setShowDatePicker(false);
            }}
            onDismiss={() => setShowDatePicker(false)}
          />
          {voidTarget !== null && (
            <VoidOrderSheet
              visible
              receiptNumber={voidTarget.receipt_number}
              loading={isVoiding}
              onConfirm={handleVoidOrder}
              onDismiss={() => setVoidTarget(null)}
            />
          )}
        </View>
      )}

      {/* Menu Mgmt Tab — create/edit/toggle/delete menu items */}
      {tab === "menu_mgmt" && <MenuMgmtTab />}

      {/* Inventory Tab — view stock levels + adjust */}
      {tab === "inventory" && <PosInventoryTab />}

      {/* Receipt after checkout */}
      {completedOrder !== null && (
        <Modal visible animationType="slide">
          <ReceiptModal
            order={completedOrder}
            onNewOrder={() => setCompletedOrder(null)}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  tabs: { marginHorizontal: 16, marginVertical: 8 },
  tabContent: { flex: 1 },
  posLeft: { flex: 1 },
  searchArea: { paddingHorizontal: 16, paddingTop: 8 },
  phonePos: { flex: 1 },
  splitPane: { flex: 1, flexDirection: "row" },
  splitLeft: { flex: 3 },
  splitRight: {
    flex: 2,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: palette.zinc200,
  },
  cartFab: {
    position: "absolute",
    bottom: 24,
    right: 16,
    left: 16,
    borderRadius: 16,
  },
  cartModal: { flex: 1, backgroundColor: palette.white },
  loadingMore: { textAlign: "center", color: palette.zinc500, padding: 12 },
});

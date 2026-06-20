import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
} from "react-native-paper";
import {
  useLinkedStock,
  useAttachLinkedStock,
  useDetachLinkedStock,
  usePosInventory,
} from "@/hooks/usePos";
import { useToast } from "@/components/shared/ErrorToast";
import { getApiError } from "@/lib/errors";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { palette } from "@/theme";
import type { LinkedStockItem, PosInventoryItem } from "@/types/pos";

interface LinkedStockSheetProps {
  menuItemId: number;
  menuItemName: string;
  visible: boolean;
  onClose: () => void;
}

export function LinkedStockSheet({
  menuItemId,
  menuItemName,
  visible,
  onClose,
}: LinkedStockSheetProps) {
  const toast = useToast();
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(
    null,
  );
  const [qtyInput, setQtyInput] = useState("1");
  const [removeTarget, setRemoveTarget] = useState<LinkedStockItem | null>(
    null,
  );

  const { data: rawLinked, isLoading: isLoadingLinked } =
    useLinkedStock(menuItemId);
  const { data: inventoryData } = usePosInventory();
  const { mutate: attach, isPending: isAttaching } = useAttachLinkedStock();
  const { mutate: detach, isPending: isDetaching } = useDetachLinkedStock();

  const linked: LinkedStockItem[] = Array.isArray(rawLinked)
    ? rawLinked
    : ((rawLinked as unknown as { data?: LinkedStockItem[] })?.data ?? []);

  const allInventory: PosInventoryItem[] = Array.isArray(inventoryData)
    ? (inventoryData as PosInventoryItem[])
    : ((inventoryData as unknown as { data?: PosInventoryItem[] })?.data ?? []);

  const linkedIds = new Set(linked.map((l) => l.id));
  const available = allInventory.filter((i) => !linkedIds.has(i.id));

  const handleAttach = (): void => {
    if (selectedInventoryId === null) return;
    const qty = parseInt(qtyInput, 10);
    if (qty < 1) return;
    attach(
      {
        menuItemId,
        data: { inventory_item_id: selectedInventoryId, quantity_used: qty },
      },
      {
        onSuccess: () => {
          toast.success("Stock linked");
          setSelectedInventoryId(null);
          setQtyInput("1");
        },
        onError: (err: unknown) => toast.error(getApiError(err)),
      },
    );
  };

  const handleDetach = (): void => {
    if (removeTarget === null) return;
    detach(
      { menuItemId, inventoryItemId: removeTarget.id },
      {
        onSuccess: () => {
          toast.success("Link removed");
          setRemoveTarget(null);
        },
        onError: (err: unknown) => toast.error(getApiError(err)),
      },
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modal}
      >
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>
            Linked Stock: {menuItemName}
          </Text>
          <Divider />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Linked items table */}
            {isLoadingLinked ? (
              <Text style={styles.meta}>Loading…</Text>
            ) : linked.length === 0 ? (
              <Text style={styles.meta}>No stock linked yet.</Text>
            ) : (
              <>
                <View style={styles.tableHeader}>
                  <Text
                    variant="labelSmall"
                    style={[styles.col1, styles.headerText]}
                  >
                    Inventory Item
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={[styles.col2, styles.headerText]}
                  >
                    Qty/Sale
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={[styles.col3, styles.headerText]}
                  >
                    Action
                  </Text>
                </View>
                {linked.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text variant="bodySmall" style={styles.col1}>
                      {item.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.col2}>
                      {item.quantity_used} {item.unit}
                    </Text>
                    <Button
                      compact
                      mode="text"
                      textColor={palette.red500}
                      onPress={() => setRemoveTarget(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.name}`}
                    >
                      Remove
                    </Button>
                  </View>
                ))}
              </>
            )}

            <Divider style={styles.divider} />

            {/* Add Link form */}
            <Text variant="labelMedium" style={styles.addTitle}>
              + Add Link
            </Text>
            <View style={styles.addRow}>
              {/* Inventory item selector — simple list since Picker needs native dependency */}
              <View style={styles.selectorWrap}>
                <Text variant="labelSmall" style={styles.meta}>
                  Select Inventory Item
                </Text>
                {available.length === 0 ? (
                  <Text variant="bodySmall" style={styles.meta}>
                    All items already linked
                  </Text>
                ) : (
                  available.map((inv) => (
                    <Button
                      key={inv.id}
                      compact
                      mode={
                        selectedInventoryId === inv.id
                          ? "contained"
                          : "outlined"
                      }
                      onPress={() => setSelectedInventoryId(inv.id)}
                      style={styles.invOption}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${inv.name}`}
                    >
                      {inv.name} ({inv.unit})
                    </Button>
                  ))
                )}
              </View>
              <View style={styles.qtyRow}>
                <TextInput
                  mode="outlined"
                  label="Qty"
                  value={qtyInput}
                  onChangeText={setQtyInput}
                  keyboardType="number-pad"
                  style={styles.qtyInput}
                  accessibilityLabel="Quantity per sale"
                />
                <Button
                  mode="contained"
                  onPress={handleAttach}
                  loading={isAttaching}
                  disabled={
                    isAttaching ||
                    selectedInventoryId === null ||
                    parseInt(qtyInput, 10) < 1
                  }
                  accessibilityRole="button"
                >
                  Add Link
                </Button>
              </View>
            </View>

            {/* Warning notice */}
            <View style={styles.warning}>
              <Text variant="bodySmall" style={styles.warningText}>
                ⚠ All menu items must have at least one stock item linked before
                they can be sold at checkout.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={onClose}
              accessibilityRole="button"
            >
              Close
            </Button>
          </View>
        </Surface>
      </Modal>

      <ConfirmDialog
        visible={removeTarget !== null}
        title="Remove Link"
        message={`Remove "${removeTarget?.name}" from linked stock?`}
        confirmLabel="Remove"
        loading={isDetaching}
        onConfirm={handleDetach}
        onDismiss={() => setRemoveTarget(null)}
      />
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { marginHorizontal: 16 },
  surface: { borderRadius: 16, overflow: "hidden", maxHeight: "85%" },
  heading: { padding: 20, fontWeight: "700", color: palette.zinc950 },
  scroll: { flexGrow: 0 },
  scrollContent: { padding: 16, gap: 8 },
  meta: { color: palette.zinc500 },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.zinc200,
  },
  headerText: { color: palette.zinc500, textTransform: "uppercase" },
  col1: { flex: 2, color: palette.zinc950 },
  col2: { flex: 1, color: palette.zinc950 },
  col3: { width: 70 },
  divider: { marginVertical: 12 },
  addTitle: { color: palette.zinc950, fontWeight: "700", marginBottom: 8 },
  addRow: { gap: 8 },
  selectorWrap: { gap: 4 },
  invOption: { alignSelf: "flex-start", marginBottom: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyInput: { width: 80, backgroundColor: palette.white },
  warning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
  },
  warningText: { color: "#92400E" },
  footer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.zinc200,
  },
});

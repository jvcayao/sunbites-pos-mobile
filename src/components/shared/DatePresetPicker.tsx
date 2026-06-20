import { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
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
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { palette } from "@/theme";

export type DateRange = { from: string; to: string };

type Preset = "today" | "this_week" | "this_month" | "last_month" | "custom";

interface DatePresetPickerProps {
  visible: boolean;
  value: DateRange;
  onConfirm: (range: DateRange) => void;
  onDismiss: () => void;
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "this_week", label: "This Week" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "custom", label: "Custom Range" },
];

function getPresetRange(preset: Preset): DateRange | null {
  const today = new Date();
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");
  switch (preset) {
    case "today":
      return { from: fmt(today), to: fmt(today) };
    case "this_week":
      return { from: fmt(startOfWeek(today)), to: fmt(endOfWeek(today)) };
    case "this_month":
      return { from: fmt(startOfMonth(today)), to: fmt(endOfMonth(today)) };
    case "last_month": {
      const last = subMonths(today, 1);
      return { from: fmt(startOfMonth(last)), to: fmt(endOfMonth(last)) };
    }
    default:
      return null;
  }
}

export function DatePresetPicker({
  visible,
  value,
  onConfirm,
  onDismiss,
}: DatePresetPickerProps) {
  const [selected, setSelected] = useState<Preset>("today");
  const [customFrom, setCustomFrom] = useState(value.from);
  const [customTo, setCustomTo] = useState(value.to);

  const handleConfirm = () => {
    if (selected === "custom") {
      onConfirm({ from: customFrom, to: customTo });
    } else {
      const range = getPresetRange(selected);
      if (range !== null) onConfirm(range);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Surface style={styles.surface} elevation={4}>
          <Text variant="titleMedium" style={styles.heading}>
            Select Date Range
          </Text>
          <Divider style={styles.divider} />
          {PRESETS.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => setSelected(p.key)}
              style={[styles.option, selected === p.key && styles.optionActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === p.key }}
              accessibilityLabel={p.label}
            >
              <Text
                variant="bodyLarge"
                style={
                  selected === p.key
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
          {selected === "custom" && (
            <View style={styles.customRange}>
              <TextInput
                label="From (YYYY-MM-DD)"
                value={customFrom}
                onChangeText={setCustomFrom}
                mode="outlined"
                style={styles.dateInput}
                keyboardType="numeric"
                maxLength={10}
                accessibilityLabel="Start date"
              />
              <TextInput
                label="To (YYYY-MM-DD)"
                value={customTo}
                onChangeText={setCustomTo}
                mode="outlined"
                style={styles.dateInput}
                keyboardType="numeric"
                maxLength={10}
                accessibilityLabel="End date"
              />
            </View>
          )}
          <View style={styles.actions}>
            <Button
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel="Apply date range"
            >
              Apply
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: 24,
  },
  surface: {
    borderRadius: 16,
    overflow: "hidden",
  },
  heading: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    color: palette.zinc950,
  },
  divider: {
    marginBottom: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: "center",
  },
  optionActive: {
    backgroundColor: palette.orange100,
  },
  optionText: {
    color: palette.zinc900,
  },
  optionTextActive: {
    color: palette.orange500,
    fontWeight: "600",
  },
  customRange: {
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 8,
  },
  dateInput: {
    backgroundColor: palette.white,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
});

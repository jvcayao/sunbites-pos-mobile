import { StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  Modal,
  Portal,
  Surface,
  Text,
} from "react-native-paper";
import { FilterChip, FilterChipRow } from "@/components/shared/FilterChip";
import { SCHOOL_MONTHS } from "@/lib/constants";
import { palette } from "@/theme";
import { useState } from "react";
import type { SchoolMonth, SubscriptionRangeDto } from "@/types/student";

const MONTHS = SCHOOL_MONTHS.map((m) => ({
  key: m as SchoolMonth,
  label: m.charAt(0).toUpperCase() + m.slice(1, 3),
}));
const YEARS = Array.from(
  { length: 8 },
  (_, i) => new Date().getFullYear() + i - 1,
);

interface AddSubscriptionPeriodSheetProps {
  visible: boolean;
  loading?: boolean;
  onConfirm: (data: SubscriptionRangeDto) => void;
  onDismiss: () => void;
}

export function AddSubscriptionPeriodSheet({
  visible,
  loading = false,
  onConfirm,
  onDismiss,
}: AddSubscriptionPeriodSheetProps) {
  const [startMonth, setStartMonth] = useState<SchoolMonth | "">("");
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endMonth, setEndMonth] = useState<SchoolMonth | "">("");
  const [endYear, setEndYear] = useState<number | null>(null);

  const canSubmit = startMonth && startYear && endMonth && endYear && !loading;

  const handleConfirm = (): void => {
    if (!startMonth || !startYear || !endMonth || !endYear) return;
    onConfirm({
      subscription_start_month: startMonth,
      subscription_start_year: startYear,
      subscription_end_month: endMonth,
      subscription_end_year: endYear,
    });
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
            Add Subscription Period
          </Text>
          <Divider />
          <View style={styles.body}>
            <Text variant="labelSmall" style={styles.sectionLabel}>
              START
            </Text>
            <FilterChipRow>
              {MONTHS.map((m) => (
                <FilterChip
                  key={m.key}
                  label={m.label}
                  active={startMonth === m.key}
                  onPress={() => setStartMonth(m.key)}
                />
              ))}
            </FilterChipRow>
            <FilterChipRow>
              {YEARS.map((y) => (
                <FilterChip
                  key={y}
                  label={String(y)}
                  active={startYear === y}
                  onPress={() => setStartYear(y)}
                />
              ))}
            </FilterChipRow>
            <Text variant="labelSmall" style={styles.sectionLabel}>
              END
            </Text>
            <FilterChipRow>
              {MONTHS.map((m) => (
                <FilterChip
                  key={m.key}
                  label={m.label}
                  active={endMonth === m.key}
                  onPress={() => setEndMonth(m.key)}
                />
              ))}
            </FilterChipRow>
            <FilterChipRow>
              {YEARS.map((y) => (
                <FilterChip
                  key={y}
                  label={String(y)}
                  active={endYear === y}
                  onPress={() => setEndYear(y)}
                />
              ))}
            </FilterChipRow>
          </View>
          <View style={styles.actions}>
            <Button onPress={onDismiss} disabled={loading}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={!canSubmit}
              accessibilityRole="button"
            >
              Add
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { marginHorizontal: 20 },
  surface: { borderRadius: 16, overflow: "hidden" },
  heading: { padding: 20, fontWeight: "700", color: palette.zinc950 },
  body: { padding: 20, gap: 8 },
  sectionLabel: {
    color: palette.zinc500,
    textTransform: "uppercase",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    gap: 8,
  },
});

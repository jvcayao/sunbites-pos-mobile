import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { palette } from "@/theme";

interface RecipientItem {
  id: number;
  full_name: string;
}

interface RecipientSelectorProps {
  recipients: RecipientItem[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  isLoading?: boolean;
}

export function RecipientSelector({
  recipients,
  selectedIds,
  onToggle,
  onSelectAll,
  isLoading = false,
}: RecipientSelectorProps): React.JSX.Element {
  const [query, setQuery] = useState("");

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          testID="recipients-loading"
          color={palette.orange500}
        />
      </View>
    );
  }

  const filtered =
    query.trim() === ""
      ? recipients
      : recipients.filter((r) =>
          r.full_name.toLowerCase().includes(query.toLowerCase()),
        );

  const allSelected =
    recipients.length > 0 &&
    recipients.every((r) => selectedIds.includes(r.id));

  return (
    <View style={styles.container}>
      <TextInput
        testID="recipient-search"
        placeholder="Search recipients..."
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        placeholderTextColor={palette.zinc500}
        accessibilityLabel="Search recipients"
      />

      <Pressable
        testID="select-all-row"
        onPress={onSelectAll}
        style={styles.row}
        accessibilityRole="checkbox"
        accessibilityLabel="Select all recipients"
      >
        <View style={[styles.checkbox, allSelected && styles.checkboxSelected]}>
          {allSelected && (
            <MaterialCommunityIcons
              name="check"
              size={14}
              color={palette.white}
            />
          )}
        </View>
        <Text variant="labelMedium" style={styles.rowLabel}>
          Select All
        </Text>
      </Pressable>

      <View style={styles.divider} />

      {filtered.length === 0 ? (
        <View style={styles.emptyRow}>
          <Text variant="bodySmall" style={styles.emptyText}>
            No recipients found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <Pressable
                testID={`recipient-row-${item.id}`}
                onPress={() => onToggle(item.id)}
                style={styles.row}
                accessibilityRole="checkbox"
                accessibilityLabel={item.full_name}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <MaterialCommunityIcons
                      testID={`check-icon-${item.id}`}
                      name="check"
                      size={14}
                      color={palette.white}
                    />
                  )}
                </View>
                <Text variant="bodyMedium" style={styles.rowLabel}>
                  {item.full_name}
                </Text>
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: palette.zinc200,
    borderRadius: 8,
    overflow: "hidden",
  },
  search: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.zinc200,
    color: palette.zinc900,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  rowLabel: { flex: 1, color: palette.zinc900 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: palette.zinc200,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: palette.orange500,
    borderColor: palette.orange500,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.zinc200,
  },
  centered: { paddingVertical: 24, alignItems: "center" },
  emptyRow: { paddingVertical: 16, alignItems: "center" },
  emptyText: { color: palette.zinc500 },
});

import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, TextInput } from "react-native-paper";
import { FilterChip, FilterChipRow } from "@/components/shared/FilterChip";
import { EmptyState } from "@/components/shared/EmptyState";
import { MenuItemCard } from "./MenuItemCard";
import { usePosMenuItems } from "@/hooks/usePos";
import { useCartStore } from "@/store/cart";
import { useLayout } from "@/hooks/useLayout";
import { palette } from "@/theme";
import type { PosMenuItem, MenuCategory } from "@/types/menu";

const CATEGORIES: { key: MenuCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "meal", label: "Meal" },
  { key: "snack", label: "Snack" },
  { key: "drink", label: "Drink" },
  { key: "extra", label: "Extra" },
];

interface MenuGridProps {
  onItemPress: (item: PosMenuItem) => void;
}

export function MenuGrid({ onItemPress }: MenuGridProps) {
  const { data: items = [], isLoading } = usePosMenuItems();
  const [category, setCategory] = useState<MenuCategory | "all">("all");
  const [search, setSearch] = useState("");
  const cartItems = useCartStore((s) => s.items);
  const { isTablet } = useLayout();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat = category === "all" || item.category === category;
      const matchSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchCat && matchSearch && item.is_available;
    });
  }, [items, category, search]);

  const getCartQty = useCallback(
    (id: number) => cartItems.find((i) => i.menuItem.id === id)?.quantity ?? 0,
    [cartItems],
  );

  const renderItem = useCallback(
    ({ item }: { item: PosMenuItem }) => (
      <View style={styles.cardWrapper}>
        <MenuItemCard
          item={item}
          cartQuantity={getCartQty(item.id)}
          onPress={onItemPress}
        />
      </View>
    ),
    [getCartQty, onItemPress],
  );

  const keyExtractor = useCallback((item: PosMenuItem) => String(item.id), []);

  const numCols = isTablet ? 3 : 2;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.orange500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        placeholder="Search menu…"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        left={<TextInput.Icon icon="magnify" />}
        accessibilityLabel="Search menu items"
      />
      <FilterChipRow>
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.key}
            label={c.label}
            active={category === c.key}
            onPress={() => setCategory(c.key)}
          />
        ))}
      </FilterChipRow>
      {filtered.length === 0 ? (
        <EmptyState icon="food-off" title="No items found" />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={numCols}
          key={String(numCols)}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={12}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  search: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: palette.white,
  },
  grid: { padding: 12 },
  // alignItems: 'stretch' forces all cards in a row to be the same height
  row: { gap: 8, marginBottom: 8, alignItems: "stretch" },
  cardWrapper: { flex: 1 },
});

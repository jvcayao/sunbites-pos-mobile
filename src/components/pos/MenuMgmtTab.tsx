import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import {
  Button,
  Divider,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  usePosMenuItems,
  useCreateMenuItem,
  useToggleMenuItem,
  useDeleteMenuItem,
} from '@/hooks/usePos'
import { useToast } from '@/components/shared/ErrorToast'
import { getApiError } from '@/lib/errors'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { FilterChip, FilterChipRow } from '@/components/shared/FilterChip'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { LinkedStockSheet } from '@/components/pos/LinkedStockSheet'
import { formatCurrency } from '@/lib/formatters'
import { listCardStyle } from '@/lib/constants'
import { palette } from '@/theme'
import type { PosMenuItem } from '@/types/menu'
import type { MenuCategory } from '@/types/menu'

const CATEGORIES: MenuCategory[] = ['meal', 'snack', 'drink', 'extra']

const SUBSCRIPTION_OPTS = [
  { label: 'Not configured', value: 'null'  },
  { label: 'Yes',            value: 'true'  },
  { label: 'No',             value: 'false' },
] as const
type SubscriptionChoice = 'null' | 'true' | 'false'

const menuItemSchema = z.object({
  name:                 z.string().min(1, 'Name is required'),
  price:                z.string().refine((v) => parseFloat(v) > 0, 'Enter a valid price'),
  category:             z.enum(['meal', 'snack', 'drink', 'extra']),
  is_subscription_item: z.enum(['null', 'true', 'false']),
  sort_order:           z.string().optional(),
})
type MenuItemForm = z.infer<typeof menuItemSchema>

const SUBSCRIPTION_MAP: Record<SubscriptionChoice, boolean | null> = {
  null: null, true: true, false: false,
}

const CATEGORY_COLOR: Record<MenuCategory, { bg: string; text: string }> = {
  meal:  { bg: palette.orange100, text: palette.orange500 },
  snack: { bg: '#FEF9C3',         text: '#854D0E' },
  drink: { bg: palette.blue100,   text: palette.blue500 },
  extra: { bg: palette.zinc100,   text: palette.zinc500 },
}

interface AddMenuItemFormProps {
  onCreate: (payload: ReturnType<typeof buildPayload>) => void
  isCreating: boolean
}

function buildPayload(data: MenuItemForm) {
  return {
    name:                 data.name,
    price:                parseFloat(data.price),
    category:             data.category,
    is_subscription_item: SUBSCRIPTION_MAP[data.is_subscription_item],
    sort_order:           data.sort_order ? parseInt(data.sort_order, 10) : undefined,
  }
}

function AddMenuItemForm({ onCreate, isCreating }: AddMenuItemFormProps): React.JSX.Element {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { name: '', price: '', category: 'meal', is_subscription_item: 'null', sort_order: '' },
  })
  const onSubmit = (data: MenuItemForm): void => {
    onCreate(buildPayload(data))
    reset()
  }
  return (
    <View style={formStyles.container}>
      <Text variant="labelMedium" style={formStyles.heading}>+ Add New Item</Text>
      <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Item Name *" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur}
          error={!!errors.name} style={formStyles.input} accessibilityLabel="Menu item name" />
      )} />
      <Controller control={control} name="price" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Price (₱) *" mode="outlined" value={value} onChangeText={onChange} onBlur={onBlur}
          keyboardType="decimal-pad" error={!!errors.price} style={formStyles.input} accessibilityLabel="Item price" />
      )} />
      <Controller control={control} name="category" render={({ field: { value, onChange } }) => (
        <View>
          <Text variant="labelSmall" style={formStyles.fieldLabel}>Category *</Text>
          <FilterChipRow>
            {CATEGORIES.map((c) => <FilterChip key={c} label={c} active={value === c} onPress={() => onChange(c)} />)}
          </FilterChipRow>
        </View>
      )} />
      <Controller control={control} name="is_subscription_item" render={({ field: { value, onChange } }) => (
        <View>
          <Text variant="labelSmall" style={formStyles.fieldLabel}>Subscription Eligible</Text>
          <FilterChipRow>
            {SUBSCRIPTION_OPTS.map((o) => (
              <FilterChip key={o.value} label={o.label} active={value === o.value} onPress={() => onChange(o.value)} />
            ))}
          </FilterChipRow>
        </View>
      )} />
      <Controller control={control} name="sort_order" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Sort Order (optional)" mode="outlined" value={value ?? ''} onChangeText={onChange}
          onBlur={onBlur} keyboardType="number-pad" style={formStyles.input} accessibilityLabel="Sort order" />
      )} />
      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isCreating}
        disabled={isCreating} style={formStyles.btn} accessibilityRole="button">
        Add Item
      </Button>
    </View>
  )
}

export function MenuMgmtTab(): React.JSX.Element {
  const toast = useToast()
  const { data: items = [], isLoading, refetch, isRefetching } = usePosMenuItems()
  const { mutate: createItem, isPending: isCreating } = useCreateMenuItem()
  const { mutate: toggleItem }                        = useToggleMenuItem()
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteMenuItem()

  const [deleteTarget, setDeleteTarget]   = useState<PosMenuItem | null>(null)
  const [linkStockTarget, setLinkTarget]  = useState<PosMenuItem | null>(null)

  const handleCreate = (payload: ReturnType<typeof buildPayload>): void => {
    createItem(payload, {
      onSuccess: () => toast.success('Menu item created'),
      onError:   (err: unknown) => toast.error(getApiError(err)),
    })
  }

  const handleToggle = (item: PosMenuItem): void => {
    toggleItem(item.id, {
      onSuccess: () => toast.success(`Item ${item.is_available ? 'hidden' : 'shown'}`),
      onError:   (err: unknown) => toast.error(getApiError(err)),
    })
  }

  const handleDelete = (): void => {
    if (deleteTarget === null) return
    deleteItem(deleteTarget.id, {
      onSuccess: () => { toast.success('Item deleted'); setDeleteTarget(null) },
      onError:   (err: unknown) => toast.error(getApiError(err)),
    })
  }

  const renderItem = useCallback(({ item }: { item: PosMenuItem }) => {
    const cat = CATEGORY_COLOR[item.category]
    return (
      <View style={[listCardStyle, styles.row]}>
        <View style={[styles.catDot, { backgroundColor: cat.bg }]}>
          <Text variant="labelSmall" numberOfLines={1} style={{ color: cat.text }}>{item.category}</Text>
        </View>
        <View style={styles.info}>
          <Text variant="bodyMedium" style={[styles.name, !item.is_available && styles.unavailableName]}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            <Text variant="titleSmall" style={styles.price}>{formatCurrency(item.price)}</Text>
            {item.inventory_status !== null && <StatusBadge variant={item.inventory_status.toLowerCase()} />}
            {!item.has_inventory_mapping && (
              <View style={styles.notLinkedBadge}>
                <Text variant="labelSmall" style={styles.notLinkedText}>Not linked</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.actions}>
          <Switch value={item.is_available} onValueChange={() => handleToggle(item)}
            color={palette.orange500} accessibilityLabel={`Toggle ${item.name} availability`} />
          <Button compact mode="outlined" onPress={() => setLinkTarget(item)}
            accessibilityRole="button" accessibilityLabel={`Link stock for ${item.name}`}>
            Link Stock
          </Button>
          <Button compact mode="text" textColor={palette.red500} onPress={() => setDeleteTarget(item)}
            accessibilityRole="button" accessibilityLabel={`Delete ${item.name}`}>
            Del
          </Button>
        </View>
      </View>
    )
  }, [])

  const keyExtractor = useCallback((item: PosMenuItem) => String(item.id), [])

  if (isLoading) return <SkeletonCard count={5} />

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={<AddMenuItemForm onCreate={handleCreate} isCreating={isCreating} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.orange500} />
        }
        ListEmptyComponent={
          <EmptyState icon="food" title="No menu items" subtitle="Add the first item above" />
        }
        removeClippedSubviews
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Menu Item"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onDismiss={() => setDeleteTarget(null)}
      />

      {linkStockTarget !== null && (
        <LinkedStockSheet
          menuItemId={linkStockTarget.id}
          menuItemName={linkStockTarget.name}
          visible={linkStockTarget !== null}
          onClose={() => setLinkTarget(null)}
        />
      )}
    </View>
  )
}

const formStyles = StyleSheet.create({
  container:  { margin: 12, padding: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: palette.zinc200, borderRadius: 12, gap: 10 },
  heading:    { color: palette.zinc950, fontWeight: '700' },
  input:      { backgroundColor: palette.white },
  fieldLabel: { color: palette.zinc500, textTransform: 'uppercase', marginBottom: 4 },
  btn:        { alignSelf: 'flex-end', marginTop: 4 },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 56,
    gap: 10,
  },
  catDot:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, minWidth: 48, alignItems: 'center' },
  info:            { flex: 1 },
  metaRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  name:            { color: palette.zinc950 },
  unavailableName: { color: palette.zinc500, textDecorationLine: 'line-through' },
  price:           { color: palette.orange500, fontWeight: '700' },
  notLinkedBadge:  { backgroundColor: palette.orange100, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  notLinkedText:   { color: palette.orange500 },
  actions:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
})

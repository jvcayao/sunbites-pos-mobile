import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import {
  Button,
  Divider,
  FAB,
  Modal,
  Portal,
  Surface,
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
  useUpdateMenuItem,
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
import { formatCurrency } from '@/lib/formatters'
import { palette } from '@/theme'
import type { PosMenuItem } from '@/types/menu'
import type { MenuCategory } from '@/types/menu'

const CATEGORIES: MenuCategory[] = ['meal', 'snack', 'drink', 'extra']

const menuItemSchema = z.object({
  name:       z.string().min(1, 'Name is required'),
  price:      z.string().refine((v) => parseFloat(v) > 0, 'Enter a valid price'),
  category:   z.enum(['meal', 'snack', 'drink', 'extra']),
  sort_order: z.string().optional(),
})
type MenuItemForm = z.infer<typeof menuItemSchema>

const CATEGORY_COLOR: Record<MenuCategory, { bg: string; text: string }> = {
  meal:  { bg: palette.orange100, text: palette.orange500 },
  snack: { bg: '#FEF9C3',         text: '#854D0E' },
  drink: { bg: palette.blue100,   text: palette.blue500 },
  extra: { bg: palette.zinc100,   text: palette.zinc500 },
}

export function MenuMgmtTab() {
  const toast = useToast()
  const { data: items = [], isLoading, refetch, isRefetching } = usePosMenuItems()
  const { mutate: createItem, isPending: isCreating } = useCreateMenuItem()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateMenuItem()
  const { mutate: toggleItem }                        = useToggleMenuItem()
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteMenuItem()

  const [editTarget, setEditTarget] = useState<PosMenuItem | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PosMenuItem | null>(null)

  const { control, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<MenuItemForm>({
      resolver: zodResolver(menuItemSchema),
      defaultValues: { name: '', price: '', category: 'meal', sort_order: '' },
    })

  const openCreate = (): void => {
    setEditTarget(null)
    reset({ name: '', price: '', category: 'meal', sort_order: '' })
    setShowForm(true)
  }

  const openEdit = (item: PosMenuItem): void => {
    setEditTarget(item)
    reset({
      name:       item.name,
      price:      String(item.price),
      category:   item.category,
      sort_order: item.sort_order !== undefined ? String(item.sort_order) : '',
    })
    setShowForm(true)
  }

  const onSubmit = (data: MenuItemForm): void => {
    const payload = {
      name:       data.name,
      price:      parseFloat(data.price),
      category:   data.category,
      sort_order: data.sort_order ? parseInt(data.sort_order, 10) : undefined,
    }
    if (editTarget !== null) {
      updateItem(
        { id: editTarget.id, data: payload },
        {
          onSuccess: () => { toast.success('Menu item updated'); setShowForm(false) },
          onError:   (err) => toast.error(getApiError(err)),
        },
      )
    } else {
      createItem(payload, {
        onSuccess: () => { toast.success('Menu item created'); setShowForm(false) },
        onError:   (err) => toast.error(getApiError(err)),
      })
    }
  }

  const handleToggle = (item: PosMenuItem): void => {
    toggleItem(item.id, {
      onSuccess: () => toast.success(`Item ${item.is_available ? 'hidden' : 'shown'}`),
      onError:   (err) => toast.error(getApiError(err)),
    })
  }

  const handleDelete = (): void => {
    if (deleteTarget === null) return
    deleteItem(deleteTarget.id, {
      onSuccess: () => { toast.success('Item deleted'); setDeleteTarget(null) },
      onError:   (err) => toast.error(getApiError(err)),
    })
  }

  const renderItem = useCallback(({ item }: { item: PosMenuItem }) => {
    const cat = CATEGORY_COLOR[item.category]
    return (
      <View style={styles.row}>
        <View style={[styles.catDot, { backgroundColor: cat.bg }]}>
          <Text variant="labelSmall" numberOfLines={1} style={{ color: cat.text }}>{item.category}</Text>
        </View>
        <View style={styles.info}>
          <Text
            variant="bodyMedium"
            style={[styles.name, !item.is_available && styles.unavailableName]}
          >
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            <Text variant="titleSmall" style={styles.price}>{formatCurrency(item.price)}</Text>
            {item.inventory_status !== null && (
              <StatusBadge variant={item.inventory_status.toLowerCase()} />
            )}
          </View>
        </View>
        <View style={styles.actions}>
          <Switch
            value={item.is_available}
            onValueChange={() => handleToggle(item)}
            color={palette.orange500}
            accessibilityLabel={`Toggle ${item.name} availability`}
          />
          <Button
            compact
            mode="text"
            onPress={() => openEdit(item)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.name}`}
          >
            Edit
          </Button>
          <Button
            compact
            mode="text"
            textColor={palette.red500}
            onPress={() => setDeleteTarget(item)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${item.name}`}
          >
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.orange500}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="food"
            title="No menu items"
            subtitle="Tap + to add the first item"
          />
        }
        removeClippedSubviews
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreate}
        accessibilityLabel="Add menu item"
        accessibilityRole="button"
      />

      {/* Create / Edit Form */}
      <Portal>
        <Modal
          visible={showForm}
          onDismiss={() => setShowForm(false)}
          contentContainerStyle={styles.modal}
        >
          <Surface style={styles.modalSurface} elevation={4}>
            <Text variant="titleMedium" style={styles.modalTitle}>
              {editTarget !== null ? 'Edit Item' : 'Add Menu Item'}
            </Text>
            <Divider />
            <View style={styles.formBody}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Item Name *"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.name}
                    style={styles.input}
                    accessibilityLabel="Menu item name"
                  />
                )}
              />
              <Controller
                control={control}
                name="price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Price (₱) *"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                    error={!!errors.price}
                    style={styles.input}
                    accessibilityLabel="Item price"
                  />
                )}
              />
              <Controller
                control={control}
                name="category"
                render={({ field: { value, onChange } }) => (
                  <View>
                    <Text variant="labelSmall" style={styles.fieldLabel}>Category *</Text>
                    <FilterChipRow>
                      {CATEGORIES.map((c) => (
                        <FilterChip
                          key={c}
                          label={c}
                          active={value === c}
                          onPress={() => onChange(c)}
                        />
                      ))}
                    </FilterChipRow>
                  </View>
                )}
              />
              <Controller
                control={control}
                name="sort_order"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Sort Order (optional)"
                    mode="outlined"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                    style={styles.input}
                    accessibilityLabel="Sort order"
                  />
                )}
              />
            </View>
            <View style={styles.modalActions}>
              <Button onPress={() => setShowForm(false)} disabled={isCreating || isUpdating}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isCreating || isUpdating}
                disabled={isCreating || isUpdating}
                accessibilityRole="button"
              >
                {editTarget !== null ? 'Save' : 'Create'}
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Menu Item"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onDismiss={() => setDeleteTarget(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: palette.white,
    minHeight: 56,
    gap: 10,
  },
  catDot: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  info: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  name: { color: palette.zinc950 },
  unavailableName: { color: palette.zinc500, textDecorationLine: 'line-through' },
  price: { color: palette.orange500, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: palette.orange500,
  },
  modal: { marginHorizontal: 24 },
  modalSurface: { borderRadius: 16, overflow: 'hidden' },
  modalTitle: { padding: 20, fontWeight: '700', color: palette.zinc950 },
  formBody: { padding: 20, gap: 12 },
  fieldLabel: { color: palette.zinc500, textTransform: 'uppercase', marginBottom: 4 },
  input: { backgroundColor: palette.white },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, gap: 8 },
})

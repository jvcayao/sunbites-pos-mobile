import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Divider, IconButton, Surface, Text, TextInput } from 'react-native-paper'
import type { TextInput as RNTextInput } from 'react-native'
import { formatCurrency } from '@/lib/formatters'
import { useLookupStudent } from '@/hooks/usePos'
import { ChangeStudentDialog } from './ChangeStudentDialog'
import { StudentNotFoundDialog } from './StudentNotFoundDialog'
import { palette } from '@/theme'
import type { PosStudent } from '@/types/student'

// USB QR scanners emit the barcode as fast keystrokes (< 50ms apart)
// followed optionally by a carriage return. This pattern validates Sunbites IDs.
const QR_PATTERN = /^SB-[A-Za-z0-9]{12}$/

// Strip trailing whitespace / CR / LF that some scanners append after the code
function sanitizeScan(raw: string): string {
  return raw.replace(/[\r\n\s]+$/, '').trim()
}

interface StudentSearchInputProps {
  selectedStudent: PosStudent | null
  isWalkIn: boolean
  onSelectStudent: (student: PosStudent) => void
  onSetWalkIn: () => void
  onClearStudent: () => void
}

export function StudentSearchInput({
  selectedStudent,
  isWalkIn,
  onSelectStudent,
  onSetWalkIn,
  onClearStudent,
}: StudentSearchInputProps) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<PosStudent[]>([])
  const [showResults, setShowResults] = useState(false)
  const [notFound, setNotFound]       = useState(false)
  const [pendingStudent, setPendingStudent] = useState<PosStudent | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Ref to the TextInput so we can re-focus it after a student is selected/cleared
  const inputRef = useRef<RNTextInput>(null)
  // Skip the first render so mount-time auto-focus doesn't open the soft keyboard
  const didMountRef = useRef(false)

  const { mutate: lookup, isPending } = useLookupStudent()

  // Re-focus the search field whenever the selection is cleared —
  // so the USB scanner is always ready for the next swipe without a tap.
  // Skips the initial mount to avoid popping up the soft keyboard on open.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (selectedStudent === null && !isWalkIn) {
      // Small delay lets the UI settle before refocusing
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [selectedStudent, isWalkIn])

  const handleQrValue = useCallback(
    (value: string) => {
      const clean = sanitizeScan(value)
      setQuery('')
      setShowResults(false)
      lookup(
        { type: 'qr', value: clean },
        {
          onSuccess: (res) => {
            const student = res.data as PosStudent
            if (selectedStudent !== null && selectedStudent.id !== student.id) {
              setPendingStudent(student)
            } else {
              onSelectStudent(student)
            }
          },
          onError: () => setNotFound(true),
        },
      )
    },
    [lookup, selectedStudent, onSelectStudent],
  )

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text)
      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (text.length < 2) {
        setResults([])
        setShowResults(false)
        return
      }

      // Check if the full value (possibly from USB scanner burst) matches the QR pattern
      const clean = sanitizeScan(text)
      if (QR_PATTERN.test(clean)) {
        handleQrValue(clean)
        return
      }

      // Human typing — debounced name/number search
      // Sanitize: cap at 64 chars and strip non-printable characters
      const safeSearch = sanitizeScan(text).slice(0, 64)
      debounceRef.current = setTimeout(() => {
        lookup(
          { type: 'search', value: safeSearch },
          {
            onSuccess: (data) => {
              const list = Array.isArray(data.data) ? data.data : [data.data]
              setResults(list as PosStudent[])
              setShowResults(true)
            },
          },
        )
      }, 300)
    },
    [lookup, handleQrValue],
  )

  // ── Selected student card ────────────────────────────────────────────────────

  if (selectedStudent !== null) {
    return (
      <View style={styles.selectedCard}>
        <View style={styles.selectedInfo}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{selectedStudent.full_name[0]}</Text>
          </View>
          <View style={styles.selectedText}>
            <Text variant="titleSmall">{selectedStudent.full_name}</Text>
            <Text variant="bodySmall" style={styles.meta}>{selectedStudent.grade_level}</Text>
            <View style={styles.balanceRow}>
              <Text variant="labelSmall" style={styles.balance}>
                ₱{selectedStudent.wallet_balance.toFixed(2)} wallet
              </Text>
              {selectedStudent.credit_balance > 0 && (
                <Text variant="labelSmall" style={styles.credit}>
                  {formatCurrency(selectedStudent.credit_balance)} credit
                </Text>
              )}
            </View>
          </View>
        </View>
        <IconButton
          icon="close"
          size={20}
          onPress={onClearStudent}
          accessibilityLabel="Remove student"
          accessibilityRole="button"
        />
      </View>
    )
  }

  // ── Walk-in banner ───────────────────────────────────────────────────────────

  if (isWalkIn) {
    return (
      <View style={styles.walkInBanner}>
        <Text variant="bodyMedium" style={styles.walkInText}>Walk-in Customer</Text>
        <Pressable
          onPress={onClearStudent}
          style={styles.walkInChange}
          accessibilityRole="button"
          accessibilityLabel="Switch to student"
        >
          <Text variant="labelSmall" style={styles.walkInChangeText}>Change</Text>
        </Pressable>
      </View>
    )
  }

  // ── Search / scan input ──────────────────────────────────────────────────────

  return (
    <View>
      <TextInput
        ref={inputRef}
        mode="outlined"
        // autoFocus ensures the USB scanner can type directly without tapping the field
        autoFocus
        placeholder="Scan QR code or type student name / number…"
        value={query}
        onChangeText={handleSearch}
        style={styles.searchInput}
        autoComplete="off"
        autoCorrect={false}
        // Prevent keyboard suggestions that could interfere with fast scanner input
        autoCapitalize="none"
        right={
          isPending ? (
            <TextInput.Icon icon={() => <ActivityIndicator size={16} color={palette.orange500} />} />
          ) : (
            // Scanner indicator — not a button, just a visual hint
            <TextInput.Icon icon="barcode-scan" color={palette.zinc500} />
          )
        }
        accessibilityLabel="Search student or scan QR code"
      />

      <Pressable
        onPress={onSetWalkIn}
        accessibilityRole="button"
        accessibilityLabel="Set as walk-in customer"
      >
        <Text variant="labelMedium" style={styles.walkInLink}>
          Walk-in customer (no student)
        </Text>
      </Pressable>

      {showResults && results.length > 0 && (
        <Surface style={styles.dropdown} elevation={4}>
          {results.map((student) => {
            const isEnrolled = student.enrollment_status === 'enrolled'
            return (
              <View key={student.id}>
                <Pressable
                  onPress={() => {
                    if (!isEnrolled) return
                    if (selectedStudent !== null) {
                      setPendingStudent(student)
                    } else {
                      onSelectStudent(student)
                      setQuery('')
                      setShowResults(false)
                    }
                  }}
                  disabled={!isEnrolled}
                  style={[styles.result, !isEnrolled && styles.resultDisabled]}
                  accessibilityRole="button"
                  accessibilityLabel={`${student.full_name}${!isEnrolled ? ', not enrolled' : ''}`}
                  accessibilityState={{ disabled: !isEnrolled }}
                >
                  <Text variant="bodyMedium" style={!isEnrolled ? styles.disabledText : undefined}>
                    {!isEnrolled && '⛔ '}{student.full_name}
                  </Text>
                  <Text variant="bodySmall" style={styles.meta}>{student.grade_level}</Text>
                </Pressable>
                <Divider />
              </View>
            )
          })}
        </Surface>
      )}

      {pendingStudent !== null && selectedStudent !== null && (
        <ChangeStudentDialog
          visible
          current={selectedStudent}
          incoming={pendingStudent}
          onConfirm={() => {
            onSelectStudent(pendingStudent)
            setPendingStudent(null)
            setQuery('')
          }}
          onDismiss={() => setPendingStudent(null)}
        />
      )}

      <StudentNotFoundDialog
        visible={notFound}
        onDismiss={() => setNotFound(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: palette.white,
  },
  walkInLink: {
    color: palette.orange500,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
  dropdown: {
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: palette.white,
  },
  result: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  resultDisabled: { opacity: 0.5 },
  disabledText: { color: palette.zinc500 },
  meta: { color: palette.zinc500, marginTop: 2 },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.orange500,
  },
  selectedInfo: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.orange100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: palette.orange500, fontWeight: '700', fontSize: 16 },
  selectedText: { flex: 1 },
  balanceRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  balance: { color: palette.green500 },
  credit: { color: palette.red500 },
  walkInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.zinc100,
    borderRadius: 12,
    padding: 16,
    minHeight: 52,
  },
  walkInText: { color: palette.zinc950 },
  walkInChange: { padding: 4, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  walkInChangeText: { color: palette.orange500, textDecorationLine: 'underline' },
})

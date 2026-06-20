import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Appbar, Text } from "react-native-paper";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useCreateAnnouncement } from "@/hooks/useAnnouncements";
import { RecipientTypePill } from "@/components/announcements/RecipientTypePill";
import { RecipientSelector } from "@/components/announcements/RecipientSelector";
import { useToast } from "@/components/shared/ErrorToast";
import { referencesApi } from "@/api/references";
import { palette } from "@/theme";
import type { RecipientType } from "@/types/announcement";

interface RecipientOption {
  id: number;
  full_name: string;
}

export default function CreateAnnouncementScreen(): React.JSX.Element {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("parents");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const { mutate: createAnnouncement, isPending } = useCreateAnnouncement();
  const toast = useToast();

  const { data: parentsData, isLoading: isLoadingParents } = useQuery<
    RecipientOption[]
  >({
    queryKey: ["announcement-recipients", "parents"],
    queryFn: async () => {
      const r = await referencesApi.parents.list({ per_page: 500 });
      const body = r.data as { data: RecipientOption[] };
      return body.data ?? [];
    },
    enabled: recipientType === "parents",
  });

  const { data: staffData, isLoading: isLoadingStaff } = useQuery<
    RecipientOption[]
  >({
    queryKey: ["announcement-recipients", "staff"],
    queryFn: async () => {
      const r = await referencesApi.users.list({ per_page: 500 });
      const body = r.data as { data: RecipientOption[] };
      return body.data ?? [];
    },
    enabled: recipientType === "staff",
  });

  const recipients: RecipientOption[] =
    (recipientType === "parents" ? parentsData : staffData) ?? [];
  const isLoadingRecipients =
    recipientType === "parents" ? isLoadingParents : isLoadingStaff;

  const handleTypeChange = (type: RecipientType): void => {
    setRecipientType(type);
    setSelectedIds([]);
    setRecipientError(null);
  };

  const handleToggle = (id: number): void => {
    setRecipientError(null);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (): void => {
    setRecipientError(null);
    const allIds = recipients.map((r) => r.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const handleSend = (): void => {
    if (selectedIds.length === 0) {
      setRecipientError("Please select at least one recipient");
      return;
    }
    createAnnouncement(
      {
        title: title.trim() || undefined,
        message: message.trim(),
        recipient_type: recipientType,
        recipient_ids: selectedIds,
      },
      {
        onSuccess: () => {
          toast.success("Announcement sent");
          router.back();
        },
      },
    );
  };

  const canSend = message.trim().length > 0;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => router.back()}
          accessibilityLabel="Back"
        />
        <Appbar.Content title="New Announcement" />
        <Appbar.Action
          testID="send-button"
          icon={isPending ? "loading" : "send"}
          onPress={handleSend}
          disabled={!canSend || isPending}
          accessibilityLabel="Send announcement"
        />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text variant="labelMedium" style={styles.label}>
            Title (optional)
          </Text>
          <TextInput
            testID="title-input"
            value={title}
            onChangeText={setTitle}
            maxLength={255}
            placeholder="Enter a title..."
            placeholderTextColor={palette.zinc500}
            style={styles.input}
            accessibilityLabel="Announcement title"
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text variant="labelMedium" style={styles.label}>
              Message *
            </Text>
            <Text variant="bodySmall" style={styles.charCount}>
              {message.length}/1000
            </Text>
          </View>
          <TextInput
            testID="message-input"
            value={message}
            onChangeText={setMessage}
            maxLength={1000}
            multiline
            numberOfLines={4}
            placeholder="Enter your message..."
            placeholderTextColor={palette.zinc500}
            style={[styles.input, styles.textarea]}
            accessibilityLabel="Announcement message"
          />
        </View>

        <View style={styles.field}>
          <Text variant="labelMedium" style={styles.label}>
            Send to
          </Text>
          <RecipientTypePill
            value={recipientType}
            onChange={handleTypeChange}
          />
        </View>

        <View style={styles.field}>
          <Text variant="labelMedium" style={styles.label}>
            Recipients
          </Text>
          {recipientError !== null && (
            <Text variant="bodySmall" style={styles.errorText}>
              {recipientError}
            </Text>
          )}
          <RecipientSelector
            recipients={recipients}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            isLoading={isLoadingRecipients}
          />
        </View>
      </ScrollView>

      {isPending && (
        <View style={styles.overlay}>
          <ActivityIndicator color={palette.orange500} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  appbar: { backgroundColor: palette.white },
  form: { padding: 16, gap: 20 },
  field: { gap: 6 },
  label: { color: palette.zinc900, fontWeight: "600" },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: { color: palette.zinc500 },
  input: {
    borderWidth: 1,
    borderColor: palette.zinc200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: palette.zinc900,
    fontSize: 14,
    backgroundColor: palette.white,
  },
  textarea: { minHeight: 96, textAlignVertical: "top" },
  errorText: { color: palette.red500 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
});

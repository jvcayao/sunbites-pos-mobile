import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { router } from "expo-router";
import { useCreateUser, useBranchList } from "@/hooks/useReferences";
import { useToast } from "@/components/shared/ErrorToast";
import { getApiError } from "@/lib/errors";
import { SectionCard } from "@/components/shared/SectionCard";
import { FilterChip, FilterChipRow } from "@/components/shared/FilterChip";
import { AppHeader } from "@/components/shared/AppHeader";
import { palette } from "@/theme";
import type { UserRole } from "@/types/auth";

const ROLES: UserRole[] = ["admin", "manager", "supervisor", "cashier"];

export default function CreateUserScreen() {
  const toast = useToast();
  const { data: branchesData } = useBranchList();
  const { mutate: createUser, isPending } = useCreateUser();
  const branches = Array.isArray(branchesData)
    ? branchesData
    : ((branchesData as any)?.data ?? []);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    position: "",
    employment_type: "",
    date_hired: "",
    roles: [] as UserRole[],
    branch_ids: [] as number[],
  });

  const set = (key: string) => (v: string) =>
    setForm((p) => ({ ...p, [key]: v }));

  const toggleRole = (r: UserRole) =>
    setForm((p) => ({
      ...p,
      roles: p.roles.includes(r)
        ? p.roles.filter((x) => x !== r)
        : [...p.roles, r],
    }));

  const toggleBranch = (id: number) =>
    setForm((p) => ({
      ...p,
      branch_ids: p.branch_ids.includes(id)
        ? p.branch_ids.filter((x) => x !== id)
        : [...p.branch_ids, id],
    }));

  const handleSubmit = (): void => {
    createUser(form, {
      onSuccess: () => {
        toast.success("User created");
        router.back();
      },
      onError: (err) => toast.error(getApiError(err)),
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Create Staff Account" showBack />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <SectionCard>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Personal
            </Text>
            <TextInput
              label="First Name *"
              mode="outlined"
              value={form.first_name}
              onChangeText={set("first_name")}
              style={styles.input}
            />
            <TextInput
              label="Last Name *"
              mode="outlined"
              value={form.last_name}
              onChangeText={set("last_name")}
              style={styles.input}
            />
            <TextInput
              label="Phone"
              mode="outlined"
              value={form.phone}
              onChangeText={set("phone")}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </SectionCard>
          <SectionCard>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Employment
            </Text>
            <TextInput
              label="Position"
              mode="outlined"
              value={form.position}
              onChangeText={set("position")}
              style={styles.input}
            />
            <TextInput
              label="Date Hired (YYYY-MM-DD)"
              mode="outlined"
              value={form.date_hired}
              onChangeText={set("date_hired")}
              style={styles.input}
            />
          </SectionCard>
          <SectionCard>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Account
            </Text>
            <TextInput
              label="Email *"
              mode="outlined"
              value={form.email}
              onChangeText={set("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              label="Password *"
              mode="outlined"
              value={form.password}
              onChangeText={set("password")}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="Confirm Password *"
              mode="outlined"
              value={form.password_confirmation}
              onChangeText={set("password_confirmation")}
              secureTextEntry
              style={styles.input}
            />
            <Text variant="labelSmall" style={styles.fieldLabel}>
              Role *
            </Text>
            <FilterChipRow>
              {ROLES.map((r) => (
                <FilterChip
                  key={r}
                  label={r}
                  active={form.roles.includes(r)}
                  onPress={() => toggleRole(r)}
                />
              ))}
            </FilterChipRow>
          </SectionCard>
          <SectionCard>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Branch Assignment
            </Text>
            <FilterChipRow>
              {branches.map((b: any) => (
                <FilterChip
                  key={b.id}
                  label={b.name}
                  active={form.branch_ids.includes(b.id)}
                  onPress={() => toggleBranch(b.id)}
                />
              ))}
            </FilterChipRow>
          </SectionCard>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isPending}
            disabled={
              isPending ||
              !form.first_name ||
              !form.last_name ||
              !form.email ||
              !form.password
            }
            style={styles.submitBtn}
            accessibilityRole="button"
          >
            Create Staff Account
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.zinc100 },
  flex: { flex: 1 },
  scroll: { padding: 16, gap: 16 },
  sectionTitle: { fontWeight: "700", color: palette.zinc950, marginBottom: 12 },
  fieldLabel: {
    color: palette.zinc500,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 8,
  },
  input: { backgroundColor: palette.white, marginBottom: 8 },
  submitBtn: { marginBottom: 32 },
});

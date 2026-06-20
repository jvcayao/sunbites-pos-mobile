import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { palette } from "@/theme";
import type { UserRole } from "@/types/auth";

const ROLE_COLOR: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: "#EDE9FE", text: "#7C3AED" },
  manager: { bg: palette.blue100, text: palette.blue500 },
  supervisor: { bg: "#E0F2FE", text: "#0891B2" },
  cashier: { bg: palette.green100, text: palette.green500 },
};

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const style = ROLE_COLOR[role] ?? {
    bg: palette.zinc100,
    text: palette.zinc500,
  };
  return (
    <Text
      variant="labelSmall"
      style={[styles.badge, { backgroundColor: style.bg, color: style.text }]}
    >
      {role}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
    textTransform: "capitalize",
    alignSelf: "flex-start",
  },
});

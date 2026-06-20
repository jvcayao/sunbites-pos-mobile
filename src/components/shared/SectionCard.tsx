import { StyleSheet } from "react-native";
import { Surface } from "react-native-paper";

interface SectionCardProps {
  children: React.ReactNode;
  style?: object;
}

export function SectionCard({ children, style }: SectionCardProps) {
  return (
    <Surface style={[styles.card, style]} elevation={1}>
      {children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
});

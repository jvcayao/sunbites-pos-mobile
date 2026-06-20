import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { palette } from "@/theme";

type LogoVariant = "login" | "rail" | "receipt" | "compact";

interface AppLogoProps {
  variant?: LogoVariant;
}

const WIDTHS: Record<LogoVariant, number> = {
  login: 220,
  rail: 140,
  receipt: 120,
  compact: 100,
};

const HEIGHT_RATIO = 1 / 3.8;

const wordmarkSource = require("../../../assets/sunbites.png");

export function AppLogo({ variant = "rail" }: AppLogoProps): React.JSX.Element {
  const w = WIDTHS[variant];
  const h = Math.round(w * HEIGHT_RATIO);

  return (
    <Image
      source={wordmarkSource}
      style={{ width: w, height: h }}
      contentFit="contain"
      cachePolicy="memory-disk"
      accessibilityRole="image"
      accessibilityLabel="Sunbites"
    />
  );
}

export function AppLogoFallback({
  variant = "rail",
}: AppLogoProps): React.JSX.Element {
  const isSmall = variant === "compact" || variant === "receipt";
  return (
    <View style={styles.row}>
      <View style={[styles.circle, isSmall && styles.circleSmall]}>
        <Text style={[styles.letter, isSmall && styles.letterSmall]}>S</Text>
      </View>
      <Text style={[styles.name, isSmall && styles.nameSmall]}>Sunbites</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.orange500,
    alignItems: "center",
    justifyContent: "center",
  },
  circleSmall: { width: 28, height: 28, borderRadius: 14 },
  letter: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", lineHeight: 22 },
  letterSmall: { fontSize: 13, lineHeight: 16 },
  name: { color: palette.zinc950, fontSize: 17, fontWeight: "700" },
  nameSmall: { fontSize: 13 },
});

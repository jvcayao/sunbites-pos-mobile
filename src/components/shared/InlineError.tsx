import { StyleSheet } from "react-native";
import { HelperText } from "react-native-paper";

interface InlineErrorProps {
  message?: string;
}

export function InlineError({ message }: InlineErrorProps) {
  if (message === undefined || message === "") return null;
  return (
    <HelperText type="error" visible style={styles.text}>
      {message}
    </HelperText>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: -4,
  },
});

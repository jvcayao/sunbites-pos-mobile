import { StyleSheet } from "react-native";
import { Snackbar } from "react-native-paper";
import { create } from "zustand";
import { palette } from "@/theme";

type ToastVariant = "success" | "error";

interface ToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: "",
  variant: "success",
  show: (message, variant = "success") =>
    set({ visible: true, message, variant }),
  hide: () => set({ visible: false }),
}));

export function useToast() {
  const { show } = useToastStore();
  return {
    success: (msg: string) => show(msg, "success"),
    error: (msg: string) => show(msg, "error"),
  };
}

export function ErrorToast() {
  const { visible, message, variant, hide } = useToastStore();

  return (
    <Snackbar
      visible={visible}
      onDismiss={hide}
      duration={3000}
      style={variant === "error" ? styles.error : styles.success}
      action={{ label: "✕", onPress: hide }}
    >
      {message}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: palette.red500,
  },
  success: {
    backgroundColor: palette.green500,
  },
});

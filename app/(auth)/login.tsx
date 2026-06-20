import { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as NativeTextInput,
} from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/api/auth";
import { getApiError } from "@/lib/errors";
import { AppLogo } from "@/components/shared/AppLogo";
import { palette } from "@/theme";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

const MAX_ATTEMPTS = 5;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const { login } = useAuthStore();

  const passwordRef = useRef<NativeTextInput>(null);

  const isLocked = failCount >= MAX_ATTEMPTS;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    if (isLocked) return;
    setLoading(true);
    setServerError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      setFailCount(0);
      await login(res.data.token, res.data.user);
      router.replace("/(auth)/branch");
    } catch (err: unknown) {
      if (__DEV__) {
        console.log(
          "[Login] error:",
          isAxiosError(err)
            ? `code=${err.code} status=${err.response?.status} url=${err.config?.baseURL}${err.config?.url}`
            : String(err),
        );
      }
      setFailCount((n) => n + 1);
      // Use generic message for 401/422 to prevent email enumeration
      if (
        isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 422)
      ) {
        setServerError("Incorrect email or password.");
      } else {
        setServerError(getApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // On Android, behavior="height" causes a layout shift when the keyboard
    // dismisses on button tap, making the touch land on the email input instead.
    // Disabling the behavior on Android avoids the shift entirely.
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppLogo variant="login" />
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign in to your account
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Email"
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  testID="email-input"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.email}
                  accessibilityLabel="Email address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email?.message}
                </HelperText>
              </>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  label="Password"
                  mode="outlined"
                  secureTextEntry={!passwordVisible}
                  autoComplete="password"
                  testID="password-input"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.password}
                  accessibilityLabel="Password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  render={(props) => (
                    <NativeTextInput {...props} ref={passwordRef} />
                  )}
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? "eye-off" : "eye"}
                      onPress={() => setPasswordVisible((v) => !v)}
                      accessibilityLabel={
                        passwordVisible ? "Hide password" : "Show password"
                      }
                      accessibilityRole="button"
                    />
                  }
                />
                <HelperText type="error" visible={!!errors.password}>
                  {errors.password?.message}
                </HelperText>
              </>
            )}
          />

          {serverError !== null && (
            <HelperText type="error" visible style={styles.serverError}>
              {serverError}
            </HelperText>
          )}

          {isLocked && (
            <HelperText type="error" visible style={styles.serverError}>
              Too many failed attempts. Please contact your administrator to
              reset your password.
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading || isLocked}
            style={styles.button}
            contentStyle={styles.buttonContent}
            testID="login-submit"
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            Sign In
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.zinc100 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: { alignItems: "center", marginBottom: 40, gap: 8 },
  subtitle: { color: palette.zinc500, marginTop: 4 },
  form: { gap: 4 },
  serverError: { fontSize: 14 },
  button: { marginTop: 12 },
  buttonContent: { paddingVertical: 6 },
});

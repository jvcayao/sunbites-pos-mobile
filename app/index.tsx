import { SplashScreen } from "@/components/shared/SplashScreen";

// Initial Expo Router entry point at path "/".
// AppBootstrap in app/_layout.tsx immediately redirects away from here
// to /(auth)/login or /(auth)/branch based on the stored session token.
export default function Index() {
  return <SplashScreen />;
}

import { useEffect, useRef } from "react";
import Echo from "laravel-echo";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
// pusher-js/react-native exports the class as a named property, not the default
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pusher } = require("pusher-js/react-native") as { Pusher: any };

const UNREAD_COUNT_KEY = ["staff-notifications-unread-count"];

interface EchoInstance {
  private(channel: string): { notification(cb: () => void): void };
  disconnect(): void;
}

export function EchoProvider(): null {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const echoRef = useRef<EchoInstance | null>(null);

  useEffect(() => {
    if (!token || userId === undefined) return;

    let echo: EchoInstance | null = null;

    try {
      const instance = new Echo({
        broadcaster: "reverb",
        key: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.EXPO_PUBLIC_REVERB_HOST,
        wsPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 8080),
        wssPort: Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 8080),
        forceTLS: process.env.EXPO_PUBLIC_REVERB_SCHEME === "https",
        enabledTransports: __DEV__ ? ["ws", "wss"] : ["wss"],
        withoutInterceptors: true,
        authEndpoint: `${process.env.EXPO_PUBLIC_API_URL}/broadcasting/auth`,
        auth: {
          headers: { Authorization: `Bearer ${token}` },
        },
        Pusher,
      });

      echo = instance as unknown as EchoInstance;
      echoRef.current = echo;

      echo.private(`staff.${userId}`).notification(() => {
        void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
      });
    } catch (err) {
      if (__DEV__) {
        console.warn("[EchoProvider] Failed to connect to Reverb:", err);
      }
    }

    return () => {
      if (echoRef.current) {
        try {
          echoRef.current.disconnect();
        } catch {
          // ignore disconnect errors
        }
        echoRef.current = null;
      }
    };
  }, [token, userId, queryClient]);

  return null;
}

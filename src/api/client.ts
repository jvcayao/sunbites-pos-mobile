import { create } from "axios";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { queryClient } from "@/lib/queryClient";

const client = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { Accept: "application/json" },
});

client.interceptors.request.use((config) => {
  const { token, activeBranch } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (activeBranch) config.headers["X-Branch-Id"] = String(activeBranch.id);
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Token is already invalid — skip the API call, just tear down locally
      await useAuthStore.getState().logout();
      useCartStore.getState().clearCart();
      queryClient.clear();
      router.replace("/(auth)/login");
    }
    return Promise.reject(error);
  },
);

export default client;

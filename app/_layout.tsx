import { useEffect, useState } from 'react'
import { Stack, router } from 'expo-router'
import { SplashScreen } from '@/components/shared/SplashScreen'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { PaperProvider } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore, TOKEN_KEY } from '@/store/auth'
import { authApi } from '@/api/auth'
import { lightTheme } from '@/theme'
import { ErrorToast } from '@/components/shared/ErrorToast'

function AppBootstrap() {
  const [ready, setReady] = useState(false)
  const { logout } = useAuthStore()

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY)
        if (!token) {
          router.replace('/(auth)/login')
          return
        }
        useAuthStore.setState({ token })
        const res = await authApi.me()
        useAuthStore.setState({ user: res.data })
        router.replace('/(auth)/branch')
      } catch {
        await logout()
        router.replace('/(auth)/login')
      } finally {
        setReady(true)
      }
    }
    bootstrap()
  }, [logout])

  if (!ready) {
    return <SplashScreen />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider
        theme={lightTheme}
        settings={{
          icon: ({ name, ...rest }) => (
            <MaterialCommunityIcons name={name as React.ComponentProps<typeof MaterialCommunityIcons>['name']} {...(rest as any)} />
          ),
        }}
      >
        <AppBootstrap />
        <ErrorToast />
      </PaperProvider>
    </QueryClientProvider>
  )
}
